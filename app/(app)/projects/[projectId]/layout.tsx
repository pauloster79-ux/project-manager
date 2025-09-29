"use client";

import { AppSidebar } from "@/components/app/AppSidebar";
import { MobileTopBar } from "@/components/app/MobileTopBar";
import { useState } from "react";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const { projectId } = params;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggle = () => {
    console.log('Toggling sidebar, current state:', sidebarCollapsed);
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Mobile top bar with menu button */}
      <div className="lg:hidden">
        <MobileTopBar projectId={projectId} />
      </div>
      <div className="mx-auto flex w-full">
        {/* Content */}
        <main className="flex-1 bg-white p-8">{children}</main>

        {/* Sidebar (hidden on mobile; shown on lg+) - positioned on the RIGHT */}
        <aside className={`hidden lg:flex shrink-0 bg-zinc-100 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}>
          <div className="flex h-screen flex-col p-4 w-full">
            <AppSidebar 
              projectId={projectId} 
              collapsed={sidebarCollapsed}
              onToggle={handleToggle}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
