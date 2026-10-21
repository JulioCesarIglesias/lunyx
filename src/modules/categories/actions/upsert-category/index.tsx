'use server';

import { and, eq } from 'drizzle-orm';
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

    if (parsedInput.id) {
      const [updated] = await db
        .update(categoriesTable)
        .set({ name: parsedInput.name })
        .where(
          and(
            eq(categoriesTable.id, parsedInput.id),
            eq(categoriesTable.userId, session.user.id),
          ),
        )
        .returning({ id: categoriesTable.id });

      if (!updated) throw new Error('Categoria não encontrada');
    } else {
      await db.insert(categoriesTable).values({
        name: parsedInput.name,
        userId: session.user.id,
      });
    }

    revalidatePath('/categories');
    revalidatePath('/transactions');
  });
