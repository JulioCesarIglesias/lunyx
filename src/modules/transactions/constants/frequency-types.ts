export enum FrequencyTypeEnum {
  ONE_TIME = 'one_time',
  INSTALLMENT = 'installment',
  RECURRING = 'recurring',
}

export const frequencyTypeLabels: Record<FrequencyTypeEnum, string> = {
  [FrequencyTypeEnum.ONE_TIME]: 'Única',
  [FrequencyTypeEnum.INSTALLMENT]: 'Parcelada',
  [FrequencyTypeEnum.RECURRING]: 'Recorrente',
};

export const frequencyTypeOptions = Object.values(FrequencyTypeEnum).map(
  (value) => ({
    value,
    label: frequencyTypeLabels[value],
  }),
);
