"use client";

import * as React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUCKETS, activityHistogram, bucketToTime, peakBucket, timeToBucket } from "@/features/keo/activity-histogram";
import { SEED_KEOS } from "@/features/keo/keo.data";
import { formatKeoDay } from "@/features/keo/keo-date";
import { CANDIDATES_DATA } from "@/features/match/candidates.data";

/**
 * Chọn khoảng giờ bằng biểu đồ "giờ nào mọi người hoạt động nhiều nhất" + thanh trượt 2 đầu.
 * Cột nằm trong khoảng đã chọn tô màu thương hiệu; cột ngoài khoảng màu nhạt.
 */
export function TimeActivityPicker({
  sport,
  day,
  from,
  to,
  onChange,
}: {
  sport: string;
  day: string;
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const bars = React.useMemo(() => {
    const slots = CANDIDATES_DATA.filter((c) => c.sport === sport).map((c) => c.habitsAndPreferences.timeSlot);
    return activityHistogram(sport, day, SEED_KEOS, slots);
  }, [sport, day]);

  const lo = timeToBucket(from);
  const hi = timeToBucket(to);
  const peak = peakBucket(bars);
  const selectedAvg = hi > lo ? Math.round(bars.slice(lo, hi).reduce((s, v) => s + v, 0) / (hi - lo)) : 0;
  const crowd = selectedAvg >= 60 ? "Đông người" : selectedAvg >= 30 ? "Vừa phải" : "Vắng";

  const setLo = (v: number) => onChange(bucketToTime(Math.min(v, hi - 1)), to);
  const setHi = (v: number) => onChange(from, bucketToTime(Math.max(v, lo + 1)));

  // Bấm vào cột: kéo đầu gần nhất tới cột đó
  const onBarClick = (i: number) => {
    if (Math.abs(i - lo) <= Math.abs(i + 1 - hi)) setLo(i);
    else setHi(i + 1);
  };

  return (
    <div className="rounded-2xl border border-border p-3.5 pb-3">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground">{formatKeoDay(day)}</p>
          <p className="text-[22px] font-extrabold font-display text-foreground tracking-tight" aria-live="polite">
            {from} – {to}
          </p>
        </div>
        <span
          className={cn(
            "rounded-lg px-2.5 py-0.5 text-[11.5px] font-bold",
            selectedAvg >= 60 ? "bg-brand text-white" : selectedAvg >= 30 ? "bg-brand-100 text-brand-700" : "bg-muted text-muted-foreground"
          )}
        >
          {crowd}
        </span>
      </div>

      {/* Biểu đồ hoạt động */}
      <div className="flex items-end gap-[2px] h-24" role="img" aria-label={`Mức hoạt động theo giờ, đông nhất lúc ${bucketToTime(peak)}`}>
        {bars.map((v, i) => {
          const inRange = i >= lo && i < hi;
          return (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => onBarClick(i)}
              title={`${bucketToTime(i)}–${bucketToTime(i + 1)}`}
              className={cn(
                "flex-1 rounded-t-[3px] transition-colors",
                inRange ? "bg-brand hover:bg-brand-700" : "bg-brand-100 dark:bg-brand-900 hover:bg-brand-200"
              )}
              style={{ height: `${Math.max(6, v)}%` }}
            />
          );
        })}
      </div>

      {/* Thanh trượt 2 đầu */}
      <div className="relative h-8 mt-1">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-brand-100 dark:bg-brand-900" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-brand"
          style={{ left: `${(lo / BUCKETS) * 100}%`, right: `${100 - (hi / BUCKETS) * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={BUCKETS}
          step={1}
          value={lo}
          onChange={(e) => setLo(Number(e.target.value))}
          aria-label="Giờ bắt đầu"
          aria-valuetext={from}
          className="dual-range"
          style={{ zIndex: lo > BUCKETS - 2 ? 5 : 3 }}
        />
        <input
          type="range"
          min={0}
          max={BUCKETS}
          step={1}
          value={hi}
          onChange={(e) => setHi(Number(e.target.value))}
          aria-label="Giờ kết thúc"
          aria-valuetext={to}
          className="dual-range"
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="flex justify-between text-[11.5px] text-muted-foreground">
        <span>04:00</span>
        <span className="flex items-center gap-1 text-foreground font-semibold">
          <Flame className="h-3.5 w-3.5 text-foreground" /> Đông nhất {bucketToTime(peak)}
        </span>
        <span>22:00</span>
      </div>
    </div>
  );
}
