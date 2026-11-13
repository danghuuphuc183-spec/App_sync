"use client";

import * as React from "react";
import { CalendarPlus, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildHeatmap,
  dateKey,
  groupByDay,
  levelOf,
  monthStats,
  weekdayDistribution,
  type DayCell,
} from "@/features/activity/activity-log";
import { useActivityLog } from "@/features/activity/use-activity-log";
import { computeWeeklyStreak } from "@/features/streak/streak";
import { LogWorkoutSheet, SPORT_LOG_LABEL } from "@/components/activity/log-workout-sheet";

const ROW_LABELS = ["", "T3", "", "T5", "", "T7", ""]; // giống mẫu: chỉ ghi hàng xen kẽ
const WEEKDAY_FULL = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
const WEEKDAY_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const WEEKS = 20;

/** Màu theo mức (bộ nhận diện SYNESIS: xám → xanh nhạt → xanh trời → xanh hoàng gia → xanh đậm) */
const LEVEL_CLASS = [
  "bg-neutral-200 dark:bg-neutral-800 text-neutral-500",
  "bg-brand-100 text-brand-800",
  "bg-brand-200 text-brand-900",
  "bg-brand-sky text-black",
  "bg-brand text-white",
  "bg-brand-900 text-white",
] as const;

const fmtDay = (d: Date) =>
  `${WEEKDAY_FULL[(d.getDay() + 6) % 7]}, ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

/**
 * GHI NHẬN TẬP LUYỆN theo ngày trong tuần × tuần trong tháng (bản đồ nhiệt ~5 tháng).
 * Bấm vào một ô để xem/ghi buổi tập của ngày đó.
 */
export function TrainingLog({ className }: { className?: string }) {
  const { entries, loaded, addEntry, removeEntry } = useActivityLog();
  const [now, setNow] = React.useState<Date | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [logOpen, setLogOpen] = React.useState(false);

  React.useEffect(() => {
    const n = new Date();
    setNow(n);
    setSelected(dateKey(n));
  }, []);

  const data = React.useMemo(() => {
    if (!entries || !now) return null;
    const heat = buildHeatmap(entries, now, WEEKS);
    const labels = heat.monthLabels.filter((m, i, arr) => !(arr[i + 1] && arr[i + 1]!.col - m.col < 3));
    const byDay = groupByDay(entries);
    const partnerDays = heat.columns.flat().filter((c) => c.partner && !c.future).length;
    return {
      heat,
      labels,
      byDay,
      partnerDays,
      stats: monthStats(entries, now),
      dist: weekdayDistribution(entries, now),
      streak: computeWeeklyStreak(entries.map((e) => e.at), now),
    };
  }, [entries, now]);

  if (!loaded || !data || !now) {
    return <div className={cn("h-72 rounded-3xl bg-muted animate-pulse", className)} aria-label="Đang tải nhật ký tập luyện" />;
  }

  const selCell: DayCell | undefined = data.heat.columns.flat().find((c) => c.key === selected);
  const selItems = selected ? data.byDay.get(selected)?.items ?? [] : [];
  const maxDist = Math.max(1, ...data.dist);
  const topDay = data.dist.indexOf(Math.max(...data.dist));

  return (
    <section className={cn("rounded-3xl border border-border bg-card p-4 space-y-4 shadow-xs", className)} aria-label="Ghi nhận tập luyện">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="text-[16px] font-extrabold text-foreground">Ghi nhận tập luyện</h2>
          <p className="text-[12px] text-muted-foreground">Chuỗi {data.streak.current} tuần · dài nhất {data.streak.longest}</p>
        </div>
        <button
          onClick={() => {
            setSelected(dateKey(now));
            setLogOpen(true);
          }}
          className="shrink-0 whitespace-nowrap rounded-lg bg-brand hover:bg-brand-700 active:scale-95 text-white text-[12.5px] font-bold px-3.5 py-2 flex items-center gap-1.5"
        >
          <CalendarPlus className="h-4 w-4" /> Ghi buổi tập
        </button>
      </div>

      {/* Tháng này */}
      <div className="rounded-2xl bg-muted/60 pt-2">
        <p className="text-center text-[11px] font-semibold text-muted-foreground">Tháng {now.getMonth() + 1}</p>
        <div className="grid grid-cols-4 divide-x divide-border text-center">
          {[
            ["Buổi tập", data.stats.sessions],
            ["Ngày tập", data.stats.activeDays],
            ["Phút", data.stats.minutes],
            ["Cùng bạn", data.stats.partnerSessions],
          ].map(([k, v]) => (
            <div key={String(k)} className="py-1.5">
              <p className="text-[17px] font-extrabold font-display text-foreground">{v}</p>
              <p className="text-[10.5px] text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bản đồ nhiệt */}
      <div>
        <div className="grid gap-[3px] text-[10.5px] text-muted-foreground mb-1" style={{ gridTemplateColumns: `24px repeat(${WEEKS}, minmax(0, 1fr))` }}>
          <span />
          {data.labels.map((m) => (
            <span key={`${m.col}-${m.label}`} className="whitespace-nowrap font-semibold" style={{ gridColumn: `${m.col + 2} / span 4`, gridRow: 1 }}>
              {m.label}
            </span>
          ))}
        </div>
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `24px repeat(${WEEKS}, minmax(0, 1fr))`, gridTemplateRows: "repeat(7, auto)", gridAutoFlow: "column" }}
          role="grid"
          aria-label={`Số buổi tập mỗi ngày trong ${WEEKS} tuần gần nhất`}
        >
          {ROW_LABELS.map((l, r) => (
            <span key={`row-${r}`} className="text-[10.5px] text-muted-foreground flex items-center" style={{ gridColumn: 1, gridRow: r + 1 }}>
              {l}
            </span>
          ))}
          {data.heat.columns.map((col, c) =>
            col.map((cell, r) => {
              const lvl = levelOf(cell.count);
              const isSel = cell.key === selected;
              return (
                <button
                  key={cell.key}
                  type="button"
                  role="gridcell"
                  disabled={cell.future}
                  onClick={() => setSelected(cell.key)}
                  aria-label={`${fmtDay(cell.date)}: ${cell.count} buổi${cell.partner ? ", có tập cùng bạn" : ""}`}
                  aria-selected={isSel}
                  style={{ gridColumn: c + 2, gridRow: r + 1 }}
                  className={cn(
                    "relative aspect-square rounded-[4px] text-[8.5px] font-bold leading-none flex items-center justify-center transition-transform",
                    cell.future ? "bg-transparent border border-dashed border-neutral-200 dark:border-neutral-800 cursor-default" : LEVEL_CLASS[lvl],
                    !cell.future && "hover:scale-110",
                    isSel && "ring-2 ring-black dark:ring-white ring-offset-1 ring-offset-card"
                  )}
                >
                  {cell.count > 0 ? cell.count : ""}
                  {cell.partner && <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-brand-sky ring-1 ring-white" />}
                </button>
              );
            })
          )}
        </div>

        {/* Chú thích */}
        <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-foreground" /> Tập cùng bạn × {data.partnerDays}
          </span>
          <span className="flex items-center gap-1" aria-label="Chú thích: ít đến nhiều buổi tập">
            <span>Ít</span>
            {LEVEL_CLASS.map((c, i) => (
              <span key={i} className={cn("h-3 w-3 rounded-[3px]", c)} />
            ))}
            <span>Nhiều</span>
          </span>
        </div>
      </div>

      {/* Theo ngày trong tuần */}
      <div>
        <p className="text-[13px] font-bold text-foreground mb-2">
          Theo ngày trong tuần <span className="font-normal text-muted-foreground">· bạn hay tập nhất {WEEKDAY_FULL[topDay]}</span>
        </p>
        <div className="grid grid-cols-7 gap-2 items-end h-20">
          {data.dist.map((v, i) => (
            <div key={i} className="flex flex-col items-center justify-end h-full gap-1">
              <span className="text-[10.5px] font-semibold text-foreground">{v}</span>
              <div
                className={cn("w-full rounded-t-md", i === topDay ? "bg-brand" : "bg-brand-200 dark:bg-brand-800")}
                style={{ height: `${Math.max(6, (v / maxDist) * 70)}%` }}
              />
              <span className="text-[10.5px] text-muted-foreground">{WEEKDAY_SHORT[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chi tiết ngày đã chọn */}
      {selCell && (
        <div className="rounded-2xl border border-border p-3 space-y-2" aria-live="polite">
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-bold text-foreground">{fmtDay(selCell.date)}</p>
            {!selCell.future && (
              <button onClick={() => setLogOpen(true)} className="text-[12.5px] font-bold text-brand dark:text-brand-sky">
                + Ghi cho ngày này
              </button>
            )}
          </div>
          {selItems.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground">Chưa có buổi tập nào.</p>
          ) : (
            <ul className="space-y-1.5">
              {selItems.map((e) => (
                <li key={e.id} className="flex items-center gap-2 text-[13px]">
                  <span className="flex-1 text-foreground">
                    {SPORT_LOG_LABEL[e.sport] ?? e.sport} · {e.minutes} phút
                    {e.withPartner && <span className="ml-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-200 px-1.5 py-0.5 text-[10.5px] font-semibold">cùng bạn</span>}
                  </span>
                  <button onClick={() => removeEntry(e.id)} aria-label="Xoá buổi tập" className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <LogWorkoutSheet
        open={logOpen}
        onClose={() => setLogOpen(false)}
        dateLabel={selCell && selCell.key !== dateKey(now) ? fmtDay(selCell.date) : undefined}
        onSave={(v) => {
          const base = selCell && !selCell.future ? new Date(selCell.date) : new Date(now);
          if (selCell && selCell.key !== dateKey(now)) base.setHours(7, 0, 0, 0);
          else base.setTime(Date.now());
          addEntry({ at: base.toISOString(), ...v });
          setLogOpen(false);
        }}
      />
    </section>
  );
}
