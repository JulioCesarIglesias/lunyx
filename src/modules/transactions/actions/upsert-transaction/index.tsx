'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { db } from '@/infrastructure/db';
import {
  transactionOccurrencesTable,
  transactionsTable,
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

    if (parsedInput.id) {
      const existing = await db.query.transactionsTable.findFirst({
        where: eq(transactionsTable.id, parsedInput.id),
      });

      if (!existing || existing.userId !== session.user.id) {
        throw new Error('Transação não encontrada');
      }

      await db
        .update(transactionsTable)
        .set(payload)
        .where(eq(transactionsTable.id, parsedInput.id));
    } else {
      const [created] = await db
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
        await db.insert(transactionOccurrencesTable).values(occurrenceRows);
      }
    }

    revalidatePath('/transactions');
  });
