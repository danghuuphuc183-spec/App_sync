import { z } from "zod";

export const matchRequestSchema = z.object({
  sport: z.enum(["running", "gym", "cycling", "swimming", "badminton", "pickleball"]).default("running"),
  targetPaceSec: z.number().int().positive().optional().default(330),
  preferredTimeSlot: z
    .enum(["morning_early", "noon", "evening", "night"])
    .default("morning_early"),
  maxDistanceKm: z.number().positive().max(100).default(10),
  traits: z.array(z.string().min(1)).optional().default([]),
  explorationRate: z.number().min(0).max(1).optional().default(0.15),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

export type MatchRequestInput = z.infer<typeof matchRequestSchema>;

export const coachFilterSchema = z.object({
  sport: z.string().optional(),
  mode: z.enum(["all", "1on1", "squad"]).optional().default("all"),
  district: z.string().optional(),
  query: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type CoachFilterInput = z.infer<typeof coachFilterSchema>;

export const coachBookingSchema = z.object({
  coachId: z.string().min(1, "Vui lòng chọn Huấn luyện viên"),
  slot: z.string().min(1, "Vui lòng chọn khung giờ tập"),
  date: z.string().min(1, "Vui lòng chọn ngày tập"),
  athleteName: z.string().min(2, "Họ và tên cần ít nhất 2 ký tự"),
  athleteContact: z.string().min(5, "Số điện thoại hoặc Zalo không hợp lệ"),
  notes: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
});

export type CoachBookingInput = z.infer<typeof coachBookingSchema>;

export const venueFilterSchema = z.object({
  sport: z.string().optional(),
  district: z.string().optional(),
  query: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type VenueFilterInput = z.infer<typeof venueFilterSchema>;
