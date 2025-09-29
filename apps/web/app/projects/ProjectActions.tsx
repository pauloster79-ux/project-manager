"use client";

import { useTransition } from "react";
import { Button } from "@/components/catalyst/button";
import { createProject, createDemoProject } from "./actions";

export function ProjectActions() {
  const [isPending, startTransition] = useTransition();

  const handleCreateProject = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", "New Project");
        formData.append("description", "A new project");
        await createProject(formData);
      } catch (error) {
        alert("Failed to create project");
      }
    });
  };

  const handleCreateDemoProject = () => {
    startTransition(async () => {
      try {
        await createDemoProject();
      } catch (error) {
        alert("Failed to create demo project");
      }
    });
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleCreateDemoProject}
        disabled={isPending}
        outline
      >
        {isPending ? "Creating..." : "Create Demo Project"}
      </Button>
      <Button
        onClick={handleCreateProject}
        disabled={isPending}
        color="blue"
      >
        {isPending ? "Creating..." : "New Project"}
      </Button>
    </div>
  );
}
