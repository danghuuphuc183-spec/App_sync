"use client";

import * as React from "react";
import {
  normalizeSessionTypes,
  type CommStyle,
  type FitnessBand,
  type Gender,
  type Intensity,
  type LatLng,
  type PartnerProfile,
  type SessionType,
  type Vibe,
} from "@/features/match/partner-match";
import { DEFAULT_ME } from "@/features/match/partner-pool";

export type PermState = "unknown" | "granted" | "denied" | "unsupported";

export interface OnboardingProfile {
  displayName: string;
  gender: Gender | "unspecified";
  birthYear: number;
  goals: string[];
  /** activity */
  sports: string[];
  /** session type */
  workoutTypes: SessionType[];
  /** tự khai trình độ → fitness band */
  level: "new" | "casual" | "advanced" | "pro";
  intensity: Intensity;
  availability: string[];
  areaLabel: string;
  position: LatLng | null;
  radiusKm: number;
  /** người dùng chọn trực tiếp (thay cho trắc nghiệm DISC) */
  commStyle: CommStyle;
  vibe: Vibe;
  sameGenderOnly: boolean;
  needsSpotter: boolean;
  canSpot: boolean;
  hideExactLocation: boolean;
  permissions: { gps: PermState; camera: PermState; notifications: PermState; motion: PermState };
  connectedApps: string[];
  completedAt?: string;
}

export const DEFAULT_ONBOARDING: OnboardingProfile = {
  displayName: "",
  gender: "unspecified",
  birthYear: 2000,
  goals: [],
  sports: [],
  workoutTypes: [],
  level: "casual",
  intensity: "moderate",
  availability: [],
  areaLabel: "",
  position: null,
  radiusKm: 3,
  commStyle: "chatty",
  vibe: "friendly",
  sameGenderOnly: false,
  needsSpotter: false,
  canSpot: false,
  hideExactLocation: true,
  permissions: { gps: "unknown", camera: "unknown", notifications: "unknown", motion: "unknown" },
  connectedApps: [],
};

export const GOALS = [
  { id: "fat_loss", label: "Giảm mỡ" },
  { id: "muscle", label: "Tăng cơ" },
  { id: "endurance", label: "Bền bỉ / Marathon" },
  { id: "health", label: "Khoẻ mạnh tổng quát" },
  { id: "stress", label: "Giải toả căng thẳng" },
  { id: "discipline", label: "Giữ kỷ luật tập đều" },
  { id: "friends", label: "Tìm bạn tập mới" },
  { id: "compete", label: "Thi đấu / phá PR" },
];

export const SPORT_OPTIONS = [
  { id: "running", label: "Chạy bộ" },
  { id: "gym", label: "Gym" },
  { id: "calisthenics", label: "Calisthenics" },
  { id: "cycling", label: "Đạp xe" },
  { id: "pickleball", label: "Pickleball" },
  { id: "badminton", label: "Cầu lông" },
  { id: "football", label: "Bóng đá" },
  { id: "swimming", label: "Bơi lội" },
];

export const WORKOUTS_BY_SPORT: Record<string, { id: SessionType; label: string; hint: string }[]> = {
  running: [
    { id: "long_run", label: "Long run", hint: "Chạy dài, pace chậm đều" },
    { id: "recovery", label: "Recovery", hint: "Chạy hồi phục nhẹ nhàng" },
    { id: "short_run", label: "Short run", hint: "3–5 km nhanh gọn" },
    { id: "interval", label: "Interval", hint: "Chạy biến tốc theo hiệp" },
    { id: "tempo", label: "Tempo", hint: "Giữ pace cao ổn định" },
  ],
  gym: [
    { id: "push", label: "Push day", hint: "Ngực – vai – tay sau" },
    { id: "pull", label: "Pull day", hint: "Lưng – tay trước" },
    { id: "legs", label: "Leg day", hint: "Đùi – mông – bắp chân" },
    { id: "upper", label: "Upper", hint: "Toàn bộ thân trên" },
    { id: "lower", label: "Lower", hint: "Toàn bộ thân dưới" },
    { id: "full_body", label: "Full body", hint: "Toàn thân trong một buổi" },
  ],
  calisthenics: [
    { id: "cali_strength", label: "Sức mạnh", hint: "Pull-up, dips, push-up" },
    { id: "cali_skill", label: "Skill", hint: "Handstand, muscle-up, lever" },
  ],
};

export const LEVEL_TO_BAND: Record<OnboardingProfile["level"], FitnessBand> = {
  new: "beginner",
  casual: "intermediate",
  advanced: "advanced",
  pro: "elite",
};

export const INTENSITY_OPTIONS: { id: Intensity; label: string; hint: string }[] = [
  { id: "easy", label: "Nhẹ", hint: "Nói chuyện thoải mái" },
  { id: "moderate", label: "Vừa", hint: "Hơi hụt hơi" },
  { id: "hard", label: "Nặng", hint: "Đẩy giới hạn" },
];

/** Hỏi trực tiếp cách giao tiếp — thay cho trắc nghiệm DISC (không chứng minh được độ hợp khi tập) */
export const COMM_STYLE_OPTIONS: { id: CommStyle; label: string; hint: string }[] = [
  { id: "quiet", label: "Ít nói, tập trung", hint: "Chào hỏi rồi vào bài, giữ nhịp riêng" },
  { id: "chatty", label: "Vừa tập vừa trò chuyện", hint: "Thích nói chuyện, cà phê sau buổi tập" },
  { id: "motivating", label: "Cổ vũ, thúc nhau", hint: "Đếm hiệp, nhắc pace, kéo nhau cố thêm" },
];

/** Hồ sơ onboarding → hồ sơ ghép v3 */
export function toPartnerProfile(p: OnboardingProfile | null, fallbackPosition: LatLng): PartnerProfile {
  if (!p || !p.completedAt) return { ...DEFAULT_ME, position: fallbackPosition };
  return {
    id: "me",
    name: p.displayName || "Bạn",
    gender: p.gender === "unspecified" ? "other" : p.gender,
    // Calisthenics là activity riêng; vẫn tập ở phòng gym nên ghép được với người tập gym
    sports: p.sports.includes("calisthenics") ? [...new Set([...p.sports, "gym"])] : p.sports,
    workoutTypes: normalizeSessionTypes(p.workoutTypes),
    availability: p.availability,
    position: p.position ?? fallbackPosition,
    vibe: p.vibe,
    commStyle: p.commStyle,
    sameGenderOnly: p.sameGenderOnly,
    fitnessBand: LEVEL_TO_BAND[p.level] ?? "intermediate",
    intensity: p.intensity,
    needsSpotter: p.needsSpotter,
    canSpot: p.canSpot,
    // Người mới chưa có lịch sử kèo → độ tin cậy lấy theo mức nền, tự điều chỉnh khi có thêm buổi
    completionRate: 1,
    completedSessions: 0,
  };
}

/* ------------------------------------------------------------------ */
/* Lưu trữ                                                              */
/* ------------------------------------------------------------------ */
const KEY = "sync.onboarding.v1";

/** Dữ liệu cũ: bỏ trường đã loại (DISC, chiều cao/cân nặng, pace), chuẩn hoá session type */
export function migrateOnboarding(raw: Partial<OnboardingProfile> & Record<string, unknown>): OnboardingProfile {
  const { discAnswers: _d, heightCm: _h, weightKg: _w, paceSecPerKm: _p, ...rest } = raw as Record<string, unknown>;
  void _d;
  void _h;
  void _w;
  void _p;
  const merged = { ...DEFAULT_ONBOARDING, ...(rest as Partial<OnboardingProfile>) };
  return { ...merged, workoutTypes: normalizeSessionTypes(merged.workoutTypes as string[]) };
}
const EVENT = "sync-onboarding";

export function readOnboarding(): OnboardingProfile | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? migrateOnboarding(JSON.parse(raw) as Partial<OnboardingProfile>) : null;
  } catch {
    return null;
  }
}

export function saveOnboarding(p: OnboardingProfile) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* bỏ qua */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useOnboardingProfile() {
  const [profile, setProfile] = React.useState<OnboardingProfile | null>(null);
  React.useEffect(() => {
    setProfile(readOnboarding());
    const sync = () => setProfile(readOnboarding());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return profile;
}
