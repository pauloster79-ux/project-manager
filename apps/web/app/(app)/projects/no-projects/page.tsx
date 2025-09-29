"use client";

import { Button } from "@/components/catalyst/button";

export default function NoProjectsPage() {
  const createFirstProject = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My First Project",
          description: "A sample project to get started"
        })
      });

      if (response.ok) {
        const newProject = await response.json();
        window.location.href = `/projects/${newProject.id}/risks`;
      } else {
        alert("Failed to create project");
      }
    } catch (error) {
      alert("Error creating project");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">No Projects Found</h1>
      <p className="text-muted-foreground">
        You don't have any projects yet. Create your first project to get started.
      </p>
      <Button onClick={createFirstProject}>
        Create First Project
      </Button>
    </div>
  );
}
