import z from 'zod';

import { walletColors } from '../../constants/wallet-colors';
import { WalletTypeEnum } from '../../constants/wallet-types';

export const upsertWalletSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Máximo de 50 caracteres'),
  type: z.nativeEnum(WalletTypeEnum),
  color: z.enum(walletColors.map((color) => color.value)),
  isActive: z.boolean().optional(),
});

export type UpsertWalletSchema = z.infer<typeof upsertWalletSchema>;
