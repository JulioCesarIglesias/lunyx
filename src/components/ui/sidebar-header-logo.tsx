"use client";

import Image from "next/image";

import { useSidebar } from "@/components/ui/sidebar";

export function SidebarHeaderLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div
      // border-b
      className={`flex items-center ${
        isCollapsed ? "justify-center py-2" : "justify-start p-4"
      }`}
    >
      <Image
        src={isCollapsed ? "/Logo-min.svg" : "/Logo.svg"}
        alt="Clinic Z"
        width={isCollapsed ? 28 : 207}
        height={isCollapsed ? 28 : 32}
        className="shrink-0"
      />
    </div>
  );
}
