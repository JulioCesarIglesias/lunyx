'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

import { db } from '@/infrastructure/db';
import { transactionsTable } from '@/infrastructure/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

export const deleteTransaction = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const transaction = await db.query.transactionsTable.findFirst({
      where: eq(transactionsTable.id, parsedInput.id),
    });

    if (!transaction || transaction.userId !== session.user.id) {
      throw new Error('Transação não encontrada');
    }

    await db
      .delete(transactionsTable)
      .where(eq(transactionsTable.id, parsedInput.id));

    revalidatePath('/transactions');
  });
