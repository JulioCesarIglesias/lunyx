'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { db } from '@/infrastructure/db';
import {
  categoriesTable,
  transactionOccurrencesTable,
  transactionsTable,
  walletsTable,
} from '@/infrastructure/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

import { TransactionStatusEnum } from '../../constants/transaction-status';
import { updateOccurrenceSchema } from './schema';

function paidAtForStatus(status: TransactionStatusEnum): Date | null {
  return status === TransactionStatusEnum.PAID ? new Date() : null;
}

export const updateOccurrence = actionClient
  .schema(updateOccurrenceSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Fetch the occurrence and validate ownership in one query
    const rows = await db
      .select({
        occurrenceId: transactionOccurrencesTable.id,
        transactionId: transactionOccurrencesTable.transactionId,
      })
      .from(transactionOccurrencesTable)
      .innerJoin(
        transactionsTable,
        eq(transactionOccurrencesTable.transactionId, transactionsTable.id),
      )
      .where(
        and(
          eq(transactionOccurrencesTable.id, parsedInput.occurrenceId),
          eq(transactionsTable.userId, session.user.id),
          eq(transactionOccurrencesTable.isDeleted, false),
        ),
      )
      .limit(1);

    if (!rows.length) {
      throw new Error('Lançamento não encontrado');
    }

    const [wallet] = await db
      .select({ id: walletsTable.id })
      .from(walletsTable)
      .where(
        and(
          eq(walletsTable.id, parsedInput.walletId),
          eq(walletsTable.userId, session.user.id),
          eq(walletsTable.isActive, true),
        ),
      )
      .limit(1);

    if (!wallet) throw new Error('Carteira não encontrada ou inativa');

    if (parsedInput.categoryId) {
      const [category] = await db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(
          and(
            eq(categoriesTable.id, parsedInput.categoryId),
            eq(categoriesTable.userId, session.user.id),
          ),
        )
        .limit(1);

      if (!category) throw new Error('Categoria não encontrada');
    }

    const { transactionId } = rows[0];

    // Execute both updates in a single database transaction
    await db.transaction(async (tx) => {
      await tx
        .update(transactionOccurrencesTable)
        .set({
          status: parsedInput.status,
          paidAt: paidAtForStatus(parsedInput.status),
          notes: parsedInput.notes ?? null,
          dueDate: parsedInput.dueDate,
          amountInCents: parsedInput.amountInCents,
        })
        .where(eq(transactionOccurrencesTable.id, parsedInput.occurrenceId));

      await tx
        .update(transactionsTable)
        .set({
          description: parsedInput.description ?? null,
          walletId: parsedInput.walletId,
          categoryId: parsedInput.categoryId ?? null,
        })
        .where(eq(transactionsTable.id, transactionId));
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/categories');
  });
