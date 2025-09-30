import { okJSON, apiError } from "@/src/lib/errors";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return okJSON({ 
      message: "Test migration API is working",
      timestamp: new Date().toISOString(),
      status: "ok"
    });
  } catch (error) {
    return apiError(500, "Test API failed", { 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function POST() {
  try {
    return okJSON({ 
      message: "Test migration POST is working",
      timestamp: new Date().toISOString(),
      status: "ok"
    });
  } catch (error) {
    return apiError(500, "Test POST failed", { 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
