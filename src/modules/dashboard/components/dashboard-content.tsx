'use client';

import { LayoutDashboard } from 'lucide-react';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import MonthNavigation from '@/modules/transactions/components/month-navigation';

import { DashboardData } from '../actions/get-dashboard-data';
import { DashboardCategoryChart } from './dashboard-category-chart';
import { DashboardExpenseChart } from './dashboard-expense-chart';
import { DashboardKpiCards } from './dashboard-kpi-cards';
import { DashboardRecurringChart } from './dashboard-recurring-chart';
import { DashboardTopCategories } from './dashboard-top-categories';
import { DashboardWalletBreakdown } from './dashboard-wallet-breakdown';

interface DashboardContentProps {
  data: DashboardData;
}

export function DashboardContent({ data }: DashboardContentProps) {
  const hasData = data.totalOccurrences > 0;

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="mt-3">
        <MonthNavigation month={data.month} year={data.year} />
      </div>

      {hasData ? (
        <>
          {/* KPI Cards */}
          <Suspense
            fallback={<Skeleton className="h-[100px] w-full rounded-2xl" />}
          >
            <DashboardKpiCards data={data} />
          </Suspense>

          {/* Chart Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)]">
            {/* Top Left: Evolution (takes 2 columns on large screens) */}
            <div className="lg:col-span-2">
              <DashboardExpenseChart
                data={data.dailyPoints}
                month={data.month}
              />
            </div>
            {/* Top Right: Categories (takes 1 column) */}
            <div className="lg:col-span-1">
              <DashboardCategoryChart data={data.categoryBreakdown} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)]">
            {/* Bottom Left: Recurring */}
            <div className="lg:col-span-1">
              <DashboardRecurringChart
                data={{
                  recurringExpenseInCents: data.recurringExpenseInCents,
                  oneTimeExpenseInCents: data.oneTimeExpenseInCents,
                }}
              />
            </div>
            {/* Bottom Middle: Top Categories */}
            <div className="lg:col-span-1">
              <DashboardTopCategories data={data.categoryBreakdown} />
            </div>
            {/* Bottom Right: Wallet Breakdown */}
            <div className="lg:col-span-1">
              <DashboardWalletBreakdown data={data.walletBreakdown} />
            </div>
          </div>
        </>
      ) : (
        <DashboardEmpty />
      )}
    </div>
  );
}

export function DashboardEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-2xl">
        <LayoutDashboard className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Sem dados no período</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-center text-sm">
        Registre transações para visualizar seu resumo financeiro aqui.
      </p>
    </div>
  );
}
