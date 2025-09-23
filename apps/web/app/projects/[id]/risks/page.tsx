import { prisma } from "@pm/db";
export default async function RisksPage({ params }: any) {
  const items = await prisma.risk.findMany({ where: { projectId: params.id }, orderBy: { updatedAt: "desc" } });
  return <div><h2>Risks</h2><ul>{items.map(r => <li key={r.id}>{r.title} — {r.status} · {r.likelihood}×{r.impact}</li>)}</ul></div>;
}
