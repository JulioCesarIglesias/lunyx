'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { ArrowRightLeft } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { type ReactNode, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  categoriesTable,
  transactionsTable,
  walletsTable,
} from '@/infrastructure/db/schema';

import { upsertTransaction } from '../actions/upsert-transaction';
import {
  FrequencyTypeEnum,
  frequencyTypeOptions,
} from '../constants/frequency-types';
import {
  PaymentMethodEnum,
  paymentMethodOptions,
} from '../constants/payment-methods';
import {
  TransactionTypeEnum,
  transactionTypeOptions,
} from '../constants/transaction-types';
import { centsToReais } from '../helpers/format-currency';

const NONE_CATEGORY = 'none';

const formSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Título é obrigatório')
      .max(120, 'Máximo de 120 caracteres'),
    description: z.string().trim().max(500).optional().nullable(),
    walletId: z.string().uuid({ message: 'Selecione uma carteira' }),
    categoryId: z.string().uuid().nullable().optional(),
    transactionType: z.nativeEnum(TransactionTypeEnum, {
      message: 'Selecione o tipo da transação',
    }),
    paymentMethod: z.nativeEnum(PaymentMethodEnum, {
      message: 'Selecione a forma de pagamento',
    }),
    frequencyType: z.nativeEnum(FrequencyTypeEnum, {
      message: 'Selecione a frequência',
    }),
    amountInReais: z
      .number({ error: 'Valor é obrigatório' })
      .positive('Valor deve ser maior que zero'),
    installments: z.number().int().min(1).max(120),
    startDate: z.date({ message: 'Data é obrigatória' }),
    isActive: z.boolean(),
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

type FormSchema = z.infer<typeof formSchema>;

type WalletOption = Pick<
  typeof walletsTable.$inferSelect,
  'id' | 'name' | 'color'
>;

type CategoryOption = Pick<typeof categoriesTable.$inferSelect, 'id' | 'name'>;

interface UpsertTransactionFormProps {
  isOpen: boolean;
  transaction?: typeof transactionsTable.$inferSelect;
  wallets: WalletOption[];
  categories: CategoryOption[];
  onSuccess?: () => void;
}

function getDefaultValues(
  transaction?: typeof transactionsTable.$inferSelect,
  wallets?: WalletOption[],
): FormSchema {
  return {
    title: transaction?.title ?? '',
    description: transaction?.description ?? '',
    walletId: transaction?.walletId ?? wallets?.[0]?.id ?? '',
    categoryId: transaction?.categoryId ?? null,
    transactionType:
      (transaction?.transactionType as TransactionTypeEnum) ??
      TransactionTypeEnum.EXPENSE,
    paymentMethod:
      (transaction?.paymentMethod as FormSchema['paymentMethod']) ??
      PaymentMethodEnum.PIX,
    frequencyType:
      (transaction?.frequencyType as FrequencyTypeEnum) ??
      FrequencyTypeEnum.ONE_TIME,
    amountInReais: transaction
      ? centsToReais(transaction.amountTotalInCents)
      : (undefined as unknown as number),
    installments: transaction?.installments ?? 1,
    startDate: transaction?.startDate
      ? new Date(transaction.startDate)
      : new Date(),
    isActive: transaction?.isActive ?? true,
  };
}

function FieldWrapper({
  invalid,
  label,
  error,
  children,
}: {
  invalid: boolean;
  label: string;
  error?: { message?: string };
  children: ReactNode;
}) {
  return (
    <Field data-invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      {children}
      {invalid && <FieldError errors={[error]} />}
    </Field>
  );
}

const UpsertTransactionForm = ({
  isOpen,
  transaction,
  wallets,
  categories,
  onSuccess,
}: UpsertTransactionFormProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(transaction, wallets),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const frequencyType = useWatch({
    control: form.control,
    name: 'frequencyType',
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset(getDefaultValues(transaction, wallets));
  }, [isOpen, transaction, wallets, form]);

  const upsertTransactionAction = useAction(upsertTransaction, {
    onSuccess: () => {
      toast.success(
        transaction
          ? 'Transação atualizada com sucesso'
          : 'Transação criada com sucesso',
      );
      form.reset();
      onSuccess?.();
    },
    onError: ({ error }) => {
      if (error.validationErrors) {
        toast.error('Verifique os campos destacados');
        return;
      }
      toast.error(error.serverError ?? 'Erro ao salvar transação');
    },
  });

  const onSubmit = (data: FormSchema) => {
    upsertTransactionAction.execute({
      ...data,
      id: transaction?.id,
      categoryId: data.categoryId ?? null,
      description: data.description?.trim() ? data.description.trim() : null,
      isActive: transaction ? data.isActive : true,
      startDate: data.startDate,
    });
  };

  const onInvalid = () => {
    toast.error('Preencha os campos obrigatórios corretamente');
  };

  const hasWallets = wallets.length > 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onSuccess?.();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar' : 'Nova'} transação</DialogTitle>
          <DialogDescription>
            {transaction
              ? 'Atualize os dados da transação'
              : 'Registre uma receita, despesa ou transferência'}
          </DialogDescription>
        </DialogHeader>

        {!hasWallets ? (
          <p className="text-muted-foreground text-sm">
            Cadastre ao menos uma carteira antes de criar transações.
          </p>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="space-y-4"
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <FieldWrapper
                    invalid={fieldState.invalid}
                    label="Título"
                    error={fieldState.error}
                  >
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Ex: Aluguel, Salário..."
                        aria-invalid={fieldState.invalid}
                      />
                    </div>
                  </FieldWrapper>
                )}
              />

              <Controller
                control={form.control}
                name="transactionType"
                render={({ field, fieldState }) => (
                  <FieldWrapper
                    invalid={fieldState.invalid}
                    label="Tipo"
                    error={fieldState.error}
                  >
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="h-11 w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Tipo da transação" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {transactionTypeOptions.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="walletId"
                  render={({ field, fieldState }) => (
                    <FieldWrapper
                      invalid={fieldState.invalid}
                      label="Carteira"
                      error={fieldState.error}
                    >
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className="h-11 w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {wallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldWrapper>
                  )}
                />

                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field, fieldState }) => (
                    <FieldWrapper
                      invalid={fieldState.invalid}
                      label="Categoria"
                      error={fieldState.error}
                    >
                      <Select
                        value={field.value ?? NONE_CATEGORY}
                        onValueChange={(value) =>
                          field.onChange(value === NONE_CATEGORY ? null : value)
                        }
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value={NONE_CATEGORY}>
                            Sem categoria
                          </SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldWrapper>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="amountInReais"
                render={({ field, fieldState }) => (
                  <FieldWrapper
                    invalid={fieldState.invalid}
                    label="Valor"
                    error={fieldState.error}
                  >
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      decimalScale={2}
                      allowNegative={false}
                      value={
                        field.value === undefined || Number.isNaN(field.value)
                          ? ''
                          : field.value
                      }
                      onValueChange={(values) => {
                        field.onChange(values.floatValue);
                      }}
                      onBlur={field.onBlur}
                      className=""
                      aria-invalid={fieldState.invalid}
                    />
                  </FieldWrapper>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="paymentMethod"
                  render={({ field, fieldState }) => (
                    <FieldWrapper
                      invalid={fieldState.invalid}
                      label="Forma de pagamento"
                      error={fieldState.error}
                    >
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className="h-11 w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {paymentMethodOptions.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldWrapper>
                  )}
                />

                <Controller
                  control={form.control}
                  name="frequencyType"
                  render={({ field, fieldState }) => (
                    <FieldWrapper
                      invalid={fieldState.invalid}
                      label="Frequência"
                      error={fieldState.error}
                    >
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className="h-11 w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {frequencyTypeOptions.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldWrapper>
                  )}
                />
              </div>

              {frequencyType === FrequencyTypeEnum.INSTALLMENT && (
                <Controller
                  control={form.control}
                  name="installments"
                  render={({ field, fieldState }) => (
                    <FieldWrapper
                      invalid={fieldState.invalid}
                      label="Parcelas"
                      error={fieldState.error}
                    >
                      <Input
                        type="number"
                        min={2}
                        max={120}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-11"
                        aria-invalid={fieldState.invalid}
                      />
                    </FieldWrapper>
                  )}
                />
              )}

              <Controller
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <FieldWrapper
                    invalid={fieldState.invalid}
                    label="Data"
                    error={fieldState.error}
                  >
                    <Input
                      type="date"
                      className=""
                      value={dayjs(field.value).format('YYYY-MM-DD')}
                      onChange={(e) => {
                        const parsed = dayjs(e.target.value);
                        field.onChange(
                          parsed.isValid() ? parsed.toDate() : new Date(),
                        );
                      }}
                      aria-invalid={fieldState.invalid}
                    />
                  </FieldWrapper>
                )}
              />

              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FieldWrapper
                    invalid={fieldState.invalid}
                    label="Descrição (opcional)"
                    error={fieldState.error}
                  >
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Observações sobre a transação"
                      rows={3}
                      aria-invalid={fieldState.invalid}
                    />
                  </FieldWrapper>
                )}
              />

              {transaction && (
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <Field className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div>
                        <FieldLabel>Ativa</FieldLabel>
                        <p className="text-muted-foreground text-xs">
                          Transações inativas não aparecem nos relatórios
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              )}
            </FieldGroup>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button" className="cursor-pointer">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={upsertTransactionAction.isExecuting}
                className="cursor-pointer"
              >
                {upsertTransactionAction.isExecuting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpsertTransactionForm;
