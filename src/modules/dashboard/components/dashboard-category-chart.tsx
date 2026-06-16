'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyFromCents } from '@/modules/transactions/helpers/format-currency';

import { CategoryBreakdown } from '../actions/get-dashboard-data';

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

interface DashboardCategoryChartProps {
  data: CategoryBreakdown[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { fill: string } }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C1C1E] border-border/10 rounded-lg border p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: payload[0].payload.fill }}
        />
        <p className="text-sm font-semibold text-white">{payload[0].name}</p>
      </div>
      <p className="mt-1 text-xs text-white/70">
        {formatCurrencyFromCents(payload[0].value)}
      </p>
    </div>
  );
}

export function DashboardCategoryChart({ data }: DashboardCategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/50 shadow-sm flex flex-col h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <CardTitle className="text-sm font-semibold text-foreground/90">
                Por Categoria
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">Sem despesas</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 10).map((c, i) => ({
    name: c.categoryName,
    value: c.totalInCents,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <Card className="border-border/50 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <CardTitle className="text-sm font-semibold text-foreground/90">
              Por Categoria
            </CardTitle>
          </div>
          <div className="text-muted-foreground bg-muted/50 rounded-md px-2 py-1 text-[10px]">
            Distribuição
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-between p-6">
        <div className="w-full flex-1">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
          {chartData.map((entry, index) => {
            return (
              <div key={index} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: entry.fill }}
                />
                <span className="text-muted-foreground text-xs font-medium">
                  {entry.name}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
