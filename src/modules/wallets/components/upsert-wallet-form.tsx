import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard } from 'lucide-react';
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { walletsTable } from '@/infrastructure/db/schema';

import { upsertWallet } from '../actions/upsert-wallet';
import { walletColors, walletColorValues } from '../constants/wallet-colors';
import { WalletTypeEnum, walletTypeOptions } from '../constants/wallet-types';
import { getDefaultColor } from '../helpers/default-wallet-color';

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Máximo de 50 caracteres'),

  type: z.nativeEnum(WalletTypeEnum),

  color: z.enum(walletColorValues),

  isActive: z.boolean().default(true).optional(),
});

interface UpsertWalletFormProps {
  isOpen: boolean;
  wallet?: typeof walletsTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertWalletForm = ({
  isOpen,
  wallet,
  onSuccess,
}: UpsertWalletFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: wallet?.name ?? '',
      type: (wallet?.type as WalletTypeEnum) ?? WalletTypeEnum.BANK,
      color: getDefaultColor(wallet?.color),
      isActive: wallet?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    form.reset({
      name: wallet?.name ?? '',
      type: (wallet?.type as WalletTypeEnum) ?? WalletTypeEnum.BANK,
      color: getDefaultColor(wallet?.color),
      isActive: wallet?.isActive ?? true,
    });
  }, [isOpen, wallet, form]);

  const upsertWalletAction = useAction(upsertWallet, {
    onSuccess: () => {
      toast.success('Carteira salva com sucesso');

      form.reset();

      onSuccess?.();
    },

    onError: () => {
      toast.error('Erro ao salvar carteira');
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    upsertWalletAction.execute({
      ...data,
      id: wallet?.id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onSuccess}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{wallet ? 'Editar' : 'Criar'} carteira</DialogTitle>

          <DialogDescription>
            {wallet ? 'Edite a' : 'Crie uma nova '} carteira financeira
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Nome</FieldLabel>

                  <div className="relative">
                    <CreditCard className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

                    <Input
                      {...field}
                      placeholder="Ex: Nubank, Carteira Física..."
                      className="pl-10"
                    />
                  </div>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Tipo</FieldLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>

                    <SelectContent>
                      {walletTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="color"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Cor</FieldLabel>

                  <div className="grid grid-cols-5 gap-2">
                    {walletColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => field.onChange(color.value)}
                        className={`h-10 w-full cursor-pointer rounded-lg border-2 transition-all ${
                          field.value === color.value
                            ? 'border-primary scale-105'
                            : 'border-transparent'
                        } `}
                        style={{
                          backgroundColor: color.value,
                        }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={upsertWalletAction.isExecuting}
              className="cursor-pointer"
            >
              {upsertWalletAction.isExecuting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertWalletForm;
