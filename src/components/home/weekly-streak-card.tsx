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
  const [slide, setSlide] = React.useState(0);
  const [isLogOpen, setIsLogOpen] = React.useState(false);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const streak = React.useMemo(
    () => computeWeeklyStreak((log ?? []).map((e) => e.at), new Date(), { historyWeeks: 12 }),
    [log]
  );

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  const addActivity = (v: { sport: string; minutes: number; withPartner: boolean }) => {
    addEntry({ at: new Date().toISOString(), ...v });
    setIsLogOpen(false);
  };

  const firstWeek = streak.history[0];
  const maxCount = Math.max(1, ...streak.history.map((w) => w.count));
  const subtitle = streak.thisWeekMet
    ? `Tuyệt vời! Tuần này bạn đã ghi ${streak.thisWeekCount} hoạt động. Chuỗi đã được giữ.`
    : streak.atRisk
      ? `Còn ${streak.daysLeftInWeek} ngày để giữ chuỗi ${streak.current} tuần. Ghi 1 hoạt động ngay!`
      : "Ghi lại hoạt động để bắt đầu chuỗi liên tiếp của bạn.";

  return (
    <section aria-label="Chuỗi liên tiếp theo tuần" className="bg-white dark:bg-card border-y border-neutral-200/80 dark:border-neutral-800">
      <div className="flex items-center justify-between px-4 pt-3">
        <h2 className="text-[15px] font-bold text-foreground">Chuỗi liên tiếp của bạn</h2>
        <button
          onClick={() => goTo(2)}
          className="text-[13px] font-bold text-brand dark:text-brand-sky hover:underline"
        >
          Xem lịch
        </button>
      </div>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {/* SLIDE 1: Chuỗi tuần */}
        <div className="w-full shrink-0 snap-center px-4 py-3 flex items-center gap-3">
          <div className="flex flex-col items-center shrink-0 w-14">
            <StreakFlame value={log ? streak.current : "–"} active={!!log && streak.current > 0} />
            <span className="text-[12px] font-semibold text-muted-foreground">Tuần</span>
          </div>
          <p className="flex-1 text-[13px] leading-snug text-neutral-700 dark:text-neutral-300">{subtitle}</p>
          <button
            onClick={() => setIsLogOpen(true)}
            className="shrink-0 rounded-lg bg-brand hover:bg-brand-700 dark:bg-brand-sky dark:text-black text-white text-[13px] font-bold px-4 py-2 active:scale-95 transition-all"
          >
            Ghi ngay
          </button>
        </div>

        {/* SLIDE 2: Tuần này */}
        <div className="w-full shrink-0 snap-center px-4 py-3">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[13px] font-semibold text-foreground">Tuần này</p>
            <p className="text-[12px] text-muted-foreground">
              {streak.thisWeekCount} hoạt động · Dài nhất {streak.longest} tuần
            </p>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAY_LABELS.map((label, i) => {
              const active = streak.activeDaysThisWeek[i];
              const isToday = i === 7 - streak.daysLeftInWeek;
              return (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center border",
                      active
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-neutral-200 dark:border-neutral-700 text-transparent",
                      isToday && !active && "border-brand dark:border-brand-sky border-2"
                    )}
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                  <span className={cn("text-[10px] font-semibold", isToday ? "text-foreground" : "text-muted-foreground")}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLIDE 3: Lịch 12 tuần */}
        <div className="w-full shrink-0 snap-center px-4 py-3">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[13px] font-semibold text-foreground">12 tuần gần nhất</p>
            <p className="text-[12px] text-muted-foreground">Mỗi cột là 1 tuần</p>
          </div>
          <div className="flex items-end gap-1 h-14" role="img" aria-label="Biểu đồ số hoạt động 12 tuần gần nhất">
            {streak.history.map((w) => (
              <div key={w.weekStart.toISOString()} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  title={`Tuần ${w.weekStart.getDate()}/${w.weekStart.getMonth() + 1}: ${w.count} hoạt động`}
                  className={cn(
                    "w-full rounded-sm",
                    w.met ? "bg-brand-600" : "bg-neutral-200 dark:bg-neutral-700",
                    w.isCurrent && "ring-2 ring-brand/50 ring-offset-1 ring-offset-background"
                  )}
                  style={{ height: `${Math.max(12, (w.count / maxCount) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>
              {firstWeek ? `${firstWeek.weekStart.getDate()}/${firstWeek.weekStart.getMonth() + 1}` : ""}
            </span>
            <span>Tuần này</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 pb-3">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Trang ${i + 1}`}
            className={cn("h-1.5 rounded-full transition-all", slide === i ? "w-4 bg-neutral-700 dark:bg-neutral-200" : "w-1.5 bg-neutral-300 dark:bg-neutral-600")}
          />
        ))}
      </div>

      <LogWorkoutSheet open={isLogOpen} onClose={() => setIsLogOpen(false)} onSave={addActivity} />
    </section>
  );
}
