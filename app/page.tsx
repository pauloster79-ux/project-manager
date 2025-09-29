import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function HomePage() {
  const cookieStore = cookies();
  const userId = cookieStore.get("user_id")?.value;
  
  // For now, always redirect to login to test deployment
  redirect("/login");
}
