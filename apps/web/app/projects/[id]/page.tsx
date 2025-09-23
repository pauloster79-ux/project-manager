import { prisma } from "@pm/db";
export default async function ProjectOverview({ params }: any) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return <div style={{ padding:24 }}>Not found</div>;
  const [tasks, risks] = await Promise.all([
    prisma.task.count({ where: { projectId: project.id } }),
    prisma.risk.count({ where: { projectId: project.id } }),
  ]);
  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description ?? "No description."}</p>
      <p><b>Tasks:</b> {tasks} &nbsp; <b>Risks:</b> {risks}</p>
    </div>
  );
}
