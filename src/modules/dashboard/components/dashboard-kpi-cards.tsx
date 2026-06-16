'use client';

import 'dayjs/locale/pt-br';

import dayjs from 'dayjs';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyFromCents } from '@/modules/transactions/helpers/format-currency';

import { DashboardData } from '../actions/get-dashboard-data';

dayjs.locale('pt-br');

interface DashboardKpiCardsProps {
  data: DashboardData;
}

export function DashboardKpiCards({ data }: DashboardKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {/* Receitas */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <p className="text-[10px] font-semibold uppercase tracking-widest">
              Receitas
            </p>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatCurrencyFromCents(data.totalIncomeInCents)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.totalOccurrences} lançamento(s) no mês
          </p>
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
            <p className="text-[10px] font-semibold uppercase tracking-widest">
              Despesas
            </p>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatCurrencyFromCents(data.totalExpenseInCents)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatCurrencyFromCents(data.recurringExpenseInCents)} recorrentes
          </p>
        </CardContent>
      </Card>

      {/* Saldo */}
      <Card className="col-span-2 border-border/50 shadow-sm sm:col-span-1">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-4 w-4 text-blue-500" />
            <p className="text-[10px] font-semibold uppercase tracking-widest">
              Saldo Geral
            </p>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatCurrencyFromCents(data.balanceInCents)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Receitas menos despesas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
