import { prisma } from "@pm/db";
export default async function InboxPage({ params }: any) {
  const signals = await prisma.signal.findMany({ where: { projectId: params.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return <div><h2>Inbox (Signals)</h2><ul>{signals.map(s => <li key={s.id}>{s.type} — {s.title ?? s.provider ?? ""}</li>)}</ul></div>;
}
