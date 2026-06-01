import { ArrowRightLeft} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageActions, PageContainer, PageContent, PageDescription, PageHeader, PageHeaderContent, PageTitle } from "@/components/ui/page-container"

const TransactionsPage = async () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Transações</PageTitle>
          <PageDescription>
            Gerencie suas transações
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          {/* <AddPatientButton /> */}
          <Button>Adicionar</Button>
        </PageActions>
      </PageHeader>
      <PageContent>
        {/* {patients.length === 0 ? ( */}
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center">
              <ArrowRightLeft className="text-muted-foreground h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Nenhuma transação encontrada
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Adicione sua primeira transação para começar
            </p>
          </div>
        {/* ) : ( */}
          {/* // <DataTable columns={patientTableColumns} data={patients} /> */}
          {/* "" */}
        {/* )} */}
      </PageContent>
    </PageContainer>
  );
};

export default TransactionsPage;