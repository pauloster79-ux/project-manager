"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProjectsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Fetch the first available project and redirect to it
    const redirectToFirstProject = async () => {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const firstProject = data.items[0];
            router.push(`/projects/${firstProject.id}/risks`);
          } else {
            // No projects found, redirect to create one or show error
            router.push("/projects/no-projects");
          }
        } else {
          console.error("Failed to fetch projects:", response.statusText);
          router.push("/projects/error");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        router.push("/projects/error");
      }
    };

    redirectToFirstProject();
  }, [router]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Loading Projects...</h1>
      <p className="text-muted-foreground">Redirecting to your first project...</p>
    </div>
  );
}
