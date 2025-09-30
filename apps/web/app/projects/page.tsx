"use client";

import { useEffect, useState } from "react";
import { ProjectActions } from "./ProjectActions";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "./EmptyState";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
        const fetchProjects = async () => {
          try {
            const response = await fetch("/api/projects-working");
            if (response.ok) {
              const data = await response.json();
              setProjects(data.items || []);
            } else {
              setError("Failed to load projects");
            }
          } catch (err) {
            console.error("Error fetching projects:", err);
            setError("Failed to load projects");
          } finally {
            setLoading(false);
          }
        };

    fetchProjects();
  }, []);

  if (loading) {
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
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Database Not Initialized</h2>
              <p className="text-muted-foreground mb-4">
                Please use the Database Setup section in the sidebar to initialize the database.
              </p>
              <p className="text-sm text-muted-foreground">
                Once the database is set up, you'll be able to create and manage projects.
              </p>
            </div>
          </div>
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
          <ProjectActions />
        </div>

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
