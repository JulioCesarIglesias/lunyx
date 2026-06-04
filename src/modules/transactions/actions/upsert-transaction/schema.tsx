import z from 'zod';

import { FrequencyTypeEnum } from '../../constants/frequency-types';
import { PaymentMethodEnum } from '../../constants/payment-methods';
import { TransactionTypeEnum } from '../../constants/transaction-types';

export const upsertTransactionSchema = z
  .object({
    id: z.string().uuid().optional(),
    walletId: z.string().uuid({ message: 'Selecione uma carteira' }),
    categoryId: z.string().uuid().optional().nullable(),
    title: z
      .string()
      .trim()
      .min(1, 'Título é obrigatório')
      .max(120, 'Máximo de 120 caracteres'),
    description: z
      .string()
      .trim()
      .max(500, 'Máximo de 500 caracteres')
      .optional()
      .nullable(),
    transactionType: z.nativeEnum(TransactionTypeEnum),
    paymentMethod: z.nativeEnum(PaymentMethodEnum),
    frequencyType: z.nativeEnum(FrequencyTypeEnum),
    amountInReais: z
      .number({ error: 'Valor é obrigatório' })
      .positive('Valor deve ser maior que zero'),
    installments: z.coerce.number().int().min(1).max(120),
    startDate: z.coerce.date({ message: 'Data é obrigatória' }),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.frequencyType === FrequencyTypeEnum.INSTALLMENT &&
      data.installments < 2
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Parcelamento requer pelo menos 2 parcelas',
        path: ['installments'],
      });
    }
  });

export type UpsertTransactionSchema = z.infer<typeof upsertTransactionSchema>;
