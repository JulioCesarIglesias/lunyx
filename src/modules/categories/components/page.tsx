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
import { auth } from '@/lib/auth';

import { getCategories } from '../actions/get-category/get-categories';
import AddCategoryButton from './add-category-button';
import CategoriesList from './categories-list';

const CategoriesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/authentication');
  }

  const categories = await getCategories(session.user.id);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Categorias</PageTitle>
          <PageDescription>Gerencie suas categorias</PageDescription>
        </PageHeaderContent>

        <PageActions>
          <AddCategoryButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        <CategoriesList categories={categories} />
      </PageContent>
    </PageContainer>
  );
};

export default CategoriesPage;
