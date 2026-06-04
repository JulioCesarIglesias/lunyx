export enum TransactionStatusEnum {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELED = 'canceled',
}

export const transactionStatusLabels: Record<TransactionStatusEnum, string> = {
  [TransactionStatusEnum.PENDING]: 'Pendente',
  [TransactionStatusEnum.PAID]: 'Pago',
  [TransactionStatusEnum.OVERDUE]: 'Atrasado',
  [TransactionStatusEnum.CANCELED]: 'Cancelado',
};

export const transactionStatusOptions = Object.values(TransactionStatusEnum).map(
  (value) => ({
    value,
    label: transactionStatusLabels[value],
  }),
);
