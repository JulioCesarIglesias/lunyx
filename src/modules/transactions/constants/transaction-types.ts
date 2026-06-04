export enum TransactionTypeEnum {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export const transactionTypeLabels: Record<TransactionTypeEnum, string> = {
  [TransactionTypeEnum.INCOME]: 'Receita',
  [TransactionTypeEnum.EXPENSE]: 'Despesa',
  [TransactionTypeEnum.TRANSFER]: 'Transferência',
};

export const transactionTypeOptions = Object.values(TransactionTypeEnum).map(
  (value) => ({
    value,
    label: transactionTypeLabels[value],
  }),
);
