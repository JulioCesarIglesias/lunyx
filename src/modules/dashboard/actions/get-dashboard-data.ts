import dayjs from 'dayjs';
import { and, eq, gte, lte } from 'drizzle-orm';

import { db } from '@/infrastructure/db';
import {
  transactionOccurrencesTable,
  transactionsTable,
  walletsTable,
} from '@/infrastructure/db/schema';
import { FrequencyTypeEnum } from '@/modules/transactions/constants/frequency-types';
import { TransactionTypeEnum } from '@/modules/transactions/constants/transaction-types';

export interface DashboardFilters {
  month: number;
  year: number;
}

export interface CategoryBreakdown {
  categoryId: string | null;
  categoryName: string;
  totalInCents: number;
}

export interface WalletBreakdown {
  walletId: string;
  walletName: string;
  recurringInCents: number;
  oneTimeInCents: number;
}

export interface DailyPoint {
  day: number;
  expenseInCents: number;
  incomeInCents: number;
}

export interface DashboardData {
  month: number;
  year: number;
  // KPIs
  totalIncomeInCents: number;
  totalExpenseInCents: number;
  balanceInCents: number;
  totalOccurrences: number;
  // breakdowns
  categoryBreakdown: CategoryBreakdown[];
  walletBreakdown: WalletBreakdown[];
  dailyPoints: DailyPoint[];
  // recurring vs one-time
  recurringExpenseInCents: number;
  oneTimeExpenseInCents: number;
}

export function parseDashboardFilters(
  searchParams: Record<string, string | string[] | undefined>,
): DashboardFilters {
  const now = dayjs();
  const month = Number(searchParams.month ?? now.month() + 1);
  const year = Number(searchParams.year ?? now.year());
  return {
    month: isNaN(month) || month < 1 || month > 12 ? now.month() + 1 : month,
    year: isNaN(year) || year < 2000 || year > 2100 ? now.year() : year,
  };
}

export async function getDashboardData(
  userId: string,
  filters: DashboardFilters,
): Promise<DashboardData> {
  const startOfMonth = dayjs()
    .year(filters.year)
    .month(filters.month - 1)
    .startOf('month')
    .toDate();

  const endOfMonth = dayjs()
    .year(filters.year)
    .month(filters.month - 1)
    .endOf('month')
    .toDate();

  // Single query: join occurrences → transactions → wallet + category
  const rows = await db
    .select({
      // occurrence fields
      occurrenceId: transactionOccurrencesTable.id,
      amountInCents: transactionOccurrencesTable.amountInCents,
      dueDate: transactionOccurrencesTable.dueDate,
      // transaction fields
      transactionType: transactionsTable.transactionType,
      frequencyType: transactionsTable.frequencyType,
      categoryId: transactionsTable.categoryId,
      walletId: transactionsTable.walletId,
      // wallet name (joined inline)
      walletName: walletsTable.name,
    })
    .from(transactionOccurrencesTable)
    .innerJoin(
      transactionsTable,
      eq(transactionOccurrencesTable.transactionId, transactionsTable.id),
    )
    .innerJoin(walletsTable, eq(transactionsTable.walletId, walletsTable.id))
    .where(
      and(
        eq(transactionsTable.userId, userId),
        eq(transactionOccurrencesTable.isDeleted, false),
        gte(transactionOccurrencesTable.dueDate, startOfMonth),
        lte(transactionOccurrencesTable.dueDate, endOfMonth),
      ),
    );

  // Fetch categories separately (small table, fast)
  const categoryMap = new Map<string, string>();
  const uniqueCatIds = [
    ...new Set(rows.map((r) => r.categoryId).filter(Boolean)),
  ] as string[];
  if (uniqueCatIds.length > 0) {
    const cats = await db.query.categoriesTable.findMany({
      where: (t, { inArray }) => inArray(t.id, uniqueCatIds),
      columns: { id: true, name: true },
    });
    cats.forEach((c) => categoryMap.set(c.id, c.name));
  }

  // ── Compute everything in JS (no extra queries) ──────────────────
  let totalIncomeInCents = 0;
  let totalExpenseInCents = 0;
  let recurringExpenseInCents = 0;
  let oneTimeExpenseInCents = 0;

  const catMap = new Map<string, CategoryBreakdown>();
  const walletMap = new Map<string, WalletBreakdown>();
  const dailyMap = new Map<number, DailyPoint>();

  for (const row of rows) {
    const isExpense = row.transactionType === TransactionTypeEnum.EXPENSE;
    const isIncome = row.transactionType === TransactionTypeEnum.INCOME;
    const isRecurring =
      row.frequencyType === FrequencyTypeEnum.RECURRING ||
      row.frequencyType === FrequencyTypeEnum.INSTALLMENT;

    if (isIncome) totalIncomeInCents += row.amountInCents;
    if (isExpense) {
      totalExpenseInCents += row.amountInCents;
      if (isRecurring) recurringExpenseInCents += row.amountInCents;
      else oneTimeExpenseInCents += row.amountInCents;
    }

    // Category breakdown (expenses only)
    if (isExpense) {
      const catKey = row.categoryId ?? '__none__';
      const catName = row.categoryId
        ? (categoryMap.get(row.categoryId) ?? 'Sem categoria')
        : 'Sem categoria';

      const existing = catMap.get(catKey);
      if (existing) {
        existing.totalInCents += row.amountInCents;
      } else {
        catMap.set(catKey, {
          categoryId: row.categoryId,
          categoryName: catName,
          totalInCents: row.amountInCents,
        });
      }
    }

    // Wallet breakdown
    const wExisting = walletMap.get(row.walletId);
    if (wExisting) {
      if (isExpense) {
        if (isRecurring) wExisting.recurringInCents += row.amountInCents;
        else wExisting.oneTimeInCents += row.amountInCents;
      }
    } else {
      walletMap.set(row.walletId, {
        walletId: row.walletId,
        walletName: row.walletName,
        recurringInCents: isExpense && isRecurring ? row.amountInCents : 0,
        oneTimeInCents: isExpense && !isRecurring ? row.amountInCents : 0,
      });
    }

    // Daily points
    const day = dayjs(row.dueDate).date();
    const dExisting = dailyMap.get(day);
    if (dExisting) {
      if (isExpense) dExisting.expenseInCents += row.amountInCents;
      if (isIncome) dExisting.incomeInCents += row.amountInCents;
    } else {
      dailyMap.set(day, {
        day,
        expenseInCents: isExpense ? row.amountInCents : 0,
        incomeInCents: isIncome ? row.amountInCents : 0,
      });
    }
  }

  // Sort and fill daily gaps
  const daysInMonth = dayjs()
    .year(filters.year)
    .month(filters.month - 1)
    .daysInMonth();
  const dailyPoints: DailyPoint[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dailyPoints.push(
      dailyMap.get(d) ?? { day: d, expenseInCents: 0, incomeInCents: 0 },
    );
  }

  const categoryBreakdown = [...catMap.values()].sort(
    (a, b) => b.totalInCents - a.totalInCents,
  );

  const walletBreakdown = [...walletMap.values()].sort(
    (a, b) =>
      b.recurringInCents +
      b.oneTimeInCents -
      (a.recurringInCents + a.oneTimeInCents),
  );

  return {
    month: filters.month,
    year: filters.year,
    totalIncomeInCents,
    totalExpenseInCents,
    balanceInCents: totalIncomeInCents - totalExpenseInCents,
    totalOccurrences: rows.length,
    categoryBreakdown,
    walletBreakdown,
    dailyPoints,
    recurringExpenseInCents,
    oneTimeExpenseInCents,
  };
}
