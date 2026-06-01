"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { Breadcrumb } from "./breadcrumb";

export const AppHeader = () => {
  const { open } = useSidebar();

  return (
    <header
      className={cn(
        "border-border flex items-center border-b transition-all duration-300",
        open
          ? "h-16 gap-4 px-4"
          : "h-12 gap-2 px-3",
      )}
    >
      <SidebarTrigger className="cursor-pointer"/>

      <Breadcrumb/>
    </header>
  );
};