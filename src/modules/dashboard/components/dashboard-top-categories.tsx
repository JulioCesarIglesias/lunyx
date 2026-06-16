'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyFromCents } from '@/modules/transactions/helpers/format-currency';

import { CategoryBreakdown } from '../actions/get-dashboard-data';

// Must match the colors from dashboard-category-chart.tsx
const COLORS = [
  '#22c55e', // Green
  '#f97316', // Orange
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
];

interface DashboardTopCategoriesProps {
  data: CategoryBreakdown[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { name: string; fill: string } }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C1C1E] border-border/10 rounded-lg border p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: payload[0].payload.fill }}
        />
        <p className="text-sm font-semibold text-white">
          {payload[0].payload.name}
        </p>
      </div>
      <p className="mt-1 text-xs text-white/70">
        {formatCurrencyFromCents(payload[0].value)}
      </p>
    </div>
  );
}

export function DashboardTopCategories({ data }: DashboardTopCategoriesProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/50 shadow-sm flex flex-col h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <CardTitle className="text-sm font-semibold text-foreground/90">
              Top Categorias (R$)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">Sem dados</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 5).map((c, i) => ({
    name: c.categoryName,
    value: c.totalInCents,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <Card className="border-border/50 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
          <CardTitle className="text-sm font-semibold text-foreground/90">
            Top Categorias (R$)
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 px-2 sm:px-4 pb-6">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barSize={16}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="currentColor"
              className="text-border/10"
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                `R$${(v / 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
              }
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
