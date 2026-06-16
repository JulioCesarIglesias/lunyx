'use client';

import { EditIcon, MoreVerticalIcon, TrashIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categoriesTable, walletsTable } from '@/infrastructure/db/schema';

import { deleteTransaction } from '../actions/delete-transaction';
import { OccurrenceWithRelations } from '../types/occurrence-with-relations';
import UpsertOccurrenceForm from './upsert-occurrence-form';

type WalletOption = Pick<
  typeof walletsTable.$inferSelect,
  'id' | 'name' | 'color'
>;

type CategoryOption = Pick<typeof categoriesTable.$inferSelect, 'id' | 'name'>;

interface OccurrenceTableActionsProps {
  occurrence: OccurrenceWithRelations;
  wallets: WalletOption[];
  categories: CategoryOption[];
  onEditStatus: () => void;
}

const OccurrenceTableActions = ({
  occurrence,
  wallets,
  categories,
  onEditStatus,
}: OccurrenceTableActionsProps) => {
  const [editOccurrenceOpen, setEditOccurrenceOpen] = useState(false);
  const [deleteAlertIsOpen, setDeleteAlertIsOpen] = useState(false);

  const deleteTransactionAction = useAction(deleteTransaction, {
    onSuccess: () => {
      toast.success('Transação excluída com sucesso');
      setDeleteAlertIsOpen(false);
    },
    onError: () => {
      toast.error('Erro ao excluir transação');
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
          >
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem onClick={onEditStatus}>
            <EditIcon className="h-4 w-4" />
            Alterar status
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => setEditOccurrenceOpen(true)}>
            <EditIcon className="h-4 w-4" />
            Editar lançamento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteAlertIsOpen(true)}>
            <TrashIcon className="h-4 w-4" />
            Excluir transação
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpsertOccurrenceForm
        isOpen={editOccurrenceOpen}
        occurrence={occurrence}
        wallets={wallets}
        categories={categories}
        onSuccess={() => setEditOccurrenceOpen(false)}
      />

      <AlertDialog open={deleteAlertIsOpen} onOpenChange={setDeleteAlertIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              A transação inteira e todas as parcelas serão removidas
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTransactionAction.execute({
                  id: occurrence.transaction.id,
                })
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OccurrenceTableActions;
