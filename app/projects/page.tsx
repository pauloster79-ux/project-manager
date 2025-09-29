"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/catalyst/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";

type Project = { 
  id: string; 
  name: string; 
  description?: string; 
  updated_at: string;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setProjects(data.items || []);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError(error instanceof Error ? error.message : "Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async (name: string = "New Project", description: string = "A new project") => {
    setCreating(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description
        })
      });

      if (response.ok) {
        const newProject = await response.json();
        // Navigate to the new project's risks page
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

  const createDemoProject = async () => {
    await createNewProject("Demo Project", "A demonstration project with sample data");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Loading Projects...</h1>
          <div className="text-muted-foreground">Please wait while we load your projects.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Error Loading Projects</h1>
          <div className="text-muted-foreground mb-4">{error}</div>
          <div className="text-sm text-muted-foreground mb-6">
            The database may not be initialized. Please check the database setup.
          </div>
          <Button onClick={fetchProjects} outline>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Projects</h1>
            <p className="text-muted-foreground mt-2">
              Manage your projects, risks, and decisions
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={createDemoProject}
              disabled={creating}
              outline
            >
              {creating ? "Creating..." : "Create Demo Project"}
            </Button>
            <Button
              onClick={() => createNewProject()}
              disabled={creating}
              color="blue"
            >
              {creating ? "Creating..." : "New Project"}
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first project
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={createDemoProject} disabled={creating} outline>
                  {creating ? "Creating..." : "Create Demo Project"}
                </Button>
                <Button onClick={() => createNewProject()} disabled={creating}>
                  {creating ? "Creating..." : "Create Your First Project"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/projects/${project.id}/risks`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {project.description || "No description"}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
