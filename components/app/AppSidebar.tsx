"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProjectSelector } from "./ProjectSelector";
import { NavLink } from "./NavLink";

interface AppSidebarProps {
  projectId: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ projectId, collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const items = [
    { href: `/projects/${projectId}`, label: "Overview", icon: "📊" },
    { href: `/projects/${projectId}/risks`, label: "Risks", icon: "⚠️" },
    { href: `/projects/${projectId}/decisions`, label: "Decisions", icon: "✅" },
    { href: `/projects/${projectId}/documents`, label: "Documents", icon: "📄" },
    { href: `/projects/${projectId}/qa`, label: "Q&A", icon: "❓" },
  ];

  return (
    <div className="flex h-full flex-col gap-6 w-full">
      {/* Header with toggle button */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3H21V21H3V3ZM5 5V19H19V5H5ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H15V17H7V15Z" />
          </svg>
        </div>
        {!collapsed && (
          <Link href={`/projects/${projectId}`} className="text-xl font-semibold text-zinc-900">
            AI PM Hub
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1 hover:bg-zinc-200 rounded transition-colors"
            title="Collapse sidebar"
          >
            <svg 
              className="h-4 w-4 text-zinc-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Toggle button when collapsed */}
      {collapsed && (
        <div className="flex justify-center w-full">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-zinc-200 rounded transition-colors"
            title="Expand sidebar"
          >
            <svg 
              className="h-4 w-4 text-zinc-600 rotate-180" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Project Selector - hide when collapsed */}
      {!collapsed && (
        <div className="w-full">
          <ProjectSelector currentProjectId={projectId} />
        </div>
      )}

      <div className="h-px w-full bg-zinc-300" />

      {/* Navigation */}
      <nav aria-label="Project" className="flex flex-col gap-1 w-full">
        {items.map((i) => (
          <NavLink 
            key={i.href} 
            href={i.href} 
            active={pathname === i.href}
            collapsed={collapsed}
            icon={i.icon}
          >
            {i.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer - hide when collapsed */}
      {!collapsed && (
        <div className="mt-auto text-xs text-zinc-600">Europe/London</div>
      )}
    </div>
  );
}
