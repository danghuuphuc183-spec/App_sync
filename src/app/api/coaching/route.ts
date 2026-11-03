import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/errors/api-response";
import { coachFilterSchema } from "@/lib/validation/schemas";
import { CoachRepository } from "@/lib/supabase/repository";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const rawFilter = {
      sport: searchParams.get("sport") || undefined,
      mode: searchParams.get("mode") || "all",
      district: searchParams.get("district") || undefined,
      query: searchParams.get("query") || undefined,
      limit: searchParams.get("limit") || 20,
    };

    const parsed = coachFilterSchema.safeParse(rawFilter);
    if (!parsed.success) {
      return errorResponse("Bộ lọc huấn luyện viên không hợp lệ", "VALIDATION_ERROR", parsed.error.format(), 400);
    }

    const coaches = CoachRepository.findAll(parsed.data);

    return successResponse(coaches, {
      total: coaches.length,
      limit: parsed.data.limit,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Lỗi khi lấy danh sách huấn luyện viên";
    return errorResponse(errMessage, "COACH_FETCH_ERROR", undefined, 500);
  }
}
