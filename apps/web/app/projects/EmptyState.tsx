"use client";

import { useTransition } from "react";
import { Card, CardContent } from "@/components/catalyst/card";
import { Button } from "@/components/catalyst/button";
import { createProject, createDemoProject } from "./actions";

export function EmptyState() {
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
    <Card>
      <CardContent className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No projects found</h3>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first project
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={handleCreateDemoProject} disabled={isPending} outline>
            {isPending ? "Creating..." : "Create Demo Project"}
          </Button>
          <Button onClick={handleCreateProject} disabled={isPending}>
            {isPending ? "Creating..." : "Create Your First Project"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
