import { prisma } from "@pm/db";
export default async function TasksPage({ params }: any) {
  const items = await prisma.task.findMany({ where: { projectId: params.id }, orderBy: { updatedAt: "desc" } });
  return <div><h2>Tasks</h2><ul>{items.map(t => <li key={t.id}>{t.title} — {t.status} · {t.priority}</li>)}</ul></div>;
}
