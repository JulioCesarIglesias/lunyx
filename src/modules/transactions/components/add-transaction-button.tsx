'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { categoriesTable, walletsTable } from '@/infrastructure/db/schema';

import UpsertTransactionForm from './upsert-transaction-form';

type WalletOption = Pick<
  typeof walletsTable.$inferSelect,
  'id' | 'name' | 'color'
>;

type CategoryOption = Pick<typeof categoriesTable.$inferSelect, 'id' | 'name'>;

interface AddTransactionButtonProps {
  wallets: WalletOption[];
  categories: CategoryOption[];
  disabled?: boolean;
}

const AddTransactionButton = ({
  wallets,
  categories,
  disabled,
}: AddTransactionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
      >
        <PlusIcon />
        Nova transação
      </Button>

      <UpsertTransactionForm
        isOpen={isOpen}
        wallets={wallets}
        categories={categories}
        onSuccess={() => setIsOpen(false)}
      />
    </>
  );
};

export default AddTransactionButton;
