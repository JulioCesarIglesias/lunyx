'use client';

import { Filter, Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useLayoutEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categoriesTable, walletsTable } from '@/infrastructure/db/schema';
import { cn } from '@/lib/utils';

import { TransactionFilters } from '../actions/get-transactions/schema';
import { filterMonthOptions, getFilterYearOptions } from '../constants/filter-months';
import { transactionTypeOptions } from '../constants/transaction-types';

const MOBILE_BREAKPOINT_PX = 768;

type WalletOption = Pick<
  typeof walletsTable.$inferSelect,
  'id' | 'name' | 'color'
>;

type CategoryOption = Pick<typeof categoriesTable.$inferSelect, 'id' | 'name'>;

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  wallets: WalletOption[];
  categories: CategoryOption[];
}

const ALL_VALUE = 'all';

const TransactionFiltersBar = ({
  filters,
  wallets,
  categories,
}: TransactionFiltersBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobile, setIsMobile] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const syncViewport = useCallback(() => {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT_PX;
    setIsMobile(mobile);
    if (!mobile) {
      setFiltersExpanded(true);
    }
  }, []);

  useLayoutEffect(() => {
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, [syncViewport]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === ALL_VALUE) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('walletId');
    params.delete('categoryId');
    params.delete('transactionType');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const hasExtraFilters =
    Boolean(filters.walletId) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.transactionType);

  const yearOptions = getFilterYearOptions();
  const showFilterFields = !isMobile || filtersExpanded;

  const toggleFilters = () => {
    if (isMobile) {
      setFiltersExpanded((prev) => !prev);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={toggleFilters}
            className={cn(
              'flex flex-1 cursor-pointer items-center gap-2 text-left',
              isMobile && 'rounded-md active:bg-muted/50',
            )}
            aria-expanded={showFilterFields}
            aria-controls="transaction-filters-panel"
          >
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Filter className="text-muted-foreground h-4 w-4" />
              Filtros
            </CardTitle>
            {isMobile && (
              <span
                className="bg-muted text-muted-foreground ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                aria-hidden
              >
                <Plus
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    filtersExpanded && 'rotate-45',
                  )}
                />
              </span>
            )}
          </button>

          {hasExtraFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground h-8 shrink-0 gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Limpar filtros</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent
        id="transaction-filters-panel"
        className={cn(!showFilterFields && 'hidden')}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">Mês</p>
            <Select
              value={String(filters.month)}
              onValueChange={(value) => updateParams({ month: value })}
            >
              <SelectTrigger className="h-10 w-full cursor-pointer">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent position="popper">
                {filterMonthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">Ano</p>
            <Select
              value={String(filters.year)}
              onValueChange={(value) => updateParams({ year: value })}
            >
              <SelectTrigger className="h-10 w-full cursor-pointer">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent position="popper">
                {yearOptions.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">Carteira</p>
            <Select
              value={filters.walletId ?? ALL_VALUE}
              onValueChange={(value) => updateParams({ walletId: value })}
            >
              <SelectTrigger className="h-10 w-full cursor-pointer">
                <SelectValue placeholder="Todas as carteiras" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={ALL_VALUE}>Todas as carteiras</SelectItem>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">Categoria</p>
            <Select
              value={filters.categoryId ?? ALL_VALUE}
              onValueChange={(value) => updateParams({ categoryId: value })}
            >
              <SelectTrigger className="h-10 w-full cursor-pointer">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={ALL_VALUE}>Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">Tipo</p>
            <Select
              value={filters.transactionType ?? ALL_VALUE}
              onValueChange={(value) => updateParams({ transactionType: value })}
            >
              <SelectTrigger className="h-10 w-full cursor-pointer">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={ALL_VALUE}>Todos os tipos</SelectItem>
                {transactionTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFiltersBar;
