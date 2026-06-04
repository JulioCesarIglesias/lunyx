'use client';

import { ArrowRightLeft } from 'lucide-react';

import { categoriesTable, walletsTable } from '@/infrastructure/db/schema';

import { TransactionFilters } from '../actions/get-transactions/schema';
import {
  OccurrenceWithRelations,
  TransactionSummary,
} from '../types/occurrence-with-relations';
import OccurrencesTable from './occurrences-table';
import TransactionFiltersBar from './transaction-filters';
import TransactionSummaryCards from './transaction-summary-cards';

type WalletOption = Pick<
  typeof walletsTable.$inferSelect,
  'id' | 'name' | 'color'
>;

type CategoryOption = Pick<typeof categoriesTable.$inferSelect, 'id' | 'name'>;

interface TransactionsContentProps {
  occurrences: OccurrenceWithRelations[];
  summary: TransactionSummary;
  filters: TransactionFilters;
  wallets: WalletOption[];
  categories: CategoryOption[];
}

const TransactionsContent = ({
  occurrences,
  summary,
  filters,
  wallets,
  categories,
}: TransactionsContentProps) => {
  return (
    <div className="space-y-6">
      <TransactionFiltersBar
        filters={filters}
        wallets={wallets}
        categories={categories}
      />

      <TransactionSummaryCards summary={summary} />

      {occurrences.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <ArrowRightLeft className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            Nenhum lançamento neste período
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-center text-sm">
            Ajuste os filtros ou adicione uma nova transação. Parcelas aparecem
            no mês do vencimento.
          </p>
        </div>
      ) : (
        <OccurrencesTable
          occurrences={occurrences}
          wallets={wallets}
          categories={categories}
        />
      )}
    </div>
  );
};

export default TransactionsContent;
