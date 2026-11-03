import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/errors/api-response";
import { matchRequestSchema } from "@/lib/validation/schemas";
import { MatchRepository } from "@/lib/supabase/repository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = matchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Dữ liệu tìm kiếm bạn tập không hợp lệ",
        "VALIDATION_ERROR",
        parsed.error.format(),
        400
      );
    }

    const { sport, targetPaceSec, preferredTimeSlot, maxDistanceKm, traits, explorationRate, limit } =
      parsed.data;

    const ranked = MatchRepository.getRecommendedPartners(
      {
        sport,
        targetPaceSec,
        preferredTimeSlot,
        maxDistanceKm,
        traits,
      },
      { explorationRate, limit }
    );

    return successResponse(ranked, {
      total: ranked.length,
      limit,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Đã có lỗi xảy ra khi tính toán ghép đôi";
    return errorResponse(errMessage, "MATCHING_ERROR", undefined, 500);
  }
}
