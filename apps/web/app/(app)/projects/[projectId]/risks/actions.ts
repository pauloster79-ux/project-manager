"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";

export async function createRisk(projectId: string) {
  try {
    const user = await getCurrentUser();
    const orgId = await getCurrentOrgId();
    
    await requireAccess({ userId: user.id, orgId, need: "org:read" });

    // Dynamic import to prevent bundling
    const { query } = await import("@/src/lib/db");
    const { rows } = await query(
      `insert into risks (project_id, title, probability, impact, summary) 
       values ($1, $2, $3, $4, $5) 
       returning *`,
      [projectId, "New Risk", 3, 3, "Risk description to be filled in"]
    );

    const newRisk = rows[0];
    
    // Revalidate the risks page
    revalidatePath(`/projects/${projectId}/risks`);
    
    // Redirect to the new risk's edit page
    redirect(`/projects/${projectId}/risks/${newRisk.id}`);
  } catch (error) {
    console.error("Error creating risk:", error);
    throw new Error("Failed to create risk");
  }
}
