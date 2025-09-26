"use client";

import { useRouter } from "next/navigation";
import { Listbox, ListboxOption } from "@/components/catalyst/listbox";

// Replace with GET /api/projects in Packet 7a
const STUB_PROJECTS = [
  { id: "demo", name: "Demo Project" },
  { id: "alpha", name: "Alpha Rollout" },
];

export function ProjectSelector({ currentProjectId }: { currentProjectId: string }) {
  const router = useRouter();

  return (
    <Listbox
      value={currentProjectId}
      onChange={(id) => router.push(`/projects/${id}/risks`)}
      placeholder="Select project"
    >
      {STUB_PROJECTS.map((p) => (
        <ListboxOption key={p.id} value={p.id}>
          {p.name}
        </ListboxOption>
      ))}
    </Listbox>
  );
}
