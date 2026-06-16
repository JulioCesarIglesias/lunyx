'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyFromCents } from '@/modules/transactions/helpers/format-currency';

import { DashboardData } from '../actions/get-dashboard-data';

interface DashboardRecurringChartProps {
  data: Pick<DashboardData, 'recurringExpenseInCents' | 'oneTimeExpenseInCents'>;
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

export function DashboardRecurringChart({
  data,
}: DashboardRecurringChartProps) {
  const pieData = [
    { name: 'Recorrente', value: data.recurringExpenseInCents },
    { name: 'Pontual', value: data.oneTimeExpenseInCents },
  ].filter((d) => d.value > 0);

  const COLORS = ['#8b5cf6', '#f97316']; // Violet and Amber

  return (
    <Card className="border-border/50 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#f97316]" />
          <CardTitle className="text-sm font-semibold text-foreground/90">
            Recorrente vs Pontual
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center p-0 pb-6">
        {pieData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-sm">Sem despesas</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Chart Area */}
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={85}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-6 px-4">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ background: COLORS[i] }}
                  />
                  <span className="text-muted-foreground text-xs font-medium">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
