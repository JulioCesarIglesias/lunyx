import z from 'zod';

export const upsertCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string({ message: 'Nome é obrigatório' })
    .trim()
    .min(1, { message: 'Nome é obrigatório' })
    .max(50, { message: 'Máximo de 50 caracteres' }),
});

export type UpsertCategorySchema = z.infer<typeof upsertCategorySchema>;
