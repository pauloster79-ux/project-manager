"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectTrigger, SelectItem, SelectValue } from "@/components/catalyst/select-advanced";

type Project = { id: string; name: string };

export function ProjectSelector({ currentProjectId }: { currentProjectId: string }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/projects");
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
    <Select value={value} onValueChange={(id) => router.push(`/projects/${id}/risks`)} disabled={loading || !projects.length}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading…" : "Select project"}>
          {selectedProject?.name || (loading ? "Loading…" : "Select project")}
        </SelectValue>
      </SelectTrigger>
      {projects.map((p) => (
        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
      ))}
    </Select>
  );
}
