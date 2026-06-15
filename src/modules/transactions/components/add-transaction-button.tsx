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
      {/* Desktop */}
      <Button
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className="hidden cursor-pointer md:flex"
      >
        <PlusIcon />
        Nova transação
      </Button>

      {/* Mobile */}
      <Button
        size="icon"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-20 z-50 h-10 w-10 cursor-pointer rounded-full shadow-xl md:hidden"
        style={{
          background: 'var(--lunyx-gradient)',
        }}
      >
        <PlusIcon className="h-5 w-5" color="#fff" />
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
