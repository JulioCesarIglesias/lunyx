import { ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { formatCurrencyFromCents } from '../helpers/format-currency';
import { TransactionSummary } from '../types/occurrence-with-relations';

interface TransactionSummaryCardsProps {
  summary: TransactionSummary;
}

const TransactionSummaryCards = ({ summary }: TransactionSummaryCardsProps) => {
  const cards = [
    {
      title: 'Receitas',
      value: formatCurrencyFromCents(summary.totalIncomeInCents),
      icon: ArrowUpRight,
      className: 'text-emerald-600',
      bgClassName: 'bg-emerald-500/10',
    },
    {
      title: 'Despesas',
      value: formatCurrencyFromCents(summary.totalExpenseInCents),
      icon: ArrowDownLeft,
      className: 'text-rose-600',
      bgClassName: 'bg-rose-500/10',
    },
    {
      title: 'Saldo',
      value: formatCurrencyFromCents(summary.balanceInCents),
      icon: Scale,
      className:
        summary.balanceInCents >= 0 ? 'text-emerald-600' : 'text-rose-600',
      bgClassName:
        summary.balanceInCents >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {card.title}
            </CardTitle>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg',
                card.bgClassName,
              )}
            >
              <card.icon className={cn('h-4 w-4', card.className)} />
            </div>
          </CardHeader>
          <CardContent>
            <p className={cn('text-2xl font-semibold tracking-tight', card.className)}>
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TransactionSummaryCards;
