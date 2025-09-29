import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to projects list - let the user choose or create a project
  redirect("/projects");
}
