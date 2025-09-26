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
    <div className="flex h-full w-72 flex-col gap-4">
      <Link href={`/projects/${projectId}`} className="text-xl font-semibold">
        AI PM Hub
      </Link>

      <div>
        <div className="mb-2 text-xs text-muted-foreground">Project</div>
        <ProjectSelector currentProjectId={projectId} />
      </div>

      <div className="my-2 h-px w-full bg-border" />

      <nav aria-label="Project" className="flex flex-col gap-1">
        {items.map((i) => (
          <NavLink key={i.href} href={i.href} active={pathname === i.href}>
            {i.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto text-xs text-muted-foreground">Europe/London</div>
    </div>
  );
}
