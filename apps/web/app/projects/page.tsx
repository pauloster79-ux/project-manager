import { getProjects } from "./lib";
import { ProjectActions } from "./ProjectActions";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "./EmptyState";

export default async function ProjectsPage() {
  const { projects, error } = await getProjects();

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
