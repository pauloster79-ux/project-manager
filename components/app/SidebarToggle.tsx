"use client";

import { useState } from "react";
import { AppSidebar } from "./AppSidebar";

interface SidebarToggleProps {
  projectId: string;
}

export function SidebarToggle({ projectId }: SidebarToggleProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggle = () => {
    console.log('Toggling sidebar, current state:', sidebarCollapsed);
    setSidebarCollapsed(!sidebarCollapsed);
    alert(`Sidebar toggled! New state: ${!sidebarCollapsed ? 'collapsed' : 'expanded'}`);
  };

  return (
    <aside className={`hidden lg:flex shrink-0 transition-all duration-300 ease-in-out ${
      sidebarCollapsed ? 'w-16 bg-red-200' : 'w-80 bg-zinc-100'
    }`}>
      <div className="flex h-screen flex-col p-4 w-full">
        <AppSidebar 
          projectId={projectId} 
          collapsed={sidebarCollapsed}
          onToggle={handleToggle}
        />
      </div>
    </aside>
  );
}
