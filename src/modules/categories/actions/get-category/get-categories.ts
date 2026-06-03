import { asc, count, eq, sql } from 'drizzle-orm';

import { db } from '@/infrastructure/db';
import { categoriesTable, transactionsTable } from '@/infrastructure/db/schema';

export async function getCategories(userId: string) {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      userId: categoriesTable.userId,

      createdAt: categoriesTable.createdAt,
      updatedAt: categoriesTable.updatedAt,

      transactionCount: count(transactionsTable.id),

      amountInCents: sql<number>`
        COALESCE(
          SUM(${transactionsTable.amountTotalInCents}),
          0
        )
      `,
    })
    .from(categoriesTable)
    .leftJoin(
      transactionsTable,
      eq(transactionsTable.categoryId, categoriesTable.id),
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
