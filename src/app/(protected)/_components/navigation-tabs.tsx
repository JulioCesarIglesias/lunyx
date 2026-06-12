'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navigationItems } from '@/app/(protected)/_constants/navigation';
import { cn } from '@/lib/utils';

export const NavigationTabs = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden min-w-0 md:block">
      <div className="flex min-w-max items-center gap-4 lg:gap-8">
        {navigationItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative py-2 text-sm font-medium whitespace-nowrap transition-colors',
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}

              {active && (
                <span className="bg-primary absolute right-0 -bottom-0.5 left-0 h-0.5 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
