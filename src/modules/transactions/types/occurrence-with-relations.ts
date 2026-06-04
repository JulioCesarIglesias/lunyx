import {
  categoriesTable,
  transactionOccurrencesTable,
  transactionsTable,
  walletsTable,
} from '@/infrastructure/db/schema';

export type TransactionForOccurrence = Omit<
  typeof transactionsTable.$inferSelect,
  'occurrences'
> & {
  wallet: typeof walletsTable.$inferSelect;
  category: typeof categoriesTable.$inferSelect | null;
};

export type OccurrenceWithRelations =
  typeof transactionOccurrencesTable.$inferSelect & {
    transaction: TransactionForOccurrence;
  };

export type TransactionSummary = {
  totalIncomeInCents: number;
  totalExpenseInCents: number;
  balanceInCents: number;
};
