'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

import { db } from '@/infrastructure/db';
import { transactionsTable, walletsTable } from '@/infrastructure/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

export const deleteWallet = actionClient
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
    await db.transaction(async (tx) => {
      const [wallet] = await tx
        .select({ id: walletsTable.id })
        .from(walletsTable)
        .where(
          and(
            eq(walletsTable.id, parsedInput.id),
            eq(walletsTable.userId, session.user.id),
          ),
        )
        .for('update')
        .limit(1);

      if (!wallet) throw new Error('Carteira não encontrada');

      const [transaction] = await tx
        .select({ id: transactionsTable.id })
        .from(transactionsTable)
        .where(eq(transactionsTable.walletId, wallet.id))
        .limit(1);

      if (transaction) {
        throw new Error(
          'Esta carteira possui transações. Desative-a para manter seu histórico financeiro.',
        );
      }

      await tx
        .delete(walletsTable)
        .where(
          and(
            eq(walletsTable.id, wallet.id),
            eq(walletsTable.userId, session.user.id),
          ),
        );
    });
    revalidatePath('/wallets');
  });
