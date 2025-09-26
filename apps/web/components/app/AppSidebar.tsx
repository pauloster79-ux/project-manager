"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProjectSelector } from "./ProjectSelector";
import { NavLink } from "./NavLink";

export function AppSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const items = [
    { href: `/projects/${projectId}`, label: "Overview" },
    { href: `/projects/${projectId}/risks`, label: "Risks" },
    { href: `/projects/${projectId}/decisions`, label: "Decisions" },
    { href: `/projects/${projectId}/documents`, label: "Documents" },
    { href: `/projects/${projectId}/qa`, label: "Q&A" },
  ];

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-900">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
          </svg>
        </div>
        <Link href={`/projects/${projectId}`} className="text-xl font-semibold text-white">
          AI PM Hub
        </Link>
      </div>

      <div>
        <ProjectSelector currentProjectId={projectId} />
      </div>

      <div className="h-px w-full bg-zinc-700" />

      <nav aria-label="Project" className="flex flex-col gap-1">
        {items.map((i) => (
          <NavLink key={i.href} href={i.href} active={pathname === i.href}>
            {i.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto text-xs text-zinc-400">Europe/London</div>
    </div>
  );
}
