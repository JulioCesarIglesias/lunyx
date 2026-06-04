import dayjs from 'dayjs';
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm';

import { db } from '@/infrastructure/db';
import {
  transactionOccurrencesTable,
  transactionsTable,
} from '@/infrastructure/db/schema';

import { TransactionTypeEnum } from '../../constants/transaction-types';
import {
  OccurrenceWithRelations,
  TransactionForOccurrence,
  TransactionSummary,
} from '../../types/occurrence-with-relations';
import {
  TransactionFilters,
  transactionFiltersSchema,
} from './schema';

function getDefaultFilters(): Required<Pick<TransactionFilters, 'month' | 'year'>> {
  const now = dayjs();
  return {
    month: now.month() + 1,
    year: now.year(),
  };
}

function getMonthRange(filters: TransactionFilters) {
  const month = filters.month ?? getDefaultFilters().month;
  const year = filters.year ?? getDefaultFilters().year;

  return {
    startOfMonth: dayjs()
      .year(year)
      .month(month - 1)
      .startOf('month')
      .toDate(),
    endOfMonth: dayjs().year(year).month(month - 1).endOf('month').toDate(),
  };
}

export function parseTransactionFilters(
  searchParams: Record<string, string | string[] | undefined>,
): TransactionFilters {
  const defaults = getDefaultFilters();

  const raw = {
    month: searchParams.month ?? defaults.month,
    year: searchParams.year ?? defaults.year,
    walletId:
      typeof searchParams.walletId === 'string'
        ? searchParams.walletId
        : undefined,
    categoryId:
      typeof searchParams.categoryId === 'string'
        ? searchParams.categoryId
        : undefined,
    transactionType:
      typeof searchParams.transactionType === 'string'
        ? searchParams.transactionType
        : undefined,
  };

  return transactionFiltersSchema.parse(raw);
}

function buildTransactionFilters(
  userId: string,
  filters: TransactionFilters,
) {
  const conditions = [eq(transactionsTable.userId, userId)];

  if (filters.walletId) {
    conditions.push(eq(transactionsTable.walletId, filters.walletId));
  }

  if (filters.categoryId) {
    conditions.push(eq(transactionsTable.categoryId, filters.categoryId));
  }

  if (filters.transactionType) {
    conditions.push(
      eq(transactionsTable.transactionType, filters.transactionType),
    );
  }

  return and(...conditions);
}

function toTransactionForOccurrence(
  transaction: typeof transactionsTable.$inferSelect & {
    wallet: TransactionForOccurrence['wallet'];
    category: TransactionForOccurrence['category'];
    occurrences: (typeof transactionOccurrencesTable.$inferSelect)[];
  },
): TransactionForOccurrence {
  const { occurrences: _occurrences, ...rest } = transaction;
  return rest;
}

export async function getOccurrences(
  userId: string,
  filters: TransactionFilters,
): Promise<OccurrenceWithRelations[]> {
  const { startOfMonth, endOfMonth } = getMonthRange(filters);

  const transactions = await db.query.transactionsTable.findMany({
    where: buildTransactionFilters(userId, filters),
    with: {
      wallet: true,
      category: true,
      occurrences: {
        where: and(
          eq(transactionOccurrencesTable.isDeleted, false),
          gte(transactionOccurrencesTable.dueDate, startOfMonth),
          lte(transactionOccurrencesTable.dueDate, endOfMonth),
        ),
        orderBy: [desc(transactionOccurrencesTable.dueDate)],
      },
    },
    orderBy: [desc(transactionsTable.startDate), asc(transactionsTable.title)],
  });

  const flat: OccurrenceWithRelations[] = [];

  for (const transaction of transactions) {
    const transactionData = toTransactionForOccurrence(transaction);

    for (const occurrence of transaction.occurrences) {
      flat.push({
        ...occurrence,
        transaction: transactionData,
      });
    }
  }

  return flat.sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
  );
}

export async function getOccurrenceSummary(
  userId: string,
  filters: TransactionFilters,
): Promise<TransactionSummary> {
  const occurrences = await getOccurrences(userId, filters);

  const totalIncomeInCents = occurrences
    .filter((o) => o.transaction.transactionType === TransactionTypeEnum.INCOME)
    .reduce((sum, o) => sum + o.amountInCents, 0);

  const totalExpenseInCents = occurrences
    .filter((o) => o.transaction.transactionType === TransactionTypeEnum.EXPENSE)
    .reduce((sum, o) => sum + o.amountInCents, 0);

  return {
    totalIncomeInCents,
    totalExpenseInCents,
    balanceInCents: totalIncomeInCents - totalExpenseInCents,
  };
}

export async function getWalletsForSelect(userId: string) {
  return db.query.walletsTable.findMany({
    where: (wallets, { eq, and }) =>
      and(eq(wallets.userId, userId), eq(wallets.isActive, true)),
    columns: { id: true, name: true, color: true },
    orderBy: (wallets, { asc }) => [asc(wallets.name)],
  });
}

export async function getCategoriesForSelect(userId: string) {
  return db.query.categoriesTable.findMany({
    where: (categories, { eq }) => eq(categories.userId, userId),
    columns: { id: true, name: true },
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
}
