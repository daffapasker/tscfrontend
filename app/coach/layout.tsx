"use client";

import React from "react";
import { DashboardSidebar } from "@/components/SidebarDashboard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface CoachLayoutProps {
  children: React.ReactNode;
}

export default function CoachLayout({ children }: CoachLayoutProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="p-6">{children}</SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
