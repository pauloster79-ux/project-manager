"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/catalyst/select-advanced";

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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = projects.find(p => p.id === currentProjectId)?.id ?? currentProjectId;

  return (
    <Select value={value} onValueChange={(id) => router.push(`/projects/${id}/risks`)} disabled={loading || !projects.length}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading…" : "Select project"} />
      </SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
