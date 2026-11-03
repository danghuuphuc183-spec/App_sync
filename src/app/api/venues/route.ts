import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/errors/api-response";
import { venueFilterSchema } from "@/lib/validation/schemas";
import { VenueRepository } from "@/lib/supabase/repository";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const rawFilter = {
      sport: searchParams.get("sport") || undefined,
      district: searchParams.get("district") || undefined,
      query: searchParams.get("query") || undefined,
      limit: searchParams.get("limit") || 20,
    };

    const parsed = venueFilterSchema.safeParse(rawFilter);
    if (!parsed.success) {
      return errorResponse("Bộ lọc địa điểm không hợp lệ", "VALIDATION_ERROR", parsed.error.format(), 400);
    }

    const venues = VenueRepository.getVenues(parsed.data);
    const routes = VenueRepository.getRoutes();

    return successResponse(
      {
        venues,
        routes,
      },
      {
        totalVenues: venues.length,
        totalRoutes: routes.length,
      }
    );
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Lỗi khi lấy danh sách địa điểm thể thao";
    return errorResponse(errMessage, "VENUE_FETCH_ERROR", undefined, 500);
  }
}
