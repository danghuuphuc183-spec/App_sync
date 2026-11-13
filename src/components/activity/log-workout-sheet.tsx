"use client";

import * as React from "react";
import { Flame, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/feed/bottom-sheet";

export const LOG_SPORTS = [
  { id: "running", label: "Chạy bộ" },
  { id: "gym", label: "Gym" },
  { id: "cycling", label: "Đạp xe" },
  { id: "pickleball", label: "Pickleball" },
  { id: "badminton", label: "Cầu lông" },
  { id: "swimming", label: "Bơi lội" },
];

export const SPORT_LOG_LABEL: Record<string, string> = Object.fromEntries(LOG_SPORTS.map((s) => [s.id, s.label]));

/** Ghi một buổi tập (dùng chung cho Chuỗi tuần và Ghi nhận tập luyện). */
export function LogWorkoutSheet({
  open,
  onClose,
  onSave,
  dateLabel,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (v: { sport: string; minutes: number; withPartner: boolean }) => void;
  dateLabel?: string;
}) {
  const [sport, setSport] = React.useState(LOG_SPORTS[0]!.id);
  const [minutes, setMinutes] = React.useState(45);
  const [withPartner, setWithPartner] = React.useState(false);

  return (
    <BottomSheet open={open} onClose={onClose} title={dateLabel ? `Ghi buổi tập · ${dateLabel}` : "Ghi buổi tập hôm nay"} bodyClassName="p-4 pb-6 space-y-4">
      <div className="space-y-2">
        <p className="text-[12px] font-semibold text-muted-foreground">Môn thể thao</p>
        <div className="flex flex-wrap gap-2">
          {LOG_SPORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSport(s.id)}
              aria-pressed={sport === s.id}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13px] font-medium border transition-colors",
                sport === s.id ? "bg-brand text-white border-brand" : "border-border text-foreground hover:bg-muted"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[12px] font-semibold text-muted-foreground">
          <span>Thời lượng</span>
          <span className="text-foreground">{minutes} phút</span>
        </div>
        <input
          type="range"
          min={10}
          max={180}
          step={5}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          aria-label="Thời lượng (phút)"
          className="w-full accent-brand"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer">
        <Users className="h-5 w-5 text-foreground shrink-0" />
        <span className="flex-1 text-[13px] text-foreground">Tập cùng bạn (qua kèo)</span>
        <input type="checkbox" checked={withPartner} onChange={(e) => setWithPartner(e.target.checked)} className="h-5 w-5 accent-brand" />
      </label>

      <button
        type="button"
        onClick={() => onSave({ sport, minutes, withPartner })}
        className="w-full rounded-lg bg-brand hover:bg-brand-700 active:scale-[0.98] text-white font-bold py-3 text-sm flex items-center justify-center gap-2"
      >
        <Flame className="h-4 w-4" />
        Lưu buổi tập
      </button>
    </BottomSheet>
  );
}
