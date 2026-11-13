import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Ngọn lửa chuỗi tuần: lửa đỏ có chuyển động (lay nhẹ + lõi nhấp nháy + quầng sáng),
 * số tuần màu đen bóng nằm gọn trong lõi lửa. Hết chuỗi → lửa xám, đứng yên.
 */
export function StreakFlame({ value, active, className }: { value: React.ReactNode; active: boolean; className?: string }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <div className={cn("relative h-14 w-12", className)}>
      {active && (
        <span
          aria-hidden
          className="flame-glow absolute inset-x-1 bottom-0 top-3 rounded-full bg-red-500/40 blur-md"
        />
      )}
      <svg viewBox="0 0 48 56" className="relative h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`outer-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={active ? "#FF6B3D" : "#D4D4D8"} />
            <stop offset="55%" stopColor={active ? "#F2311F" : "#C4C4CA"} />
            <stop offset="100%" stopColor={active ? "#C81E16" : "#A1A1AA"} />
          </linearGradient>
          <linearGradient id={`core-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={active ? "#FFB347" : "#E4E4E7"} />
            <stop offset="100%" stopColor={active ? "#FFE7A3" : "#F4F4F5"} />
          </linearGradient>
        </defs>
        <g className={active ? "flame-sway" : undefined}>
          <path
            d="M24 2c1.6 9.5 13.5 15.8 15.6 29.2C41.6 45.4 33.6 54 24 54S6.2 45.8 8 32.6c1-7.6 5.4-11.4 7.8-18.2 2.6 5.2 3.8 8.6 6 10.4C23.4 17.6 21.8 9.6 24 2Z"
            fill={`url(#outer-${id})`}
          />
          {/* vệt sáng tạo cảm giác bóng */}
          <path d="M16.5 22c-2.6 4-3.8 8-3.4 12" stroke="#fff" strokeOpacity={active ? 0.45 : 0.6} strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
        <path
          className={active ? "flame-core" : undefined}
          d="M24 25c1.8 6 9 9.4 9 17.4 0 6.4-4.2 9.8-9 9.8s-9-3.4-9-9.2c0-5.6 4.4-8.4 6.6-12.4 1 2.6 1.8 3.6 2.4 2.8.6-2.2.4-5.4 0-8.4Z"
          fill={`url(#core-${id})`}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-x-0 bottom-[7px] text-center text-[13px] font-black leading-none tabular-nums",
          active ? "text-neutral-950" : "text-neutral-500"
        )}
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.7)" }}
      >
        {value}
      </span>
    </div>
  );
}
