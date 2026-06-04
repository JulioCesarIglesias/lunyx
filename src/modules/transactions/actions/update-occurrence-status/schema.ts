import z from 'zod';

import { TransactionStatusEnum } from '../../constants/transaction-status';

export const updateOccurrenceStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(TransactionStatusEnum),
});

export const bulkUpdateOccurrenceStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Selecione ao menos uma linha'),
  status: z.nativeEnum(TransactionStatusEnum),
});
