// Simple logout endpoint
import { okJSON } from "@/src/lib/errors";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete("user_id");
  
  return okJSON({ message: "Logged out successfully" });
}
