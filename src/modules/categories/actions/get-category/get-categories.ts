import { and, asc, countDistinct, eq, ne, sql } from 'drizzle-orm';

import { db } from '@/infrastructure/db';
import {
  categoriesTable,
  transactionOccurrencesTable,
  transactionsTable,
} from '@/infrastructure/db/schema';
import { TransactionStatusEnum } from '@/modules/transactions/constants/transaction-status';

export async function getCategories(userId: string) {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      userId: categoriesTable.userId,

      createdAt: categoriesTable.createdAt,
      updatedAt: categoriesTable.updatedAt,

      transactionCount: countDistinct(transactionOccurrencesTable.transactionId),

      amountInCents: sql<number>`
        COALESCE(SUM(${transactionOccurrencesTable.amountInCents}), 0)
      `.mapWith(Number),
    })
    .from(categoriesTable)
    .leftJoin(
      transactionsTable,
      and(
        eq(transactionsTable.categoryId, categoriesTable.id),
        eq(transactionsTable.userId, categoriesTable.userId),
        eq(transactionsTable.isActive, true),
      ),
    )
    .leftJoin(
      transactionOccurrencesTable,
      and(
        eq(transactionOccurrencesTable.transactionId, transactionsTable.id),
        eq(transactionOccurrencesTable.isDeleted, false),
        ne(transactionOccurrencesTable.status, TransactionStatusEnum.CANCELED),
      ),
    )
    .where(eq(categoriesTable.userId, userId))
    .orderBy(asc(categoriesTable.name))
    .groupBy(
      categoriesTable.id,
      categoriesTable.name,
      categoriesTable.userId,
      categoriesTable.createdAt,
      categoriesTable.updatedAt,
    );

  return categories;
}
