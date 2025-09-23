import { prisma } from "../src/index.js";
async function main() {
  await prisma.project.createMany({ data: [
    { id: "p1", name: "AI Project Hub", description: "Primary PM workspace" },
    { id: "p2", name: "Website Refresh", description: "Marketing site & docs" }
  ], skipDuplicates: true });
  console.log("Seeded projects p1, p2");
}
main().then(()=>prisma.$disconnect());
