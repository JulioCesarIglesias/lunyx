import { ArrowRightLeft } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/components/ui/page-container';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';

import {
  getCategoriesForSelect,
  getOccurrences,
  getOccurrenceSummary,
  getWalletsForSelect,
  parseTransactionFilters,
} from '../actions/get-transactions/get-transactions';
import AddTransactionButton from './add-transaction-button';
import TransactionsContent from './transactions-content';

interface TransactionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function FiltersSkeleton() {
  return <Skeleton className="h-[140px] w-full rounded-lg" />;
}

const TransactionsPage = async ({ searchParams }: TransactionsPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/authentication');
  }

  const resolvedSearchParams = await searchParams;
  const filters = parseTransactionFilters(resolvedSearchParams);

  const [occurrences, summary, wallets, categories] = await Promise.all([
    getOccurrences(session.user.id, filters),
    getOccurrenceSummary(session.user.id, filters),
    getWalletsForSelect(session.user.id),
    getCategoriesForSelect(session.user.id),
  ]);

  const canCreateTransaction = wallets.length > 0;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Transações</PageTitle>
          <PageDescription>
            Lançamentos por vencimento — parcelas aparecem no mês em que vencem
          </PageDescription>
        </PageHeaderContent>

        <PageActions>
          {canCreateTransaction ? (
            <AddTransactionButton wallets={wallets} categories={categories} />
          ) : (
            <Button asChild className="cursor-pointer">
              <Link href="/wallets">
                <ArrowRightLeft />
                Cadastrar carteira
              </Link>
            </Button>
          )}
        </PageActions>
      </PageHeader>

      <PageContent>
        {wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center">
              <ArrowRightLeft className="text-muted-foreground h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Cadastre uma carteira primeiro
            </h3>
            <p className="text-muted-foreground mt-1 max-w-md text-center text-sm">
              Para registrar transações, você precisa de ao menos uma carteira
              ativa.
            </p>
            <Button asChild className="mt-6 cursor-pointer">
              <Link href="/wallets">Ir para carteiras</Link>
            </Button>
          </div>
        ) : (
          <Suspense fallback={<FiltersSkeleton />}>
            <TransactionsContent
              occurrences={occurrences}
              summary={summary}
              filters={filters}
              wallets={wallets}
              categories={categories}
            />
          </Suspense>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default TransactionsPage;
