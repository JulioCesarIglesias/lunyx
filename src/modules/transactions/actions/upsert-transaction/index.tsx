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

import { FrequencyTypeEnum } from '../../constants/frequency-types';
import { RECURRING_OCCURRENCES_COUNT } from '../../constants/recurring';
import { buildOccurrenceRows } from '../../helpers/create-occurrences';
import { reaisToCents } from '../../helpers/format-currency';
import { upsertTransactionSchema } from './schema';

export const upsertTransaction = actionClient
  .schema(upsertTransactionSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const amountTotalInCents = reaisToCents(parsedInput.amountInReais);
    const installments =
      parsedInput.frequencyType === FrequencyTypeEnum.INSTALLMENT
        ? parsedInput.installments
        : parsedInput.frequencyType === FrequencyTypeEnum.RECURRING
          ? RECURRING_OCCURRENCES_COUNT
          : 1;

    const startDate =
      parsedInput.startDate instanceof Date
        ? parsedInput.startDate
        : new Date(parsedInput.startDate);

    const payload = {
      userId: session.user.id,
      walletId: parsedInput.walletId,
      categoryId: parsedInput.categoryId ?? null,
      title: parsedInput.title,
      description: parsedInput.description ?? null,
      transactionType: parsedInput.transactionType,
      paymentMethod: parsedInput.paymentMethod,
      frequencyType: parsedInput.frequencyType,
      amountTotalInCents,
      installments,
      startDate,
      isActive: parsedInput.isActive ?? true,
    };

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

    if (parsedInput.id) {
      const existing = await db.query.transactionsTable.findFirst({
        where: and(
          eq(transactionsTable.id, parsedInput.id),
          eq(transactionsTable.userId, session.user.id),
        ),
      });

      if (!existing) {
        throw new Error('Transação não encontrada');
      }

      await db
        .update(transactionsTable)
        .set(payload)
        .where(eq(transactionsTable.id, parsedInput.id));
    } else {
      await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(transactionsTable)
          .values(payload)
          .returning({ id: transactionsTable.id });

        const occurrenceRows = buildOccurrenceRows({
          transactionId: created.id,
          amountTotalInCents,
          installments,
          frequencyType: parsedInput.frequencyType,
          startDate,
        });

        if (occurrenceRows.length > 0) {
          await tx.insert(transactionOccurrencesTable).values(occurrenceRows);
        }
      });
    }

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/categories');
  });
