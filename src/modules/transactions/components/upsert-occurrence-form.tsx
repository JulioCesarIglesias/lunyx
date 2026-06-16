'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useAction } from 'next-safe-action/hooks';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { categoriesTable, walletsTable } from '@/infrastructure/db/schema';

import { updateOccurrence } from '../actions/update-occurrence';
import {
  TransactionStatusEnum,
  transactionStatusOptions,
} from '../constants/transaction-status';
import {
  TransactionTypeEnum,
  transactionTypeLabels,
} from '../constants/transaction-types';
import { centsToReais, reaisToCents } from '../helpers/format-currency';
import { OccurrenceWithRelations } from '../types/occurrence-with-relations';

const NONE_CATEGORY = 'none';

const formSchema = z.object({
  // occurrence fields
  status: z.nativeEnum(TransactionStatusEnum, {
    message: 'Selecione um status',
  }),
  notes: z.string().trim().max(500).nullable().optional(),

  // transaction fields
  description: z.string().trim().max(500).nullable().optional(),
  amountInReais: z
    .number({ error: 'Valor é obrigatório' })
    .positive('Valor deve ser maior que zero'),
  dueDate: z.date({ message: 'Data é obrigatória' }),
  walletId: z.string().uuid({ message: 'Selecione uma carteira' }),
  categoryId: z.string().uuid().nullable().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

type WalletOption = Pick<
  typeof walletsTable.$inferSelect,
  'id' | 'name' | 'color'
>;

type CategoryOption = Pick<typeof categoriesTable.$inferSelect, 'id' | 'name'>;

interface UpsertOccurrenceFormProps {
  isOpen: boolean;
  occurrence: OccurrenceWithRelations | null;
  wallets: WalletOption[];
  categories: CategoryOption[];
  onSuccess?: () => void;
}

function getDefaultValues(
  occurrence: OccurrenceWithRelations | null,
  wallets: WalletOption[],
): FormSchema {
  return {
    status:
      (occurrence?.status as TransactionStatusEnum) ??
      TransactionStatusEnum.PENDING,
    notes: occurrence?.notes ?? null,
    description: occurrence?.transaction.description ?? null,
    amountInReais: occurrence
      ? centsToReais(occurrence.amountInCents)
      : (undefined as unknown as number),
    dueDate: occurrence ? new Date(occurrence.dueDate) : new Date(),
    walletId: occurrence?.transaction.walletId ?? wallets?.[0]?.id ?? '',
    categoryId: occurrence?.transaction.categoryId ?? null,
  };
}

const UpsertOccurrenceForm = ({
  isOpen,
  occurrence,
  wallets,
  categories,
  onSuccess,
}: UpsertOccurrenceFormProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(occurrence, wallets),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (!isOpen || !occurrence) return;
    form.reset(getDefaultValues(occurrence, wallets));
  }, [isOpen, occurrence, wallets, form]);

  const updateAction = useAction(updateOccurrence, {
    onSuccess: () => {
      toast.success('Lançamento atualizado com sucesso');
      onSuccess?.();
    },
    onError: ({ error }) => {
      if (error.validationErrors) {
        toast.error('Verifique os campos destacados');
        return;
      }
      toast.error(error.serverError ?? 'Erro ao atualizar lançamento');
    },
  });

  const onSubmit = (data: FormSchema) => {
    if (!occurrence) return;
    updateAction.execute({
      occurrenceId: occurrence.id,
      status: data.status,
      notes: data.notes ?? null,
      description: data.description?.trim() ? data.description.trim() : null,
      amountInCents: reaisToCents(data.amountInReais),
      dueDate: data.dueDate,
      walletId: data.walletId,
      categoryId: data.categoryId ?? null,
    });
  };

  const onInvalid = () => {
    toast.error('Preencha os campos obrigatórios corretamente');
  };

  if (!occurrence) return null;

  const { transaction } = occurrence;
  const isExpense = transaction.transactionType === TransactionTypeEnum.EXPENSE;
  const installmentLabel =
    occurrence.installmentNumber && occurrence.installmentTotal
      ? `Parcela ${occurrence.installmentNumber}/${occurrence.installmentTotal}`
      : null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onSuccess?.();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar lançamento</DialogTitle>
          <DialogDescription>
            <p>
              {installmentLabel
                ? `${transaction.title} · ${installmentLabel}`
                : transaction.title}
            </p>
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-5"
        >
          {/* ── DADOS DA TRANSAÇÃO ─────────────────────────────────── */}
          <div className="space-y-3">
            <FieldGroup>
              {/* Descrição */}
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Descrição</FieldLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Descrição da transação"
                      rows={2}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Valor */}
              <Controller
                control={form.control}
                name="amountInReais"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Valor</FieldLabel>
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
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Vencimento */}
              <Controller
                control={form.control}
                name="dueDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Vencimento</FieldLabel>
                    <Input
                      type="date"
                      value={dayjs(field.value).format('YYYY-MM-DD')}
                      onChange={(e) => {
                        const parsed = dayjs(e.target.value);
                        field.onChange(
                          parsed.isValid() ? parsed.toDate() : new Date(),
                        );
                      }}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Carteira */}
                <Controller
                  control={form.control}
                  name="walletId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Carteira</FieldLabel>
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Categoria */}
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Categoria</FieldLabel>
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </div>

          {/* ── DADOS DA PARCELA ───────────────────────────────────── */}
          <div className="space-y-3">
            <FieldGroup>
              {/* Status */}
              <Controller
                control={form.control}
                name="status"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Status</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="h-11 w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {transactionStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Notas */}
              <Controller
                control={form.control}
                name="notes"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Notas (opcional)</FieldLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Ex: Pagamento via PIX, parcela renegociada..."
                      rows={2}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                className="cursor-pointer"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={updateAction.isExecuting}
              className="cursor-pointer"
            >
              {updateAction.isExecuting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertOccurrenceForm;
