'use client';

import dayjs from 'dayjs';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyFromCents } from '@/modules/transactions/helpers/format-currency';

import { DailyPoint } from '../actions/get-dashboard-data';

interface DashboardExpenseChartProps {
  data: DailyPoint[];
  month: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color?: string }[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-border/10 rounded-lg border bg-[#1C1C1E] p-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-white/70">Dia {label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <p className="text-sm font-semibold text-white">
            <span className="font-normal text-white/70">{p.name}: </span>
            {formatCurrencyFromCents(p.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DashboardExpenseChart({
  data,
  month,
}: DashboardExpenseChartProps) {
  const chartData = data.map((d) => ({
    day: d.day,
    Despesas: d.expenseInCents,
    Receitas: d.incomeInCents,
  }));

  const monthAbbr = dayjs()
    .month(month - 1)
    .format('MMM');

  return (
    <Card className="border-border/50 flex h-full flex-col shadow-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground/90 text-sm font-semibold">
            Evolução Mensal
          </CardTitle>
          <div className="text-muted-foreground flex items-center gap-4 text-[10px] font-medium tracking-wider uppercase">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#10b981]" /> Receitas
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#f43f5e]" /> Despesas
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-0 pb-4 sm:px-2">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-border/10"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v} ${monthAbbr}`}
              tickMargin={10}
              minTickGap={20}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                `R$${(v / 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
              }
              tickMargin={10}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: 'currentColor',
                strokeWidth: 1,
                strokeDasharray: '4 4',
                opacity: 0.2,
              }}
            />
            <Area
              type="monotone"
              dataKey="Receitas"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#colorIncome)"
              dot={false}
              activeDot={{
                r: 6,
                fill: '#10b981',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
            <Area
              type="monotone"
              dataKey="Despesas"
              stroke="#f43f5e"
              strokeWidth={3}
              fill="url(#colorExpense)"
              dot={false}
              activeDot={{
                r: 6,
                fill: '#f43f5e',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
