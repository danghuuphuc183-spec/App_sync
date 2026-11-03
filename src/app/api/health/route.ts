import { successResponse } from "@/lib/errors/api-response";
import { getSupabaseConfig } from "@/lib/supabase/client";

export async function GET() {
  const config = getSupabaseConfig();
  return successResponse({
    status: "healthy",
    service: "Sync Athlete API",
    version: "1.0.0",
    database: {
      mode: config.isMock ? "in-memory-mock" : "connected-supabase",
    },
    uptimeSeconds: process.uptime(),
  });
}
