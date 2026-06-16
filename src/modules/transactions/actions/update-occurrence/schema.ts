import z from 'zod';

import { TransactionStatusEnum } from '../../constants/transaction-status';

export const updateOccurrenceSchema = z.object({
  occurrenceId: z.string().uuid(),

  // occurrence fields
  status: z.nativeEnum(TransactionStatusEnum),
  notes: z.string().trim().max(500).nullable().optional(),

  // transaction fields
  description: z.string().trim().max(500).nullable().optional(),
  amountInCents: z.number().int().positive(),
  dueDate: z.date(),
  walletId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
});
