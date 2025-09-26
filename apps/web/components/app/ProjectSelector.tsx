"use client";

import { useRouter } from "next/navigation";
import { Listbox, ListboxOption } from "@/components/catalyst/listbox";

// Replace with GET /api/projects in Packet 7a
const STUB_PROJECTS = [
  { id: "demo", name: "Demo Project", icon: "⚙️" },
  { id: "alpha", name: "Alpha Rollout", icon: "🚀" },
];

export function ProjectSelector({ currentProjectId }: { currentProjectId: string }) {
  const router = useRouter();
  
  // If the current project ID doesn't match any stub projects, use the first one as default
  const validProjectId = STUB_PROJECTS.find(p => p.id === currentProjectId)?.id || STUB_PROJECTS[0].id;

  return (
    <Listbox
      value={validProjectId}
      onChange={(id) => router.push(`/projects/${id}/risks`)}
      placeholder="Select project"
    >
      {STUB_PROJECTS.map((p) => (
        <ListboxOption key={p.id} value={p.id}>
          <div className="flex items-center gap-2">
            <span>{p.icon}</span>
            <span>{p.name}</span>
          </div>
        </ListboxOption>
      ))}
    </Listbox>
  );
}
