'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { bulkUpdateOccurrenceStatus } from '../actions/update-occurrence-status';
import {
  TransactionStatusEnum,
  transactionStatusOptions,
} from '../constants/transaction-status';

const formSchema = z.object({
  status: z.nativeEnum(TransactionStatusEnum, {
    message: 'Selecione um status',
  }),
});

type FormSchema = z.infer<typeof formSchema>;

interface BulkUpdateStatusDialogProps {
  isOpen: boolean;
  selectedIds: string[];
  onSuccess?: () => void;
}

const BulkUpdateStatusDialog = ({
  isOpen,
  selectedIds,
  onSuccess,
}: BulkUpdateStatusDialogProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: TransactionStatusEnum.PAID },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ status: TransactionStatusEnum.PAID });
    }
  }, [isOpen, form]);

  const bulkAction = useAction(bulkUpdateOccurrenceStatus, {
    onSuccess: () => {
      toast.success('Status atualizado para os lançamentos selecionados');
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Erro ao atualizar status em lote');
    },
  });

  const onSubmit = (data: FormSchema) => {
    bulkAction.execute({ ids: selectedIds, status: data.status });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onSuccess?.();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar status em lote</DialogTitle>
          <DialogDescription>
            {selectedIds.length} lançamento(s) selecionado(s). O mesmo status será
            aplicado a todos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Novo status</FieldLabel>
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
              <Button variant="outline" type="button" className="cursor-pointer">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={bulkAction.isExecuting}
              className="cursor-pointer"
            >
              {bulkAction.isExecuting ? 'Aplicando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUpdateStatusDialog;
