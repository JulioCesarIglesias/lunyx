export enum WalletTypeEnum {
  BANK = 'bank',
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DIGITAL_ACCOUNT = 'digital_account',
  INVESTMENT = 'investment',
}

export const walletTypeLabels: Record<WalletTypeEnum, string> = {
  [WalletTypeEnum.BANK]: 'Conta Bancária',
  [WalletTypeEnum.CASH]: 'Dinheiro',
  [WalletTypeEnum.CREDIT_CARD]: 'Cartão de Crédito',
  [WalletTypeEnum.DIGITAL_ACCOUNT]: 'Conta Digital',
  [WalletTypeEnum.INVESTMENT]: 'Investimento',
};

export const walletTypeOptions = Object.values(WalletTypeEnum).map((value) => ({
  value,
  label: walletTypeLabels[value],
}));
