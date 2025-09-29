import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function HomePage() {
  const cookieStore = cookies();
  const userId = cookieStore.get("user_id")?.value;
  
  if (!userId) {
    // Not logged in, redirect to login
    redirect("/login");
  }
  
  // Logged in, redirect to projects
  redirect("/projects");
}
