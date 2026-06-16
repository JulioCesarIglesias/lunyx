import DashboardModule from '@/modules/dashboard/components/page';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DashboardPage = ({ searchParams }: PageProps) => {
  return <DashboardModule searchParams={searchParams} />;
};

export default DashboardPage;