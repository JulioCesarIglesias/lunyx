'use client';

import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ListChecks, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { categoriesTable, walletsTable } from '@/infrastructure/db/schema';

import { FrequencyTypeEnum } from '../constants/frequency-types';
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
import BulkUpdateStatusDialog from './bulk-update-status-dialog';
import OccurrenceTableActions from './occurrence-table-actions';
import { createOccurrenceTableColumns } from './occurrence-table-columns';
import UpsertOccurrenceForm from './upsert-occurrence-form';

type WalletOption = Pick<
  typeof walletsTable.$inferSelect,
  'id' | 'name' | 'color'
>;

type CategoryOption = Pick<typeof categoriesTable.$inferSelect, 'id' | 'name'>;

interface OccurrencesTableProps {
  occurrences: OccurrenceWithRelations[];
  wallets: WalletOption[];
  categories: CategoryOption[];
}

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function normalize(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getColumnClassName(columnId: string) {
  const classNames: Record<string, string> = {
    select: 'w-12 px-3',
    title: 'min-w-[220px]',
    status: 'w-[120px]',
    amountInCents: 'w-[140px] text-right',
    transactionType: 'w-[120px]',
    wallet: 'w-[180px]',
    category: 'w-[160px]',
    dueDate: 'w-[140px]',
    actions: 'w-12 text-right',
  };

  return classNames[columnId];
}

function MobileStatusBadge({ status }: { status: TransactionStatusEnum }) {
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
    <Badge variant={variants[status]} className="badge-sm text-[10px]">
      {transactionStatusLabels[status]}
    </Badge>
  );
}

function MobileTypeBadge({ type }: { type: TransactionTypeEnum }) {
  const variants: Record<
    TransactionTypeEnum,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    [TransactionTypeEnum.INCOME]: 'default',
    [TransactionTypeEnum.EXPENSE]: 'destructive',
    [TransactionTypeEnum.TRANSFER]: 'secondary',
  };

  return (
    <Badge variant={variants[type]} className="badge-sm text-[10px]">
      {transactionTypeLabels[type]}
    </Badge>
  );
}

function getOccurrenceSequenceLabel(occurrence: OccurrenceWithRelations) {
  const { transaction, installmentNumber, installmentTotal } = occurrence;

  if (!installmentNumber || !installmentTotal) return null;

  const isRecurring = transaction.frequencyType === FrequencyTypeEnum.RECURRING;

  // return isRecurring
  //   ? `Recorrência ${installmentNumber}/${installmentTotal}`
  //   : `Parcela ${installmentNumber}/${installmentTotal}`;

  return isRecurring
    ? `${installmentNumber}/${installmentTotal}`
    : `${installmentNumber}/${installmentTotal}`;
}

const OccurrencesTable = ({
  occurrences,
  wallets,
  categories,
}: OccurrencesTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<OccurrenceWithRelations | null>(null);
  const [occurrenceFormOpen, setOccurrenceFormOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(globalFilter, 300);

  const openOccurrenceForm = (occurrence: OccurrenceWithRelations) => {
    setSelectedOccurrence(occurrence);
    setOccurrenceFormOpen(true);
  };

  const columns = useMemo(
    () => createOccurrenceTableColumns(wallets, categories, openOccurrenceForm),
    [wallets, categories],
  );

  const globalFilterFn: FilterFn<OccurrenceWithRelations> = (
    row,
    columnId,
    filterValue,
  ) => {
    const rawValue = row.getValue(columnId);
    if (rawValue === undefined || rawValue === null) return false;

    let value: unknown = rawValue;

    if (columnId === 'status') {
      value =
        transactionStatusLabels[rawValue as TransactionStatusEnum] ?? rawValue;
    }

    if (rawValue instanceof Date) {
      const date = rawValue;
      value = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }

    return normalize(value).includes(normalize(filterValue));
  };

  const table = useReactTable({
    data: occurrences,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter: debouncedSearch,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id);

  const selectedCount = selectedIds.length;

  const handleBulkSuccess = () => {
    setBulkDialogOpen(false);
    setRowSelection({});
  };

  const handleOccurrenceFormClose = () => {
    setOccurrenceFormOpen(false);
    setSelectedOccurrence(null);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          {table.getFilteredRowModel().rows.length} lançamento(s)
        </p>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              className="w-full pl-8 sm:w-[280px]"
              placeholder="Pesquisar..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={getColumnClassName(header.column.id)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer"
                  onClick={() => openOccurrenceForm(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={getColumnClassName(cell.column.id)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const occurrence = row.original;
            const { transaction } = occurrence;
            const sequenceLabel = getOccurrenceSequenceLabel(occurrence);

            const isExpense =
              transaction.transactionType === TransactionTypeEnum.EXPENSE;

            return (
              <div
                key={row.id}
                role="button"
                tabIndex={0}
                onClick={() => openOccurrenceForm(occurrence)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;

                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openOccurrenceForm(occurrence);
                  }
                }}
                className="bg-card border-border rounded-2xl border px-3 py-2 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="shrink-0 pt-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value: boolean) =>
                        row.toggleSelected(!!value)
                      }
                      aria-label="Selecionar lançamento"
                    />
                  </div>
                  <div className="flex w-full">
                    <div className="min-w-0 flex-1">
                      <div className="min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm leading-snug font-semibold break-words">
                            {sequenceLabel && (
                              <span className="text-muted-foreground text-xs font-medium">
                                {sequenceLabel}
                                {'  '}
                              </span>
                            )}
                            {transaction.title}
                          </p>

                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-muted-foreground shrink-0 text-xs">
                              {dayjs(occurrence.dueDate).format('DD/MM/YYYY')}
                            </span>

                            <span
                              className={`min-w-0 text-right text-sm font-bold tabular-nums ${
                                isExpense ? 'text-rose-500' : 'text-emerald-500'
                              }`}
                            >
                              {formatCurrencyFromCents(
                                occurrence.amountInCents,
                              )}
                            </span>

                            {false && false && (
                              <>
                                <span>•</span>
                                <span>{sequenceLabel}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <p
                          className={`hidden shrink-0 text-sm font-bold tabular-nums ${
                            isExpense ? 'text-rose-500' : 'text-emerald-500'
                          }`}
                        >
                          {formatCurrencyFromCents(occurrence.amountInCents)}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        <MobileStatusBadge
                          status={occurrence.status as TransactionStatusEnum}
                        />

                        <MobileTypeBadge
                          type={
                            transaction.transactionType as TransactionTypeEnum
                          }
                        />

                        <Badge
                          variant="secondary"
                          className="badge-sm text-[10px]"
                        >
                          {transaction.category?.name ?? 'Sem categoria'}
                        </Badge>
                      </div>
                    </div>

                    <div
                      className="shrink-0"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <OccurrenceTableActions
                        occurrence={occurrence}
                        wallets={wallets}
                        categories={categories}
                        onEditStatus={() => openOccurrenceForm(occurrence)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border py-8 text-center text-sm">
            Nenhum resultado encontrado.
          </div>
        )}
      </div>

      <DataTablePagination table={table} />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-muted-foreground text-sm">
          {selectedCount > 0
            ? `${selectedCount} linha(s) selecionada(s)`
            : 'Selecione linhas para alterar o status em lote'}
        </p>
        <Button
          variant="outline"
          disabled={selectedCount === 0}
          onClick={() => setBulkDialogOpen(true)}
          className="cursor-pointer"
        >
          <ListChecks className="h-4 w-4" />
          Alterar status em lote
        </Button>
      </div>

      <UpsertOccurrenceForm
        isOpen={occurrenceFormOpen}
        occurrence={selectedOccurrence}
        onSuccess={handleOccurrenceFormClose}
      />

      <BulkUpdateStatusDialog
        isOpen={bulkDialogOpen}
        selectedIds={selectedIds}
        onSuccess={handleBulkSuccess}
      />
    </div>
  );
};

export default OccurrencesTable;
