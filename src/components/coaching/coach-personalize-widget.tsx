"use client";

import * as React from "react";
import {
  Sparkles,
  SlidersHorizontal,
  Target,
  Users,
  DollarSign,
  Heart,
  Dumbbell,
  RotateCcw,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  UserCoachProfile,
  FitnessGoal,
  CoachingStyle,
  CoachingMode,
  SportCoachingCategory,
} from "@/features/coaching/coaching.types";
import { GOAL_LABELS, STYLE_LABELS } from "@/features/coaching/matchmaker";
import { cn } from "@/lib/utils";

interface CoachPersonalizeWidgetProps {
  profile: UserCoachProfile;
  onChangeProfile: (updated: UserCoachProfile) => void;
  onReset: () => void;
}

export function CoachPersonalizeWidget({
  profile,
  onChangeProfile,
  onReset,
}: CoachPersonalizeWidgetProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Quick preset shortcuts
  const applyPreset = (presetType: "office_posture" | "squad_saver" | "marathon" | "hypertrophy") => {
    switch (presetType) {
      case "office_posture":
        onChangeProfile({
          ...profile,
          fitnessGoal: "chinh_dang_posture",
          coachingStyle: "scientific_form",
          preferredSport: "all",
          preferredMode: "all",
          maxBudgetPerSession: 500000,
        });
        break;
      case "squad_saver":
        onChangeProfile({
          ...profile,
          preferredMode: "group",
          maxBudgetPerSession: 200000,
          coachingStyle: "high_energy",
        });
        break;
      case "marathon":
        onChangeProfile({
          ...profile,
          fitnessGoal: "chay_marathon",
          preferredSport: "Chạy Bộ & Marathon",
          coachingStyle: "gentle_encouraging",
          preferredMode: "all",
        });
        break;
      case "hypertrophy":
        onChangeProfile({
          ...profile,
          fitnessGoal: "tang_co",
          preferredSport: "Gym & Kháng Lực",
          coachingStyle: "strict_discipline",
          preferredMode: "1:1",
        });
        break;
    }
  };

  return (
    <div className="p-3.5 rounded-3xl bg-card border border-brand/30 dark:border-brand-sky/40 shadow-xs space-y-3">
      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 basis-[220px]">
          <div className="h-8 w-8 shrink-0 rounded-xl bg-brand-100/60 dark:bg-brand flex items-center justify-center text-brand dark:text-brand-sky">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-black text-foreground flex flex-wrap items-center gap-1.5">
              Ghép Đôi Huấn Luyện Viên Cá Nhân Hoá
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-brand text-white font-bold">
                AI Match
              </span>
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Dựa trên số đo, mục tiêu và sở thích phong cách riêng của bạn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground font-semibold"
            title="Đặt lại mặc định"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Mặc định
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2.5 rounded-full text-[10px] font-bold border-brand/30 text-brand dark:text-brand-sky"
          >
            <SlidersHorizontal className="h-3 w-3 mr-1" />
            {isExpanded ? "Thu gọn" : "Tùy chỉnh sâu"}
          </Button>
        </div>
      </div>

      {/* Quick 1-Click Presets */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Gợi ý nhanh theo nhu cầu phổ biến:
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset("office_posture")}
            className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1",
              profile.fitnessGoal === "chinh_dang_posture"
                ? "bg-brand text-white border-brand"
                : "bg-muted/50 border-border text-foreground hover:bg-muted"
            )}
          >
            <span>💻 Dân văn phòng trị gù/đau lưng</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset("squad_saver")}
            className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1",
              profile.preferredMode === "group" && profile.maxBudgetPerSession <= 200000
                ? "bg-brand text-white border-brand"
                : "bg-muted/50 border-border text-foreground hover:bg-muted"
            )}
          >
            <span>👥 Rủ Squad chia tiền (&lt;200k/bạn)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset("marathon")}
            className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1",
              profile.fitnessGoal === "chay_marathon"
                ? "bg-brand text-white border-brand"
                : "bg-muted/50 border-border text-foreground hover:bg-muted"
            )}
          >
            <span>🏃 Chạy Marathon Sub 4:00</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset("hypertrophy")}
            className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1",
              profile.fitnessGoal === "tang_co"
                ? "bg-brand text-white border-brand"
                : "bg-muted/50 border-border text-foreground hover:bg-muted"
            )}
          >
            <span>💪 Tăng cơ nạc chuẩn form 1:1</span>
          </button>
        </div>
      </div>

      {/* Main Filter Fields (Always visible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Mục tiêu tập luyện */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-foreground flex items-center gap-1">
            <Target className="h-3 w-3 text-brand dark:text-brand-sky" />
            Mục tiêu thể hình của bạn:
          </label>
          <select
            value={profile.fitnessGoal}
            onChange={(e) => onChangeProfile({ ...profile, fitnessGoal: e.target.value as FitnessGoal })}
            className="w-full h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground font-medium focus:outline-hidden"
          >
            {Object.entries(GOAL_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Hình thức tập luyện (1:1 vs Nhóm) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-foreground flex items-center gap-1">
            <Users className="h-3 w-3 text-brand dark:text-brand-sky" />
            Hình thức mong muốn:
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "all", label: "Tất cả" },
              { id: "1:1", label: "Kèm 1:1" },
              { id: "group", label: "Nhóm Squad" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChangeProfile({ ...profile, preferredMode: mode.id as "all" | CoachingMode })}
                className={cn(
                  "h-8 rounded-xl text-[11px] font-bold transition-all border",
                  profile.preferredMode === mode.id
                    ? "bg-brand text-white border-brand shadow-xs"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Expanded Customization */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-border/70 animate-in fade-in">
          {/* Số đo thể trạng học viên */}
          <div className="grid grid-cols-2 gap-3 p-2.5 rounded-2xl bg-muted/40">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-foreground">
                <span>Chiều cao của bạn:</span>
                <span className="text-brand dark:text-brand-sky font-black">{profile.userHeightCm} cm</span>
              </div>
              <input
                type="range"
                min={145}
                max={200}
                value={profile.userHeightCm}
                onChange={(e) => onChangeProfile({ ...profile, userHeightCm: Number(e.target.value) })}
                className="w-full accent-brand cursor-pointer h-1.5 rounded-full"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>145cm</span>
                <span>200cm</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-foreground">
                <span>Cân nặng hiện tại:</span>
                <span className="text-brand dark:text-brand-sky font-black">{profile.userWeightKg} kg</span>
              </div>
              <input
                type="range"
                min={40}
                max={120}
                value={profile.userWeightKg}
                onChange={(e) => onChangeProfile({ ...profile, userWeightKg: Number(e.target.value) })}
                className="w-full accent-brand cursor-pointer h-1.5 rounded-full"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>40kg</span>
                <span>120kg</span>
              </div>
            </div>
          </div>

          {/* Phong cách HLV & Ngân sách */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground flex items-center gap-1">
                <Heart className="h-3 w-3 text-brand dark:text-brand-sky" />
                Phong cách HLV bạn thích:
              </label>
              <select
                value={profile.coachingStyle}
                onChange={(e) =>
                  onChangeProfile({
                    ...profile,
                    coachingStyle: e.target.value as "any" | CoachingStyle,
                  })
                }
                className="w-full h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground font-medium focus:outline-hidden"
              >
                <option value="any">Tất cả phong cách</option>
                {Object.entries(STYLE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-brand dark:text-brand-sky" />
                Ngân sách tối đa mỗi buổi:
              </label>
              <select
                value={profile.maxBudgetPerSession}
                onChange={(e) =>
                  onChangeProfile({
                    ...profile,
                    maxBudgetPerSession: Number(e.target.value),
                  })
                }
                className="w-full h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground font-medium focus:outline-hidden"
              >
                <option value={200000}>Dưới 200.000đ (Tập Nhóm Squad)</option>
                <option value={350000}>Dưới 350.000đ (Linh hoạt)</option>
                <option value={450000}>Dưới 450.000đ (Kèm 1:1 Tiêu chuẩn)</option>
                <option value={600000}>Tối đa 600.000đ (Master Coach cao cấp)</option>
              </select>
            </div>
          </div>

          {/* Môn thể thao & Khu vực */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground flex items-center gap-1">
                <Dumbbell className="h-3 w-3 text-brand dark:text-brand-sky" />
                Bộ môn thể thao:
              </label>
              <select
                value={profile.preferredSport}
                onChange={(e) =>
                  onChangeProfile({
                    ...profile,
                    preferredSport: e.target.value as "all" | SportCoachingCategory,
                  })
                }
                className="w-full h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground font-medium focus:outline-hidden"
              >
                <option value="all">Tất cả bộ môn</option>
                <option value="Gym & Kháng Lực">Gym & Kháng Lực</option>
                <option value="Chạy Bộ & Marathon">Chạy Bộ & Marathon</option>
                <option value="Pilates & Core">Pilates & Core</option>
                <option value="Calisthenics & Street Workout">Calisthenics & Street Workout</option>
                <option value="Boxing & Kickfit">Boxing & Kickfit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground flex items-center gap-1">
                <Activity className="h-3 w-3 text-brand dark:text-brand-sky" />
                Khu vực tập luyện:
              </label>
              <select
                value={profile.preferredArea}
                onChange={(e) => onChangeProfile({ ...profile, preferredArea: e.target.value })}
                className="w-full h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground font-medium focus:outline-hidden"
              >
                <option value="all">Toàn TP.HCM</option>
                <option value="Bình Thạnh">Bình Thạnh (Landmark 81 / Bờ Kè)</option>
                <option value="Quận 1">Quận 1 (Trung tâm)</option>
                <option value="Quận 2">Quận 2 (Thảo Điền / Sala)</option>
                <option value="Thủ Đức">Thủ Đức</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
