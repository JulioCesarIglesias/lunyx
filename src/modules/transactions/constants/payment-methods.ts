export enum PaymentMethodEnum {
  CASH = 'cash',
  PIX = 'pix',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  BOLETO = 'boleto',
}

export const paymentMethodLabels: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.CASH]: 'Dinheiro',
  [PaymentMethodEnum.PIX]: 'PIX',
  [PaymentMethodEnum.CREDIT_CARD]: 'Cartão de crédito',
  [PaymentMethodEnum.DEBIT_CARD]: 'Cartão de débito',
  [PaymentMethodEnum.BANK_TRANSFER]: 'Transferência bancária',
  [PaymentMethodEnum.BOLETO]: 'Boleto',
};

export const paymentMethodOptions = Object.values(PaymentMethodEnum).map(
  (value) => ({
    value,
    label: paymentMethodLabels[value],
  }),
);
