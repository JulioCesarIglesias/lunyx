import dayjs from 'dayjs';
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm';

import { db } from '@/infrastructure/db';
import {
  categoriesTable,
  transactionOccurrencesTable,
  transactionsTable,
  walletsTable,
} from '@/infrastructure/db/schema';

import { TransactionStatusEnum } from '../../constants/transaction-status';
import { TransactionTypeEnum } from '../../constants/transaction-types';
import {
  OccurrenceWithRelations,
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

export async function getOccurrences(
  userId: string,
  filters: TransactionFilters,
): Promise<OccurrenceWithRelations[]> {
  const { startOfMonth, endOfMonth } = getMonthRange(filters);

  const conditions = [
    buildTransactionFilters(userId, filters),
    eq(transactionsTable.isActive, true),
    eq(transactionOccurrencesTable.isDeleted, false),
    gte(transactionOccurrencesTable.dueDate, startOfMonth),
    lte(transactionOccurrencesTable.dueDate, endOfMonth),
  ];

  const rows = await db
    .select({
      occurrence: transactionOccurrencesTable,
      transaction: transactionsTable,
      wallet: walletsTable,
      category: categoriesTable,
    })
    .from(transactionOccurrencesTable)
    .innerJoin(
      transactionsTable,
      eq(transactionOccurrencesTable.transactionId, transactionsTable.id),
    )
    .innerJoin(
      walletsTable,
      and(
        eq(transactionsTable.walletId, walletsTable.id),
        eq(transactionsTable.userId, walletsTable.userId),
      ),
    )
    .leftJoin(
      categoriesTable,
      and(
        eq(transactionsTable.categoryId, categoriesTable.id),
        eq(transactionsTable.userId, categoriesTable.userId),
      ),
    )
    .where(and(...conditions))
    .orderBy(
      desc(transactionOccurrencesTable.dueDate),
      asc(transactionsTable.title),
    );

  return rows.map(({ occurrence, transaction, wallet, category }) => ({
    ...occurrence,
    transaction: {
      ...transaction,
      wallet,
      category,
    },
  }));
}

export function summarizeOccurrences(
  occurrences: OccurrenceWithRelations[],
): TransactionSummary {
  const totalIncomeInCents = occurrences.reduce(
    (sum, occurrence) =>
      occurrence.status !== TransactionStatusEnum.CANCELED &&
      occurrence.transaction.transactionType === TransactionTypeEnum.INCOME
        ? sum + occurrence.amountInCents
        : sum,
    0,
  );
  const totalExpenseInCents = occurrences.reduce(
    (sum, occurrence) =>
      occurrence.status !== TransactionStatusEnum.CANCELED &&
      occurrence.transaction.transactionType === TransactionTypeEnum.EXPENSE
        ? sum + occurrence.amountInCents
        : sum,
    0,
  );

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
