import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer = ({ children, className }: PageLayoutProps) => {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  );
};

export const PageHeader = ({ children, className }: PageLayoutProps) => {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      {children}
    </div>
  );
};

export const PageHeaderContent = ({ children, className }: PageLayoutProps) => {
  return (
    <div className={cn('min-w-0 flex-1 space-y-1', className)}>{children}</div>
  );
};

export const PageTitle = ({ children, className }: PageLayoutProps) => {
  return (
    <h1 className={cn('text-xl font-bold break-words sm:text-2xl', className)}>
      {children}
    </h1>
  );
};

export const PageDescription = ({ children, className }: PageLayoutProps) => {
  return (
    <p className={cn('text-muted-foreground max-w-3xl text-sm', className)}>
      {children}
    </p>
  );
};

export const PageActions = ({ children, className }: PageLayoutProps) => {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end',
        className,
      )}
    >
      {children}
    </div>
  );
};

export const PageContent = ({ children, className }: PageLayoutProps) => {
  return <div className={cn('min-w-0 space-y-6', className)}>{children}</div>;
};
