// Temporary auth bypass for testing
import { okJSON } from "@/src/lib/errors";

export async function GET() {
  // Return a mock user with full permissions
  return okJSON({
    id: "test-user-id",
    email: "test@example.com",
    display_name: "Test User",
    org_id: "test-org-id",
    role: "owner"
  });
}
