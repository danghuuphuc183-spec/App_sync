"use client";

import * as React from "react";
import type { Disc, Gender, LatLng, PartnerProfile, Vibe, WorkoutType } from "@/features/match/partner-match";
import { DEFAULT_ME } from "@/features/match/partner-pool";

export type PermState = "unknown" | "granted" | "denied" | "unsupported";

export interface OnboardingProfile {
  displayName: string;
  gender: Gender | "unspecified";
  birthYear: number;
  heightCm: number;
  weightKg: number;
  goals: string[];
  sports: string[];
  workoutTypes: WorkoutType[];
  level: "new" | "casual" | "advanced" | "pro";
  paceSecPerKm: number;
  availability: string[];
  areaLabel: string;
  position: LatLng | null;
  radiusKm: number;
  discAnswers: Disc[];
  vibe: Vibe;
  sameGenderOnly: boolean;
  needsSpotter: boolean;
  hideExactLocation: boolean;
  permissions: { gps: PermState; camera: PermState; notifications: PermState; motion: PermState };
  connectedApps: string[];
  completedAt?: string;
}

export const DEFAULT_ONBOARDING: OnboardingProfile = {
  displayName: "",
  gender: "unspecified",
  birthYear: 2000,
  heightCm: 165,
  weightKg: 58,
  goals: [],
  sports: [],
  workoutTypes: [],
  level: "casual",
  paceSecPerKm: 390,
  availability: [],
  areaLabel: "",
  position: null,
  radiusKm: 3,
  discAnswers: [],
  vibe: "friendly",
  sameGenderOnly: false,
  needsSpotter: false,
  hideExactLocation: true,
  permissions: { gps: "unknown", camera: "unknown", notifications: "unknown", motion: "unknown" },
  connectedApps: [],
};

export const GOALS = [
  { id: "fat_loss", label: "Giảm mỡ", emoji: "🔥" },
  { id: "muscle", label: "Tăng cơ", emoji: "💪" },
  { id: "endurance", label: "Bền bỉ / Marathon", emoji: "🏃" },
  { id: "health", label: "Khoẻ mạnh tổng quát", emoji: "❤️" },
  { id: "stress", label: "Giải toả căng thẳng", emoji: "🧘" },
  { id: "discipline", label: "Giữ kỷ luật tập đều", emoji: "📅" },
  { id: "friends", label: "Tìm bạn tập mới", emoji: "🤝" },
  { id: "compete", label: "Thi đấu / phá PR", emoji: "🏆" },
];

export const SPORT_OPTIONS = [
  { id: "running", label: "Chạy bộ", emoji: "🏃" },
  { id: "gym", label: "Gym", emoji: "🏋️" },
  { id: "calisthenics", label: "Calisthenics", emoji: "🤸" },
  { id: "cycling", label: "Đạp xe", emoji: "🚴" },
  { id: "pickleball", label: "Pickleball", emoji: "🏓" },
  { id: "badminton", label: "Cầu lông", emoji: "🏸" },
  { id: "football", label: "Bóng đá", emoji: "⚽" },
  { id: "swimming", label: "Bơi lội", emoji: "🏊" },
];

export const WORKOUTS_BY_SPORT: Record<string, { id: WorkoutType; label: string; hint: string }[]> = {
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
  ],
  calisthenics: [{ id: "calisthenics", label: "Calisthenics", hint: "Pull-up, dips, push-up, skill" }],
};

/** DISC rút gọn cho bối cảnh TẬP LUYỆN — mỗi đáp án ứng với một nhóm */
export const DISC_QUESTIONS: { q: string; options: { disc: Disc; text: string }[] }[] = [
  {
    q: "Khi bắt đầu buổi tập, bạn thường…",
    options: [
      { disc: "D", text: "Vào thẳng bài nặng, muốn đạt mục tiêu ngay" },
      { disc: "I", text: "Hỏi han, tạo không khí vui trước đã" },
      { disc: "S", text: "Khởi động kỹ theo đúng thói quen" },
      { disc: "C", text: "Xem lại giáo án và số liệu buổi trước" },
    ],
  },
  {
    q: "Bạn tập cùng bị chậm hơn bạn, bạn sẽ…",
    options: [
      { disc: "D", text: "Thách họ cố thêm một chút" },
      { disc: "I", text: "Cổ vũ thật to cho họ có động lực" },
      { disc: "S", text: "Chạy chậm lại, đi cùng họ" },
      { disc: "C", text: "Góp ý kỹ thuật để họ cải thiện" },
    ],
  },
  {
    q: "Điều làm bạn bực nhất khi tập chung là…",
    options: [
      { disc: "D", text: "Lề mề, không tập trung vào mục tiêu" },
      { disc: "I", text: "Im lặng, không ai nói chuyện" },
      { disc: "S", text: "Đổi kế hoạch phút chót" },
      { disc: "C", text: "Tập sai kỹ thuật, không theo giáo án" },
    ],
  },
  {
    q: "Sau buổi tập bạn thích…",
    options: [
      { disc: "D", text: "Xem mình đã phá kỷ lục chưa" },
      { disc: "I", text: "Chụp ảnh, đăng story, đi cà phê" },
      { disc: "S", text: "Giãn cơ nhẹ nhàng rồi về" },
      { disc: "C", text: "Ghi chép số liệu, phân tích nhịp tim" },
    ],
  },
  {
    q: "Bạn tập cùng lý tưởng là người…",
    options: [
      { disc: "D", text: "Cạnh tranh, kéo mình mạnh hơn" },
      { disc: "I", text: "Vui vẻ, nhiều năng lượng" },
      { disc: "S", text: "Đúng giờ, đều đặn, đáng tin" },
      { disc: "C", text: "Hiểu biết, chuẩn kỹ thuật" },
    ],
  },
];

export const DISC_INFO: Record<Disc, { title: string; desc: string; partner: string }> = {
  D: { title: "D – Người quyết đoán", desc: "Bạn tập vì mục tiêu và thích thử thách.", partner: "Hợp với người D/C ở mode Hiệu suất." },
  I: { title: "I – Người truyền cảm hứng", desc: "Bạn mang năng lượng và niềm vui cho buổi tập.", partner: "Hợp với người I/S ở mode Đồng hành." },
  S: { title: "S – Người kiên định", desc: "Bạn đều đặn, đáng tin và biết lắng nghe.", partner: "Hợp với người S/I, cũng hỗ trợ tốt người D." },
  C: { title: "C – Người tỉ mỉ", desc: "Bạn chú trọng kỹ thuật, số liệu và kế hoạch.", partner: "Hợp với người C/D ở mode Hiệu suất." },
};

export function discResult(answers: Disc[]): Disc | null {
  if (answers.length === 0) return null;
  const count: Record<Disc, number> = { D: 0, I: 0, S: 0, C: 0 };
  for (const a of answers) count[a] += 1;
  return (["D", "I", "S", "C"] as Disc[]).reduce((best, d) => (count[d] > count[best] ? d : best), "D");
}

/** Hồ sơ onboarding → hồ sơ ghép v2 */
export function toPartnerProfile(p: OnboardingProfile | null, fallbackPosition: LatLng): PartnerProfile {
  if (!p || !p.completedAt) return { ...DEFAULT_ME, position: fallbackPosition };
  return {
    id: "me",
    name: p.displayName || "Bạn",
    gender: p.gender === "unspecified" ? "other" : p.gender,
    sports: p.sports.includes("calisthenics") ? [...p.sports, "gym"] : p.sports,
    workoutTypes: p.workoutTypes,
    availability: p.availability,
    position: p.position ?? fallbackPosition,
    disc: discResult(p.discAnswers) ?? "S",
    vibe: p.vibe,
    sameGenderOnly: p.sameGenderOnly,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    needsSpotter: p.needsSpotter,
    // Người mới chưa có lịch sử kèo → xếp nhóm "bình thường" cho tới khi đủ 3 buổi
    completionRate: 1,
    completedSessions: 0,
    paceSecPerKm: p.paceSecPerKm,
  };
}

/* ------------------------------------------------------------------ */
/* Lưu trữ                                                              */
/* ------------------------------------------------------------------ */
const KEY = "sync.onboarding.v1";
const EVENT = "sync-onboarding";

export function readOnboarding(): OnboardingProfile | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_ONBOARDING, ...(JSON.parse(raw) as Partial<OnboardingProfile>) } : null;
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
