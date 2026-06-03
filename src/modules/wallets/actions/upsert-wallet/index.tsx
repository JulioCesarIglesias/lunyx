'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { db } from '@/infrastructure/db';
import { walletsTable } from '@/infrastructure/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

import { upsertWalletSchema } from './schema';

export const upsertWallet = actionClient
  .schema(upsertWalletSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    await db
      .insert(walletsTable)
      .values({ ...parsedInput, id: parsedInput.id, userId: session.user.id })
      .onConflictDoUpdate({
        target: [walletsTable.id],
        set: { ...parsedInput },
      });

    revalidatePath('/wallets');
  });
