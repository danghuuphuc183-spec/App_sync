"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { StreakFlame } from "@/components/home/streak-flame";
import { computeWeeklyStreak } from "@/features/streak/streak";
import { cn } from "@/lib/utils";
import { useActivityLog } from "@/features/activity/use-activity-log";
import { LogWorkoutSheet } from "@/components/activity/log-workout-sheet";

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function WeeklyStreakCard() {
  const { entries: log, addEntry } = useActivityLog();
  const [isLogOpen, setIsLogOpen] = React.useState(false);

  const streak = React.useMemo(
    () => computeWeeklyStreak((log ?? []).map((e) => e.at), new Date(), { historyWeeks: 12 }),
    [log]
  );

  const addActivity = (v: { sport: string; minutes: number; withPartner: boolean }) => {
    addEntry({ at: new Date().toISOString(), ...v });
    setIsLogOpen(false);
  };

  const subtitle = streak.thisWeekMet
    ? `Tuyệt vời! Tuần này bạn đã ghi ${streak.thisWeekCount} hoạt động. Chuỗi đã được giữ.`
    : streak.atRisk
      ? `Còn ${streak.daysLeftInWeek} ngày để giữ chuỗi ${streak.current} tuần. Ghi 1 hoạt động ngay!`
      : "Ghi lại hoạt động để bắt đầu chuỗi liên tiếp của bạn.";

  const current = log ? streak.current : null;

  return (
    <section
      aria-label="Chuỗi liên tiếp theo tuần"
      className="surface-ink relative mx-3 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500"
    >
      {/* Vạch làn chạy mờ phía sau — gợi đường pista, không mang dữ liệu */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_22px)]"
      />

      <div className="relative px-4 pt-3.5 flex items-center justify-between gap-2">
        <h2 className="text-micro font-bold uppercase tracking-[0.14em] text-brand-mist/80">
          Chuỗi liên tiếp của bạn
        </h2>
        <button
          onClick={() => setIsLogOpen(true)}
          className="shrink-0 rounded-full bg-white text-ink text-caption font-bold px-3.5 py-1.5 shadow-sm hover:bg-brand-50"
        >
          Ghi ngay
        </button>
      </div>

      <div className="relative px-4 pt-1 pb-3.5 flex items-end gap-3">
        <StreakFlame value="" active={!!log && streak.current > 0} className="h-12 w-10 mb-1" />
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-numeric italic font-extrabold text-hero text-white tabular-nums">
            {current === null ? "–" : String(current).padStart(2, "0")}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-label font-bold text-white">tuần liên tiếp</span>
            <span className="text-caption text-brand-mist/70">
              Tuần này · <span className="font-numeric text-xs font-bold text-white">{streak.thisWeekCount}</span> hoạt động
            </span>
          </span>
        </div>
      </div>

      <div className="relative px-4 pb-3.5">
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_LABELS.map((label, i) => {
            const active = streak.activeDaysThisWeek[i];
            const isToday = i === 7 - streak.daysLeftInWeek;
            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "h-8 w-full max-w-[38px] rounded-xl flex items-center justify-center transition-all duration-300 ease-out-expo",
                    active
                      ? "bg-brand-gradient text-white shadow-glow"
                      : "bg-white/[0.06] ring-1 ring-inset ring-white/10 text-transparent",
                    isToday && !active && "ring-2 ring-brand-glow/80 bg-brand-glow/10"
                  )}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span
                  className={cn(
                    "text-micro font-semibold",
                    isToday ? "text-white" : "text-brand-mist/55"
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-2.5 text-caption leading-snug text-brand-mist/75">{subtitle}</p>
      </div>

      <LogWorkoutSheet open={isLogOpen} onClose={() => setIsLogOpen(false)} onSave={addActivity} />
    </section>
  );
}
