'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

import { db } from '@/infrastructure/db';
import { walletsTable } from '@/infrastructure/db/schema';
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
    const wallet = await db.query.walletsTable.findFirst({
      where: eq(walletsTable.id, parsedInput.id),
    });
    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }
    if (wallet.userId !== session.user.id) {
      throw new Error('Carteira não encontrada');
    }
    await db.delete(walletsTable).where(eq(walletsTable.id, parsedInput.id));
    revalidatePath('/wallets');
  });
