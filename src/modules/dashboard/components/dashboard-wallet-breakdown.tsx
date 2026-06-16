'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyFromCents } from '@/modules/transactions/helpers/format-currency';

import { WalletBreakdown } from '../actions/get-dashboard-data';

interface DashboardWalletBreakdownProps {
  data: WalletBreakdown[];
}

export function DashboardWalletBreakdown({
  data,
}: DashboardWalletBreakdownProps) {
  return (
    <Card className="border-border/50 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#ec4899]" />
            <CardTitle className="text-sm font-semibold text-foreground/90">
              Gastos por Carteira
            </CardTitle>
          </div>
          <div className="text-muted-foreground bg-muted/50 rounded-md px-2 py-1 text-[10px]">
            Distribuição
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-6 space-y-5">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-sm">Sem dados</p>
          </div>
        ) : (
          data.map((w) => {
            const total = w.recurringInCents + w.oneTimeInCents;
            if (total === 0) return null;
            return (
              <div key={w.walletId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground/90">
                    {w.walletName}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium tabular-nums">
                    {formatCurrencyFromCents(total)}
                  </span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-sm bg-muted/30">
                  {w.recurringInCents > 0 && (
                    <div
                      className="h-full bg-[#8b5cf6] transition-all"
                      style={{
                        width: `${(w.recurringInCents / total) * 100}%`,
                      }}
                    />
                  )}
                  {w.oneTimeInCents > 0 && (
                    <div
                      className="h-full bg-[#f97316] transition-all"
                      style={{
                        width: `${(w.oneTimeInCents / total) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
                    {formatCurrencyFromCents(w.recurringInCents)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {formatCurrencyFromCents(w.oneTimeInCents)}
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
