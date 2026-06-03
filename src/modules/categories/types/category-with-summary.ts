export interface CategoryWithSummary {
  id: string;
  name: string;
  userId: string;
  transactionCount: number;

  amountInCents: number;

  createdAt: Date;
  updatedAt: Date | null;
}
