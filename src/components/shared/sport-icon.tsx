import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Activity,
  Bike,
  Brain,
  CalendarCheck,
  CircleDot,
  Dumbbell,
  Feather,
  Flame,
  Footprints,
  Goal,
  Handshake,
  HeartPulse,
  PersonStanding,
  Trophy,
  Volleyball,
  Waves,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/**
 * Icon nét (line icon) đơn sắc cho từng môn thể thao — thay cho emoji màu.
 * Màu lấy theo `currentColor` nên tự đen trên nền sáng, trắng trên nền tối.
 */
export const SPORT_ICONS: Record<string, LucideIcon> = {
  running: Footprints,
  cycling: Bike,
  gym: Dumbbell,
  calisthenics: PersonStanding,
  pickleball: CircleDot,
  table_tennis: CircleDot,
  badminton: Feather,
  football: Goal,
  basketball: Volleyball,
  swimming: Waves,
};

/** Icon cho mục tiêu tập luyện ở bước onboarding. */
export const GOAL_ICONS: Record<string, LucideIcon> = {
  fat_loss: Flame,
  muscle: Dumbbell,
  endurance: Footprints,
  health: HeartPulse,
  stress: Brain,
  discipline: CalendarCheck,
  friends: Handshake,
  compete: Trophy,
};

export function SportIcon({ sport, ...props }: { sport: string } & LucideProps) {
  const Icon = SPORT_ICONS[sport] ?? Activity;
  return <Icon aria-hidden {...props} />;
}

export function GoalIcon({ goal, ...props }: { goal: string } & LucideProps) {
  const Icon = GOAL_ICONS[goal] ?? Activity;
  return <Icon aria-hidden {...props} />;
}

/** Chuỗi SVG để chèn vào HTML thuần (vd. marker Leaflet). */
export function sportIconSvg(sport: string, size = 14, strokeWidth = 2.25): string {
  const Icon = SPORT_ICONS[sport] ?? Activity;
  return renderToStaticMarkup(<Icon size={size} strokeWidth={strokeWidth} color="currentColor" />);
}
