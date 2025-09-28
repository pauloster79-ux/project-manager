"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProjectSelector } from "./ProjectSelector";
import { NavLink } from "./NavLink";
import { OrgSwitcher } from "../OrgSwitcher";
import { DatabaseInit } from "../DatabaseInit";

export function AppSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const items = [
    { href: `/projects/${projectId}`, label: "Overview" },
    { href: `/projects/${projectId}/risks`, label: "Risks" },
    { href: `/projects/${projectId}/decisions`, label: "Decisions" },
    { href: `/projects/${projectId}/documents`, label: "Documents" },
  ];

  const orgItems = [
    { href: `/projects/${projectId}/people`, label: "People" },
  ];

  return (
    <div className="flex h-full flex-col gap-6 w-full">
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
        <ProjectSelector currentProjectId={projectId} />
      </div>

      <div className="h-px w-full bg-zinc-300" />

      <nav aria-label="Project" className="flex flex-col gap-1 w-full">
        {items.map((i) => (
          <NavLink key={i.href} href={i.href} active={pathname === i.href}>
            {i.label}
          </NavLink>
        ))}
      </nav>

      <div className="h-px w-full bg-zinc-300" />

      <nav aria-label="Organization" className="flex flex-col gap-1 w-full">
        {orgItems.map((i) => (
          <NavLink key={i.href} href={i.href} active={pathname === i.href}>
            {i.label}
          </NavLink>
        ))}
      </nav>

            <div className="mt-auto space-y-4">
              <DatabaseInit />
              <div className="text-xs text-zinc-600">Europe/London</div>
            </div>
          </div>
        );
      }
