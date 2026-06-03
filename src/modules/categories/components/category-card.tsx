'use client';

import { MoreVertical, Pencil, Tag, Trash2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { deleteCategory } from '../actions/delete-category';
import { CategoryWithSummary } from '../types/category-with-summary';
import UpsertCategoryForm from './upsert-category-form';

interface CategoryCardProps {
  category: CategoryWithSummary;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteCategoryAction = useAction(deleteCategory, {
    onSuccess: () => {
      toast.success('Categoria removida com sucesso.');
    },
    onError: () => {
      toast.error('Erro ao remover categoria.');
    },
  });

  const handleDeleteCategoryClick = async () => {
    if (!category) return;
    deleteCategoryAction.execute({ id: category.id });
  };

  const categoryAmount = category.amountInCents;
  const categoryTransactions = category.transactionCount;

  return (
    <>
      <Card className="hover:border-primary/30 transition-all duration-200">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Tag className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold">
                  {category.name}
                </h3>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>

                      <AlertDialogDescription>
                        Esta ação não poderá ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>

                      <AlertDialogAction
                        onClick={handleDeleteCategoryClick}
                        className="bg-red-900 text-white hover:bg-red-700"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Movimentado</p>

              <div className="mt-1 text-lg font-bold">
                <NumericFormat
                  value={(categoryAmount ?? 0) / 100}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                  prefix="R$ "
                />
              </div>
            </div>

            <div className="text-right">
              <p className="text-muted-foreground text-sm">Transações</p>

              <h4 className="mt-1 text-lg font-bold">
                {categoryTransactions ?? 0}
              </h4>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <UpsertCategoryForm
          isOpen={isDialogOpen}
          category={category}
          onSuccess={() => setIsDialogOpen(false)}
        />
      </Dialog>
    </>
  );
};

export default CategoryCard;
