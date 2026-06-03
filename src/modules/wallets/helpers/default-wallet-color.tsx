import { walletColorValues } from '../constants/wallet-colors';

type WalletColor = (typeof walletColorValues)[number];

export const getDefaultColor = (color?: string | null): WalletColor => {
  return walletColorValues.includes(color as WalletColor)
    ? (color as WalletColor)
    : walletColorValues[0];
};
