// import { SidebarProvider } from '@/components/ui/sidebar';

// import { AppHeader } from './_components/app-header';
import { AppHeaderV2 } from './_components/app-header-v2';
// import { AppSidebar } from './_components/app-sidebar';
import { BottomNavigation } from './_components/bottom-navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark">
      {/* Versão Antiga */}
      {/* <SidebarProvider> */}
      <div className="bg-background text-foreground flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Versão Antiga */}
        {/* <AppSidebar /> */}

        <AppHeaderV2 />

        {/* Versão Antiga */}
        {/* <main className="w-full"> */}

        {/* Versão Nova */}
        <main className="w-full flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
          {/* <AppHeader /> */}

          {children}
        </main>

        <BottomNavigation />
      </div>
      {/* </SidebarProvider> */}
    </div>
  );
}
