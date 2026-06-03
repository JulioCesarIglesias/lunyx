import { asc, eq } from 'drizzle-orm';
import { Wallet } from 'lucide-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/components/ui/page-container';
import { db } from '@/infrastructure/db';
import { walletsTable } from '@/infrastructure/db/schema';
import { auth } from '@/lib/auth';

import AddWalletButton from './add-wallet-button';
import WalletCard from './wallet-card';

const WalletsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/authentication');
  }

  const wallets = await db.query.walletsTable.findMany({
    where: eq(walletsTable.userId, session.user.id),
    orderBy: asc(walletsTable.name),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Carteiras</PageTitle>
          <PageDescription>Gerencie suas carteiras</PageDescription>
        </PageHeaderContent>

        <PageActions>
          <AddWalletButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        {wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center">
              <Wallet className="text-muted-foreground h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Nenhuma carteira cadastrada
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Cadastre uma carteira para começar a gerenciar suas transações.
            </p>
          </div>
        ) : (
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,320px))] gap-6">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default WalletsPage;
