import { prisma } from "@pm/db";
export default async function HistoryPage({ params }: any) {
  const [tv, rv] = await Promise.all([
    prisma.taskVersion.findMany({ where: { task: { projectId: params.id } }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.riskVersion.findMany({ where: { risk: { projectId: params.id } }, orderBy: { createdAt: "desc" }, take: 50 })
  ]);
  return <div><h2>History (Versions)</h2><p>Task versions: {tv.length} · Risk versions: {rv.length}</p></div>;
}
