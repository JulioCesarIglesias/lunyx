import { SidebarProvider } from "@/components/ui/sidebar";

import { AppHeader } from "./_components/app-header";
import { AppSidebar } from "./_components/app-sidebar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark">
      <SidebarProvider>
        <div className="bg-background text-foreground flex min-h-screen w-full">
          <AppSidebar />

          <main className="w-full">
            <AppHeader />

            <div className="p-4">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}