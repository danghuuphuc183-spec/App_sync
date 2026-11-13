"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WEEKDAY_LONG, addDays, resolveDay, startOfDay, toIsoDay } from "@/features/keo/keo-date";

const HEAD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Lịch tháng để chọn chính xác ngày tập (thứ + ngày/tháng).
 * Không cho chọn ngày đã qua; tối đa `maxDaysAhead` ngày tới.
 */
export function DayCalendar({
  value,
  onChange,
  maxDaysAhead = 60,
}: {
  value: string;
  onChange: (isoDay: string) => void;
  maxDaysAhead?: number;
}) {
  const today = React.useMemo(() => startOfDay(new Date()), []);
  const last = React.useMemo(() => addDays(today, maxDaysAhead), [today, maxDaysAhead]);
  const selected = resolveDay(value, today);
  const [view, setView] = React.useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));

  // Đổi ngày từ bên ngoài (vd. nạp form mặc định) → nhảy tới tháng của ngày đó
  React.useEffect(() => {
    setView(new Date(selected.getFullYear(), selected.getMonth(), 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7; // T2 là cột đầu
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  const canPrev = new Date(year, month, 0) >= today;
  const canNext = new Date(year, month + 1, 1) <= last;
  const selectedIso = toIsoDay(selected);
  const todayIso = toIsoDay(today);
  const tomorrowIso = toIsoDay(addDays(today, 1));

  return (
    <div className="rounded-2xl border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setView(new Date(year, month - 1, 1))}
          disabled={!canPrev}
          aria-label="Tháng trước"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-[14px] font-bold text-foreground" aria-live="polite">
          Tháng {month + 1}, {year}
        </p>
        <button
          type="button"
          onClick={() => setView(new Date(year, month + 1, 1))}
          disabled={!canNext}
          aria-label="Tháng sau"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={`Lịch tháng ${month + 1} năm ${year}`}>
        {HEAD.map((h) => (
          <span key={h} className={cn("text-[11px] font-semibold py-1", h === "CN" || h === "T7" ? "text-foreground" : "text-muted-foreground")}>
            {h}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const iso = toIsoDay(d);
          const disabled = d < today || d > last;
          const isSel = iso === selectedIso;
          const isToday = iso === todayIso;
          const tag = isToday ? " (Hôm nay)" : iso === tomorrowIso ? " (Ngày mai)" : "";
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              aria-pressed={isSel}
              aria-label={`${WEEKDAY_LONG[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}${tag}`}
              className={cn(
                "relative h-10 rounded-lg text-[13.5px] font-semibold transition-colors",
                isSel
                  ? "bg-brand text-white"
                  : disabled
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "text-foreground hover:bg-muted",
                isToday && !isSel && "ring-1 ring-inset ring-foreground/60"
              )}
            >
              {d.getDate()}
              {isToday && (
                <span className={cn("absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full", isSel ? "bg-white" : "bg-foreground")} />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 border-t border-border pt-2.5 text-[12.5px] text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-foreground" />
        Đã chọn:{" "}
        <b className="text-foreground">
          {WEEKDAY_LONG[selected.getDay()]}, {pad(selected.getDate())}/{pad(selected.getMonth() + 1)}/{selected.getFullYear()}
        </b>
      </p>
    </div>
  );
}
