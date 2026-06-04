import TransactionsPage from '@/modules/transactions/components/page';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const Page = ({ searchParams }: PageProps) => {
  return <TransactionsPage searchParams={searchParams} />;
};

export default Page;
