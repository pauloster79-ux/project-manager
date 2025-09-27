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
    <div className="flex h-full flex-col gap-6 w-full">
      <div className="flex items-center gap-3 w-full">
        <div className="flex h-10 w-10 items-center justify-center">
          <svg className="h-8 w-8" viewBox="0 0 100 100" fill="none">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Main organic shape with interconnected rounded elements */}
            <path
              d="M20 30 Q30 20, 40 30 Q50 40, 60 30 Q70 20, 80 30 Q85 40, 80 50 Q75 60, 70 50 Q60 40, 50 50 Q40 60, 30 50 Q25 40, 20 30 Z"
              fill="#4A5568"
              filter="url(#glow)"
            />
            <path
              d="M25 35 Q35 25, 45 35 Q55 45, 65 35 Q75 25, 85 35 Q90 45, 85 55 Q80 65, 75 55 Q65 45, 55 55 Q45 65, 35 55 Q30 45, 25 35 Z"
              fill="#718096"
            />
            <path
              d="M30 40 Q40 30, 50 40 Q60 50, 70 40 Q80 30, 90 40 Q95 50, 90 60 Q85 70, 80 60 Q70 50, 60 60 Q50 70, 40 60 Q35 50, 30 40 Z"
              fill="#A0AEC0"
            />
            {/* Central void/negative space */}
            <path
              d="M45 45 Q50 40, 55 45 Q60 50, 55 55 Q50 60, 45 55 Q40 50, 45 45 Z"
              fill="#1A202C"
            />
          </svg>
        </div>
        <Link href={`/projects/${projectId}`} className="text-xl font-semibold text-zinc-900">
          AI PM Hub
        </Link>
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

      <div className="mt-auto text-xs text-zinc-600">Europe/London</div>
    </div>
  );
}
