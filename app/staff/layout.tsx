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
			<SidebarProvider defaultOpen={true}>
				<DashboardSidebar />
				<SidebarInset className="p-4 md:p-6 lg:p-6 pt-16 lg:pt-6">
					<main className="w-full max-w-full overflow-x-auto">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	);
}