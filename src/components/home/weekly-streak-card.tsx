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

  return (
    <section aria-label="Chuỗi liên tiếp theo tuần" className="bg-white dark:bg-card border-y border-neutral-200/80 dark:border-neutral-800">
      <div className="px-4 pt-3 pb-0.5">
        <h2 className="text-[15px] font-bold text-foreground">Chuỗi liên tiếp của bạn</h2>
      </div>

      <div className="px-4 py-2.5 flex items-center gap-3.5">
        {/* CỘT TRÁI: Ngọn lửa chuỗi tuần */}
        <div className="flex flex-col items-center justify-center shrink-0 w-12 sm:w-14">
          <StreakFlame value={log ? streak.current : "–"} active={!!log && streak.current > 0} />
          <span className="text-[11px] font-semibold text-muted-foreground mt-0.5">Tuần</span>
        </div>

        {/* CỘT PHẢI: Trạng thái tuần này + 7 ngày T2-CN + Nút Ghi ngay + Lời nhắc */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[13px] font-semibold text-foreground">Tuần này</span>
              <span className="text-[11px] text-muted-foreground truncate">
                · {streak.thisWeekCount} hoạt động
              </span>
            </div>
            <button
              onClick={() => setIsLogOpen(true)}
              className="shrink-0 rounded-lg bg-brand hover:bg-brand-700 dark:bg-brand-sky dark:text-black text-white text-[12px] font-bold px-3 py-1 active:scale-95 transition-all shadow-2xs"
            >
              Ghi ngay
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label, i) => {
              const active = streak.activeDaysThisWeek[i];
              const isToday = i === 7 - streak.daysLeftInWeek;
              return (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center border transition-colors",
                      active
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-neutral-200 dark:border-neutral-700 text-transparent",
                      isToday && !active && "border-brand dark:border-brand-sky border-2"
                    )}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      isToday ? "text-brand dark:text-brand-sky" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        </div>
      </div>

      <LogWorkoutSheet open={isLogOpen} onClose={() => setIsLogOpen(false)} onSave={addActivity} />
    </section>
  );
}
