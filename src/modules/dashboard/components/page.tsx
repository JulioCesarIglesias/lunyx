import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/components/ui/page-container';
import { auth } from '@/lib/auth';

import {
  getDashboardData,
  parseDashboardFilters,
} from '../actions/get-dashboard-data';
import { DashboardContent } from '../components/dashboard-content';

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DashboardModule = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/authentication');
  }

  const resolved = await searchParams;
  const filters = parseDashboardFilters(resolved);

  const data = await getDashboardData(session.user.id, filters);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Resumo financeiro do período selecionado
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <DashboardContent data={data} />
      </PageContent>
    </PageContainer>
  );
};

export default DashboardModule;
