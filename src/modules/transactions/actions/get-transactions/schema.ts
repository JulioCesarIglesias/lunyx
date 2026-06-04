import z from 'zod';

import { TransactionTypeEnum } from '../../constants/transaction-types';

export const transactionFiltersSchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
  walletId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  transactionType: z.nativeEnum(TransactionTypeEnum).optional(),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
