'use client';

import 'dayjs/locale/pt-br';

import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface MonthNavigationProps {
  month: number;
  year: number;
}

dayjs.locale('pt-br');

const MonthNavigation = ({ month, year }: MonthNavigationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentDate = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);

    const newDate =
      direction === 'next'
        ? currentDate.add(1, 'month')
        : currentDate.subtract(1, 'month');

    const params = new URLSearchParams(searchParams.toString());

    params.set('month', String(newDate.month() + 1));
    params.set('year', String(newDate.year()));

    router.push(`${pathname}?${params.toString()}`);
  };

  const currentDate = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);

  const monthLabel =
    currentDate.format('MMMM').charAt(0).toUpperCase() +
    currentDate.format('MMMM').slice(1);

  return (
    <div className="bg-card border-border mb-0 flex items-center justify-between rounded-2xl border px-2 py-2">
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-primary/10 h-9 w-9 rounded-full"
        onClick={() => navigateMonth('prev')}
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={3} />
      </Button>

      <div className="text-center">
        <p className="text-base font-semibold">
          {monthLabel} / {currentDate.format('YY')}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-primary/10 h-9 w-9 rounded-full"
        onClick={() => navigateMonth('next')}
      >
        <ChevronRight className="h-6 w-6" strokeWidth={3} />
      </Button>
    </div>
  );
};

export default MonthNavigation;
