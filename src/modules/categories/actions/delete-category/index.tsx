'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

import { db } from '@/infrastructure/db';
import { categoriesTable } from '@/infrastructure/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

export const deleteCategory = actionClient
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
    const category = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.id, parsedInput.id),
    });
    if (!category) {
      throw new Error('Categoria não encontrada');
    }
    if (category.userId !== session.user.id) {
      throw new Error('Categoria não encontrada');
    }
    await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, parsedInput.id));
    revalidatePath('/categories');
  });
