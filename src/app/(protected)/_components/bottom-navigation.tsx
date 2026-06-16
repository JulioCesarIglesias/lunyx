'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navigationItems } from '@/app/(protected)/_constants/navigation';
import { cn } from '@/lib/utils';

export const BottomNavigation = () => {
  const pathname = usePathname();

  return (
    <div className="bg-background/95 border-border fixed right-0 bottom-0 left-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div
        className="grid min-h-16"
        style={{
          gridTemplateColumns: `repeat(${navigationItems.length}, minmax(0, 1fr))`,
        }}
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] leading-none',
                active ? 'text-indigo-500' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />

              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
