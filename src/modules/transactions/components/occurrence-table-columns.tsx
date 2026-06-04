'use client';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ArrowUpDown } from 'lucide-react';
import type { MouseEvent } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { categoriesTable, walletsTable } from '@/infrastructure/db/schema';

import { FrequencyTypeEnum } from '../constants/frequency-types';
import { paymentMethodLabels } from '../constants/payment-methods';
import {
  TransactionStatusEnum,
  transactionStatusLabels,
} from '../constants/transaction-status';
import {
  TransactionTypeEnum,
  transactionTypeLabels,
} from '../constants/transaction-types';
import { formatCurrencyFromCents } from '../helpers/format-currency';
import { OccurrenceWithRelations } from '../types/occurrence-with-relations';
import OccurrenceTableActions from './occurrence-table-actions';

type WalletOption = Pick<
  typeof walletsTable.$inferSelect,
  'id' | 'name' | 'color'
>;

type CategoryOption = Pick<typeof categoriesTable.$inferSelect, 'id' | 'name'>;

function SortableHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="cursor-pointer -ml-3 h-8 px-2"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

function StatusBadge({ status }: { status: TransactionStatusEnum }) {
  const variants: Record<
    TransactionStatusEnum,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    [TransactionStatusEnum.PENDING]: 'outline',
    [TransactionStatusEnum.PAID]: 'default',
    [TransactionStatusEnum.OVERDUE]: 'destructive',
    [TransactionStatusEnum.CANCELED]: 'secondary',
  };

  return (
    <Badge variant={variants[status]}>{transactionStatusLabels[status]}</Badge>
  );
}

function TransactionTypeBadge({ type }: { type: TransactionTypeEnum }) {
  const variants: Record<
    TransactionTypeEnum,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    [TransactionTypeEnum.INCOME]: 'default',
    [TransactionTypeEnum.EXPENSE]: 'destructive',
    [TransactionTypeEnum.TRANSFER]: 'secondary',
  };

  return <Badge variant={variants[type]}>{transactionTypeLabels[type]}</Badge>;
}

export function createOccurrenceTableColumns(
  wallets: WalletOption[],
  categories: CategoryOption[],
  onRowOpen: (occurrence: OccurrenceWithRelations) => void,
): ColumnDef<OccurrenceWithRelations>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value: boolean) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Selecionar todos"
          onClick={(e: MouseEvent) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
          onClick={(e: MouseEvent) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'title',
      accessorFn: (row) => row.transaction.title,
      header: ({ column }) => (
        <SortableHeader
          label="Título"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => {
        const { transaction, installmentNumber, installmentTotal } =
          row.original;
        const isRecurring =
          transaction.frequencyType === FrequencyTypeEnum.RECURRING;
        const sequenceLabel =
          installmentNumber && installmentTotal
            ? isRecurring
              ? `Recorrência ${installmentNumber}/${installmentTotal}`
              : `Parcela ${installmentNumber}/${installmentTotal}`
            : null;

        return (
          <button
            type="button"
            onClick={() => onRowOpen(row.original)}
            className="hover:text-primary min-w-[140px] cursor-pointer text-left transition-colors"
          >
            <p className="font-medium">{transaction.title}</p>
            {sequenceLabel && (
              <p className="text-muted-foreground text-xs">{sequenceLabel}</p>
            )}
          </button>
        );
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.status as TransactionStatusEnum} />
      ),
    },
    {
      id: 'transactionType',
      accessorFn: (row) => row.transaction.transactionType,
      header: 'Tipo',
      cell: ({ row }) => (
        <TransactionTypeBadge
          type={row.original.transaction.transactionType as TransactionTypeEnum}
        />
      ),
    },
    {
      id: 'amountInCents',
      accessorKey: 'amountInCents',
      header: ({ column }) => (
        <div className="text-right">
          <SortableHeader
            label="Valor"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        </div>
      ),
      cell: ({ row }) => {
        const isExpense =
          row.original.transaction.transactionType ===
          TransactionTypeEnum.EXPENSE;
        return (
          <div
            className={`text-right font-medium tabular-nums ${
              isExpense ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {formatCurrencyFromCents(row.original.amountInCents)}
          </div>
        );
      },
    },
    {
      id: 'wallet',
      accessorFn: (row) => row.transaction.wallet.name,
      header: 'Carteira',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.transaction.wallet.color && (
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: row.original.transaction.wallet.color,
              }}
            />
          )}
          <span>{row.original.transaction.wallet.name}</span>
        </div>
      ),
    },
    {
      id: 'category',
      accessorFn: (row) => row.transaction.category?.name ?? '—',
      header: 'Categoria',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.transaction.category?.name ?? '—'}
        </span>
      ),
    },
    {
      id: 'paymentMethod',
      accessorFn: (row) => row.transaction.paymentMethod,
      header: 'Pagamento',
      cell: ({ row }) =>
        paymentMethodLabels[
          row.original.transaction
            .paymentMethod as keyof typeof paymentMethodLabels
        ],
    },
    {
      id: 'dueDate',
      accessorKey: 'dueDate',
      header: ({ column }) => (
        <SortableHeader
          label="Vencimento"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => dayjs(row.original.dueDate).format('DD/MM/YYYY'),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="text-right" onClick={(e) => e.stopPropagation()}>
          <OccurrenceTableActions
            occurrence={row.original}
            wallets={wallets}
            categories={categories}
            onEditStatus={() => onRowOpen(row.original)}
          />
        </div>
      ),
    },
  ];
}
