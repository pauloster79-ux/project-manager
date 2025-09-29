"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";
import { CreateProjectSchema } from "@/src/schemas/common";

export async function createProject(formData: FormData) {
  try {
    const user = await getCurrentUser();
    const orgId = await getCurrentOrgId();
    
    await requireAccess({ userId: user.id, orgId, need: "org:read" });

    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    const validatedData = CreateProjectSchema.parse(rawData);

    // Dynamic import to prevent bundling
    const { query } = await import("@/src/lib/db");
    const { rows } = await query(
      `insert into projects (name, description, org_id) values ($1,$2,$3) returning *`,
      [validatedData.name.trim(), validatedData.description ?? null, orgId]
    );

    const newProject = rows[0];
    
    // Revalidate the projects page
    revalidatePath("/projects");
    
    // Redirect to the new project's risks page
    redirect(`/projects/${newProject.id}/risks`);
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }
}

export async function createDemoProject() {
  const formData = new FormData();
  formData.append("name", "Demo Project");
  formData.append("description", "A demonstration project with sample data");
  return createProject(formData);
}
