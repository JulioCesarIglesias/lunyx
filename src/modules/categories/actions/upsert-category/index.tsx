'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { db } from '@/infrastructure/db';
import { categoriesTable } from '@/infrastructure/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

import { upsertCategorySchema } from './schema';

export const upsertCategory = actionClient
  .schema(upsertCategorySchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    await db
      .insert(categoriesTable)
      .values({ ...parsedInput, id: parsedInput.id, userId: session.user.id })
      .onConflictDoUpdate({
        target: [categoriesTable.id],
        set: { ...parsedInput },
      });

    revalidatePath('/categories');
  });
