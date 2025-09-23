import { prisma } from "@pm/db";
export default async function ProposalsPage({ params }: any) {
  const props = await prisma.proposedChange.findMany({ where: { entityType: { in: ["Task","Risk"] } }, orderBy: { createdAt: "desc" }, take: 50 });
  return <div><h2>Proposals</h2><ul>{props.map(p => <li key={p.id}>{p.entityType} {p.entityId} — {p.summary ?? "Change proposed"}</li>)}</ul></div>;
}
