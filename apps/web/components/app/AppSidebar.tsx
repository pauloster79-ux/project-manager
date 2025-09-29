"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectSelector } from "./ProjectSelector";
import { NavLink } from "./NavLink";
import { OrgSwitcher } from "../OrgSwitcher";
import { DatabaseInit } from "../DatabaseInit";

export function AppSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // Check if we're on the projects list page
  const isProjectsListPage = pathname === '/projects';

  const projectItems = [
    { href: `/projects/${projectId}`, label: "Overview" },
    { href: `/projects/${projectId}/risks`, label: "Risks" },
    { href: `/projects/${projectId}/decisions`, label: "Decisions" },
    { href: `/projects/${projectId}/documents`, label: "Documents" },
  ];

  const orgItems = [
    { href: `/projects/${projectId}/people`, label: "People" },
  ];

  const settingsItems = [
    { href: `/projects/${projectId}/settings`, label: "Settings" },
  ];

  const handleProjectsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigating to /projects');
    router.push('/projects');
  };

  return (
    <div className="flex h-full flex-col gap-4 w-full">
      <div className="flex items-center gap-3 w-full">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3H21V21H3V3ZM5 5V19H19V5H5ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H15V17H7V15Z" />
          </svg>
        </div>
        <Link href={`/projects/${projectId}`} className="text-xl font-semibold text-zinc-900">
          AI PM Hub
        </Link>
      </div>

      <div className="w-full">
        <OrgSwitcher />
      </div>

      <div className="w-full">
        <DatabaseInit />
      </div>

      <div className="h-px w-full bg-zinc-300" />

      {/* Projects Section */}
      <div className="w-full">
        <button
          onClick={handleProjectsClick}
          className={`relative flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors ${
            isProjectsListPage 
              ? 'text-zinc-900 bg-white font-semibold' 
              : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 font-medium'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            All Projects
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {isProjectsListPage && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 rounded-r-full" />
          )}
        </button>
        
        {!isProjectsListPage && (
          <div className="mt-2">
            <ProjectSelector currentProjectId={projectId} />
          </div>
        )}
      </div>

      {!isProjectsListPage && (
        <>
          <div className="h-px w-full bg-zinc-300" />

          {/* Project Navigation */}
          <nav aria-label="Project" className="flex flex-col gap-1 w-full">
            {projectItems.map((i) => (
              <NavLink key={i.href} href={i.href} active={pathname === i.href}>
                {i.label}
              </NavLink>
            ))}
            {orgItems.map((i) => (
              <NavLink key={i.href} href={i.href} active={pathname === i.href}>
                {i.label}
              </NavLink>
            ))}
          </nav>

          {/* Settings Section */}
          <div className="w-full">
            <button
              onClick={() => setSettingsExpanded(!settingsExpanded)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${settingsExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {settingsExpanded && (
              <nav aria-label="Settings" className="flex flex-col gap-1 w-full mt-2">
                {settingsItems.map((i) => (
                  <NavLink key={i.href} href={i.href} active={pathname === i.href}>
                    {i.label}
                  </NavLink>
                ))}
              </nav>
            )}
          </div>
        </>
      )}

      <div className="mt-auto">
        <div className="text-xs text-zinc-600">Europe/London</div>
      </div>
    </div>
  );
}
