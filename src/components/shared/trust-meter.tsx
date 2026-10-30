import * as React from "react";
import { TRUST_CONFIG, getTierFromScore } from "@/features/trust/config";
import { TierBadge } from "./tier-badge";
import { ShieldCheck, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustMeterProps {
  currentScore: number;
  heldScore?: number;
  className?: string;
}

export function TrustMeter({
  currentScore,
  heldScore = 0,
  className,
}: TrustMeterProps) {
  const max = TRUST_CONFIG.MAX_SCORE;
  const clampedCurrent = Math.max(0, Math.min(currentScore, max));
  const availableScore = Math.max(0, clampedCurrent - heldScore);
  const currentPercentage = (clampedCurrent / max) * 100;
  const availablePercentage = (availableScore / max) * 100;

  const tier = getTierFromScore(clampedCurrent);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4",
        className
      )}
      role="region"
      aria-label="Thanh đo Điểm Uy Tín"
    >
      {/* Header chỉ số */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Điểm Uy Tín (Trust Score)
          </span>
        </div>
        <TierBadge score={clampedCurrent} tier={tier} />
      </div>

      {/* Điểm số lớn */}
      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="text-3xl font-extrabold text-foreground font-mono">
            {clampedCurrent}
          </span>
          <span className="text-sm text-muted-foreground ml-1">/ {max} TS</span>
        </div>

        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Unlock className="h-3.5 w-3.5" />
            <span>Khả dụng: {availableScore}</span>
          </div>
          {heldScore > 0 && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <Lock className="h-3.5 w-3.5" />
              <span>Đang cọc: {heldScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* Thanh đo đồ họa với vạch ngưỡng */}
      <div className="relative pt-2 pb-5">
        {/* Track nền */}
        <div className="relative h-3.5 w-full rounded-full bg-secondary overflow-hidden">
          {/* Thanh điểm khả dụng */}
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
            style={{ width: `${availablePercentage}%` }}
          />
          {/* Thanh điểm đang cọc (hold) nối tiếp */}
          {heldScore > 0 && (
            <div
              className="absolute top-0 h-full bg-amber-500/80 transition-all duration-300"
              style={{
                left: `${availablePercentage}%`,
                width: `${currentPercentage - availablePercentage}%`,
              }}
            />
          )}
        </div>

        {/* Các mốc ngưỡng hạng (60: Bạc, 100: Vàng, 130: Kim Cương) */}
        <div className="relative w-full h-4 mt-1">
          {/* Mốc 60 (40%) */}
          <div
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${(60 / 150) * 100}%` }}
          >
            <div className="h-2 w-0.5 bg-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground font-medium">60</span>
          </div>

          {/* Mốc 100 (66.6%) */}
          <div
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${(100 / 150) * 100}%` }}
          >
            <div className="h-2 w-0.5 bg-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground font-medium">100</span>
          </div>

          {/* Mốc 130 (86.6%) */}
          <div
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${(130 / 150) * 100}%` }}
          >
            <div className="h-2 w-0.5 bg-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground font-medium">130</span>
          </div>
        </div>
      </div>
    </div>
  );
}
