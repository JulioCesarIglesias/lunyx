import dayjs from 'dayjs';

import { transactionOccurrencesTable } from '@/infrastructure/db/schema';

import { FrequencyTypeEnum } from '../constants/frequency-types';
import { RECURRING_OCCURRENCES_COUNT } from '../constants/recurring';

type CreateOccurrencesInput = {
  transactionId: string;
  amountTotalInCents: number;
  installments: number;
  frequencyType: FrequencyTypeEnum;
  startDate: Date;
};

export function buildOccurrenceRows(
  input: CreateOccurrencesInput,
): (typeof transactionOccurrencesTable.$inferInsert)[] {
  const {
    transactionId,
    amountTotalInCents,
    installments,
    frequencyType,
    startDate,
  } = input;

  if (frequencyType === FrequencyTypeEnum.ONE_TIME) {
    return [
      {
        transactionId,
        occurrenceDate: startDate,
        dueDate: startDate,
        amountInCents: amountTotalInCents,
        installmentNumber: null,
        installmentTotal: null,
        status: 'pending',
      },
    ];
  }

  if (frequencyType === FrequencyTypeEnum.INSTALLMENT) {
    const count = Math.max(1, installments);
    const amountPerInstallment = Math.floor(amountTotalInCents / count);
    const remainder = amountTotalInCents - amountPerInstallment * count;

    return Array.from({ length: count }, (_, index) => {
      const dueDate = dayjs(startDate).add(index, 'month').toDate();
      const isLast = index === count - 1;
      const amountInCents = isLast
        ? amountPerInstallment + remainder
        : amountPerInstallment;

      return {
        transactionId,
        occurrenceDate: dueDate,
        dueDate,
        amountInCents,
        installmentNumber: index + 1,
        installmentTotal: count,
        status: 'pending' as const,
      };
    });
  }

  if (frequencyType === FrequencyTypeEnum.RECURRING) {
    const count = RECURRING_OCCURRENCES_COUNT;

    return Array.from({ length: count }, (_, index) => {
      const dueDate = dayjs(startDate).add(index, 'month').toDate();

      return {
        transactionId,
        occurrenceDate: dueDate,
        dueDate,
        amountInCents: amountTotalInCents,
        installmentNumber: index + 1,
        installmentTotal: count,
        status: 'pending' as const,
      };
    });
  }

  return [];
}
