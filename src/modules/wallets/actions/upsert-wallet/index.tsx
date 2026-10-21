'use server';

import { and,eq } from 'drizzle-orm';
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

    if (parsedInput.id) {
      const [updated] = await db
        .update(walletsTable)
        .set({
          name: parsedInput.name,
          type: parsedInput.type,
          color: parsedInput.color,
          ...(parsedInput.isActive === undefined
            ? {}
            : { isActive: parsedInput.isActive }),
        })
        .where(
          and(
            eq(walletsTable.id, parsedInput.id),
            eq(walletsTable.userId, session.user.id),
          ),
        )
        .returning({ id: walletsTable.id });

      if (!updated) throw new Error('Carteira não encontrada');
    } else {
      await db.insert(walletsTable).values({
        name: parsedInput.name,
        type: parsedInput.type,
        color: parsedInput.color,
        isActive: parsedInput.isActive ?? true,
        userId: session.user.id,
      });
    }

    revalidatePath('/wallets');
    revalidatePath('/transactions');
  });
