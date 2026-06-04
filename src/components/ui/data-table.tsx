'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { FileDown, FileText, Search } from 'lucide-react'; // Columns3Cog
import * as React from 'react';

// import * as XLSX from "xlsx";
// import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';

import { Button } from './button';
import { DataTablePagination } from './data-table-pagination';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;

  showExport?: boolean;
  exportFileName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  showExport,
  exportFileName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // global search
  const [globalFilter, setGlobalFilter] = React.useState('');

  const debouncedSearch = useDebounce(globalFilter, 300);

  function normalize(value: unknown): string {
    if (value === null || value === undefined) return '';

    return String(value)
      .normalize('NFD') // separa acentos
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .toLowerCase()
      .trim();
  }

  const globalFilterFn: FilterFn<TData> = (row, columnId, filterValue) => {
    const rawValue = row.getValue(columnId);

    if (rawValue === undefined || rawValue === null) return false;

    let value = rawValue;

    /* ENUM TRADUZIDO (exemplo sex) */
    if (columnId === 'sex') {
      const map: Record<string, string> = {
        male: 'masculino',
        female: 'feminino',
      };

      value = map[String(rawValue)] ?? rawValue;
    }

    /* BOOLEAN */
    if (typeof rawValue === 'boolean') {
      value = rawValue ? 'sim verdadeiro ativo' : 'nao falso inativo';
    }

    /* DATA */
    if (rawValue instanceof Date) {
      const date = rawValue;

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      value = `${day}/${month}/${year} ${year}-${month}-${day}`;
    }

    /* NUMERO */
    if (typeof rawValue === 'number') {
      value = rawValue.toString();
    }

    const search = normalize(filterValue);
    const target = normalize(value);

    return target.includes(search);
  };

  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter: debouncedSearch,
      rowSelection,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,

    globalFilterFn,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Exportar para Excel
  // const handleExportExcel = () => {
  //   const worksheet = XLSX.utils.json_to_sheet(data);

  //   const workbook = XLSX.utils.book_new();

  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

  //   XLSX.writeFile(workbook, `${exportFileName ?? "tabela"}.xlsx`);
  // };

  // Exportar para PDF
  const handleExportPDF = async () => {
    // const jsPDFModule = await import('jspdf');
    // const autoTableModule = await import('jspdf-autotable');
    // const jsPDF = jsPDFModule.default;
    // const autoTable = autoTableModule.default;
    // const doc = new jsPDF();
    // const exportableColumns = columns.filter(
    //   (column) => column.id !== 'actions',
    // );
    // const tableHeaders = exportableColumns.map(
    //   (column) =>
    //     (column.meta as { exportLabel?: string })?.exportLabel ??
    //     String(column.id),
    // );
    // const tableRows = data.map((item) =>
    //   exportableColumns.map((column) => {
    //     const key = column.id as string;
    //     const meta = column.meta as {
    //       exportValue?: (row: TData) => unknown;
    //     };
    //     if (meta?.exportValue) {
    //       return String(meta.exportValue(item));
    //     }
    //     return String((item as Record<string, unknown>)[key] ?? '');
    //   }),
    // );
    // autoTable(doc, {
    //   head: [tableHeaders],
    //   body: tableRows,
    // });
    // doc.save(`${exportFileName ?? 'tabela'}.pdf`);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center py-4">
        <div className="ml-auto flex items-center gap-2">
          {/* Search global */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />

            <Input
              // className="w-[250px] pl-8"
              className="pl-8"
              placeholder="Pesquisar..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
            />
          </div>

          {/* Toggle columns */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3Cog className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu> */}

          {/* Type download */}
          {showExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {/* <DropdownMenuCheckboxItem
                  onClick={handleExportExcel}
                  className="pl-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Exportar para Excel
                </DropdownMenuCheckboxItem> */}

                <DropdownMenuCheckboxItem
                  onClick={handleExportPDF}
                  className="pl-2"
                >
                  <FileText className="h-4 w-4" />
                  Exportar para PDF
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}

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
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;

                        if (
                          target.closest('button') ||
                          target.closest('[role="checkbox"]') ||
                          target.closest('a') ||
                          target.closest('[data-no-row-click="true"]')
                        ) {
                          e.stopPropagation();
                        }
                      }}
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
                  Nenhum resultado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* FOOTER */}
      {/* Pagination */}
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próxima
        </Button>
      </div> */}

      {/* <div className="flex items-center justify-end space-x-2 py-4"> */}
      <DataTablePagination table={table} />
      {/* </div> */}
    </div>
  );
}
