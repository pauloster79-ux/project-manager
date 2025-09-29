"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Listbox, ListboxOption } from "@/components/catalyst/listbox";

type Project = { id: string; name: string };

export function ProjectSelector({ currentProjectId }: { currentProjectId: string }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

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

  const createNewProject = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Project",
          description: "A new project"
        })
      });

      if (response.ok) {
        const newProject = await response.json();
        // Refresh the projects list
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.items || []);
        }
        // Navigate to the new project
        router.push(`/projects/${newProject.id}/risks`);
      } else {
        alert("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project");
    } finally {
      setCreating(false);
    }
  };

  const selectedProject = projects.find(p => p.id === currentProjectId);
  const value = selectedProject?.id ?? currentProjectId;

  return (
    <Listbox
      value={value}
      onChange={(id) => {
        if (id === "new-project") {
          createNewProject();
        } else {
          router.push(`/projects/${id}/risks`);
        }
      }}
      placeholder={loading ? "Loading…" : "Select project"}
      className="w-full"
    >
      {projects.map((p) => (
        <ListboxOption key={p.id} value={p.id}>
          {p.name}
        </ListboxOption>
      ))}
      <ListboxOption value="new-project" className="border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {creating ? "Creating..." : "New project..."}
        </div>
      </ListboxOption>
    </Listbox>
  );
}
