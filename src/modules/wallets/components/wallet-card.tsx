'use client';

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
import { Dialog } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { walletsTable } from '@/infrastructure/db/schema';

import { walletTypeLabels } from '../constants/wallet-types';
import UpsertWalletForm from './upsert-wallet-form';

interface WalletCardProps {
  wallet: typeof walletsTable.$inferSelect;
}

const WalletCard = ({ wallet }: WalletCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteWalletClick = () => {
    console.log(wallet.id);
  };

  return (
    <>
      <div
        className="relative w-full max-w-[320px] overflow-hidden rounded-3xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{
          backgroundColor: wallet.color ?? '#820AD1',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Glow superior */}
        <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

        {/* Glow inferior */}
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-black/20 blur-xl" />

        <div className="relative flex h-[185px] flex-col p-4 text-white">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wider text-white/70 uppercase">
                {walletTypeLabels[wallet.type]}
              </p>

              <h3 className="mt-1 truncate text-lg font-bold">{wallet.name}</h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
                >
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
                      <AlertDialogTitle>Excluir carteira?</AlertDialogTitle>

                      <AlertDialogDescription>
                        Esta ação não poderá ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>

                      <AlertDialogAction onClick={handleDeleteWalletClick}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Conteúdo */}
          <div className="mt-auto">
            {wallet.type !== 'cash' ? (
              <>
                {/* Chip */}
                <div className="h-10 w-14 rounded-lg border border-white/20 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-sm" />

                {/* Número fictício */}
                <div className="mt-4 flex gap-2">
                  <Skeleton className="h-2.5 w-10 bg-white/25" />
                  <Skeleton className="h-2.5 w-10 bg-white/25" />
                  <Skeleton className="h-2.5 w-10 bg-white/25" />
                  <Skeleton className="h-2.5 w-10 bg-white/25" />
                </div>

                {/* Nome do titular fictício */}
                <Skeleton className="mt-4 h-3 w-28 bg-white/20" />
              </>
            ) : (
              <div className="flex items-center">
                <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                  Dinheiro em espécie
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <UpsertWalletForm
          wallet={wallet}
          isOpen={isDialogOpen}
          onSuccess={() => setIsDialogOpen(false)}
        />
      </Dialog>
    </>
  );
};

export default WalletCard;
