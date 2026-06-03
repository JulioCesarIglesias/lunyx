import { zodResolver } from '@hookform/resolvers/zod';
import { Tag } from 'lucide-react';
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
import { categoriesTable } from '@/infrastructure/db/schema';

import { upsertCategory } from '../actions/upsert-category';

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Máximo de 50 caracteres'),
});

interface UpsertCategoryFormProps {
  isOpen: boolean;
  category?: typeof categoriesTable.$inferSelect | null;
  onSuccess?: () => void;
}

const UpsertCategoryForm = ({
  isOpen,
  category,
  onSuccess,
}: UpsertCategoryFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name ?? '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: category?.name ?? '',
      });
    }
  }, [isOpen, category, form]);

  const upsertCategoryAction = useAction(upsertCategory, {
    onSuccess: () => {
      toast.success('Categoria salva com sucesso');
      onSuccess?.();
      form.reset();
    },
    onError: () => {
      toast.error('Erro ao salvar categoria');
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    upsertCategoryAction.execute({ ...data, id: category?.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onSuccess}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Editar' : 'Criar'} categoria</DialogTitle>
          <DialogDescription>
            {category ? 'Edite' : 'Crie'} uma nova categoria
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Nome</FieldLabel>

                  <div className="relative">
                    <Tag className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

                    <Input
                      {...field}
                      type="text"
                      placeholder="Nome da categoria"
                      className="h-11 pl-10"
                    />
                  </div>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertCategoryForm;
