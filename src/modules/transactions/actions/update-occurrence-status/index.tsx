'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { db } from '@/infrastructure/db';
import {
  transactionOccurrencesTable,
  transactionsTable,
} from '@/infrastructure/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

import { TransactionStatusEnum } from '../../constants/transaction-status';
import {
  bulkUpdateOccurrenceStatusSchema,
  updateOccurrenceStatusSchema,
} from './schema';

async function assertOccurrenceOwnership(occurrenceId: string, userId: string) {
  const row = await db
    .select({ id: transactionOccurrencesTable.id })
    .from(transactionOccurrencesTable)
    .innerJoin(
      transactionsTable,
      eq(transactionOccurrencesTable.transactionId, transactionsTable.id),
    )
    .where(
      and(
        eq(transactionOccurrencesTable.id, occurrenceId),
        eq(transactionsTable.userId, userId),
        eq(transactionOccurrencesTable.isDeleted, false),
      ),
    )
    .limit(1);

  if (!row.length) {
    throw new Error('Lançamento não encontrado');
  }
}

function paidAtForStatus(status: TransactionStatusEnum): Date | null {
  return status === TransactionStatusEnum.PAID ? new Date() : null;
}

export const updateOccurrenceStatus = actionClient
  .schema(updateOccurrenceStatusSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    await assertOccurrenceOwnership(parsedInput.id, session.user.id);

    await db
      .update(transactionOccurrencesTable)
      .set({
        status: parsedInput.status,
        paidAt: paidAtForStatus(parsedInput.status),
      })
      .where(eq(transactionOccurrencesTable.id, parsedInput.id));

    revalidatePath('/transactions');
  });

export const bulkUpdateOccurrenceStatus = actionClient
  .schema(bulkUpdateOccurrenceStatusSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const owned = await db
      .select({ id: transactionOccurrencesTable.id })
      .from(transactionOccurrencesTable)
      .innerJoin(
        transactionsTable,
        eq(transactionOccurrencesTable.transactionId, transactionsTable.id),
      )
      .where(
        and(
          inArray(transactionOccurrencesTable.id, parsedInput.ids),
          eq(transactionsTable.userId, session.user.id),
          eq(transactionOccurrencesTable.isDeleted, false),
        ),
      );

    if (owned.length !== parsedInput.ids.length) {
      throw new Error('Um ou mais lançamentos não foram encontrados');
    }

    await db
      .update(transactionOccurrencesTable)
      .set({
        status: parsedInput.status,
        paidAt: paidAtForStatus(parsedInput.status),
      })
      .where(inArray(transactionOccurrencesTable.id, parsedInput.ids));

    revalidatePath('/transactions');
  });
