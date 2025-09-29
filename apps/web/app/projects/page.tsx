import { ProjectActions } from "./ProjectActions";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "./EmptyState";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";

export default async function ProjectsPage() {
  // Fetch data directly in the server component to avoid import chain issues
  let projects: any[] = [];
  let error: string | undefined;
  
  try {
    const user = await getCurrentUser();
    const orgId = await getCurrentOrgId();
    
    await requireAccess({ userId: user.id, orgId, need: "org:read" });

    // Dynamic import to prevent bundling
    const { query } = await import("@/src/lib/db");
    const { rows } = await query(
      `select id, name, description, updated_at from projects where org_id = $1 order by updated_at desc`,
      [orgId]
    );
    
    projects = rows;
  } catch (err) {
    console.error("Error fetching projects:", err);
    error = err instanceof Error ? err.message : "Failed to load projects";
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
