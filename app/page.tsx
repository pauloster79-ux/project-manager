import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to demo project for now
  redirect("/projects/demo");
}
