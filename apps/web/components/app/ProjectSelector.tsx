"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Listbox, ListboxOption } from "@/components/catalyst/listbox";

type Project = { id: string; name: string };

export function ProjectSelector({ currentProjectId }: { currentProjectId: string }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setProjects(data.items || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedProject = projects.find(p => p.id === currentProjectId);
  const value = selectedProject?.id ?? currentProjectId;

  return (
    <Listbox
      value={value}
      onChange={(id) => router.push(`/projects/${id}/risks`)}
      placeholder={loading ? "Loading…" : "Select project"}
      className="w-full"
    >
      {projects.map((p) => (
        <ListboxOption key={p.id} value={p.id}>
          {p.name}
        </ListboxOption>
      ))}
    </Listbox>
  );
}
