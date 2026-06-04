'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useAction } from 'next-safe-action/hooks';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { updateOccurrenceStatus } from '../actions/update-occurrence-status';
import {
  TransactionStatusEnum,
  transactionStatusOptions,
} from '../constants/transaction-status';
import {
  TransactionTypeEnum,
  transactionTypeLabels,
} from '../constants/transaction-types';
import { formatCurrencyFromCents } from '../helpers/format-currency';
import { OccurrenceWithRelations } from '../types/occurrence-with-relations';

const formSchema = z.object({
  status: z.nativeEnum(TransactionStatusEnum, {
    message: 'Selecione um status',
  }),
});

type FormSchema = z.infer<typeof formSchema>;

interface UpsertOccurrenceFormProps {
  isOpen: boolean;
  occurrence: OccurrenceWithRelations | null;
  onSuccess?: () => void;
}

const UpsertOccurrenceForm = ({
  isOpen,
  occurrence,
  onSuccess,
}: UpsertOccurrenceFormProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: TransactionStatusEnum.PENDING,
    },
  });

  useEffect(() => {
    if (!isOpen || !occurrence) return;
    form.reset({
      status: occurrence.status as TransactionStatusEnum,
    });
  }, [isOpen, occurrence, form]);

  const updateAction = useAction(updateOccurrenceStatus, {
    onSuccess: () => {
      toast.success('Status atualizado com sucesso');
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Erro ao atualizar status');
    },
  });

  const onSubmit = (data: FormSchema) => {
    if (!occurrence) return;
    updateAction.execute({ id: occurrence.id, status: data.status });
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar lançamento</DialogTitle>
          <DialogDescription>
            Atualize o status de pagamento deste lançamento
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 space-y-3 rounded-lg border p-4 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{transaction.title}</p>
              {transaction.description && (
                <p className="text-muted-foreground line-clamp-2 text-xs">
                  {transaction.description}
                </p>
              )}
            </div>
            <Badge variant="outline">
              {
                transactionTypeLabels[
                  transaction.transactionType as TransactionTypeEnum
                ]
              }
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground text-xs">Valor</p>
              <p
                className={`font-medium tabular-nums ${
                  isExpense ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {formatCurrencyFromCents(occurrence.amountInCents)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Vencimento</p>
              <p className="font-medium">
                {dayjs(occurrence.dueDate).format('DD/MM/YYYY')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Carteira</p>
              <p>{transaction.wallet.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Categoria</p>
              <p>{transaction.category?.name ?? '—'}</p>
            </div>
          </div>

          {installmentLabel && (
            <p className="text-muted-foreground text-xs">{installmentLabel}</p>
          )}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
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
          </FieldGroup>

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
