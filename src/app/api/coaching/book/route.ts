import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/errors/api-response";
import { coachBookingSchema } from "@/lib/validation/schemas";
import { CoachRepository } from "@/lib/supabase/repository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = coachBookingSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Thông tin đặt lịch tập không hợp lệ", "VALIDATION_ERROR", parsed.error.format(), 400);
    }

    const coach = CoachRepository.findById(parsed.data.coachId);
    if (!coach) {
      return errorResponse("Không tìm thấy huấn luyện viên tương ứng", "COACH_NOT_FOUND", undefined, 404);
    }

    const booking = CoachRepository.createBooking(parsed.data);

    return successResponse(
      {
        booking,
        coach: {
          id: coach.id,
          name: coach.name,
          title: coach.title,
          avatar: coach.avatar,
          pricePerSession: coach.pricing.single1on1.pricePerSession,
        },
        confirmationMessage: `Đặt lịch thành công cùng HLV ${coach.name} vào ngày ${booking.date} (${booking.slot}). HLV sẽ liên hệ xác nhận qua ${booking.athleteContact}.`,
      },
      undefined,
      201
    );
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Lỗi khi xử lý đặt lịch huấn luyện viên";
    return errorResponse(errMessage, "BOOKING_ERROR", undefined, 500);
  }
}
