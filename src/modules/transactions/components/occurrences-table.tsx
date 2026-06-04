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
import { ListChecks, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
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

import {
  TransactionStatusEnum,
  transactionStatusLabels,
} from '../constants/transaction-status';
import { OccurrenceWithRelations } from '../types/occurrence-with-relations';
import BulkUpdateStatusDialog from './bulk-update-status-dialog';
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
      <div className="flex items-center py-4">
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              className="w-[250px] pl-8"
              placeholder="Pesquisar..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
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
