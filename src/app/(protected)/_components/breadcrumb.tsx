"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const breadcrumbNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  transactions: "Transações",
  wallets: "Carteiras",
  categories: "Categorias",
};

export const Breadcrumb = () => {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-2 text-sm">
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join(">");

        const isLast = index === segments.length - 1;

        return (
          <div key={href} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Menu</span>  
                <span className="text-muted-foreground"> &gt; </span>                  
            </div>
            {index > 0 && (
              <span className="text-muted-foreground">/</span>
            )}

            {isLast ? (
              <span className="font-medium">
                {breadcrumbNameMap[segment] ?? segment}
              </span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {breadcrumbNameMap[segment] ?? segment}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};