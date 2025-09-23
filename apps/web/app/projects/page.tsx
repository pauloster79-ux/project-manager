import Link from "next/link";
import { prisma } from "@pm/db";
export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });
  return (
    <div style={{ padding:24 }}>
      <h1>Projects</h1>
      <ul>{projects.map(p => <li key={p.id}><Link href={`/projects/${p.id}`}>{p.name}</Link></li>)}</ul>
    </div>
  );
}
