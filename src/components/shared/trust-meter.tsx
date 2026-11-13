import * as React from "react";
import { UT_CONFIG, formatUt, getUtBand } from "@/features/trust/config";
import { TierBadge } from "./tier-badge";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustMeterProps {
  /** Điểm uy tín UT 0–10 */
  currentScore: number;
  className?: string;
}

const MARKS = [UT_CONFIG.BANDS.limited.min, UT_CONFIG.BANDS.watch.min, UT_CONFIG.BANDS.high.min];

export function TrustMeter({ currentScore, className }: TrustMeterProps) {
  const max = UT_CONFIG.MAX;
  const score = Math.max(0, Math.min(currentScore, max));
  const band = getUtBand(score);
  const limit = UT_CONFIG.BANDS[band].dailyKeoLimit;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4", className)} role="region" aria-label="Thanh đo Điểm Uy Tín">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-foreground" />
          <span className="font-semibold text-sm text-foreground">Điểm Uy tín (UT)</span>
        </div>
        <TierBadge score={score} />
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="text-3xl font-extrabold text-foreground font-mono">{formatUt(score)}</span>
          <span className="text-sm text-muted-foreground ml-1">/ {max} UT</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {limit === 0 ? "Chỉ tham gia kèo nhóm" : `Tạo tối đa ${limit} kèo/ngày`}
        </span>
      </div>

      <div className="relative pt-2 pb-5">
        <div className="relative h-3.5 w-full rounded-full bg-secondary overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-300" style={{ width: `${(score / max) * 100}%` }} />
        </div>
        <div className="relative w-full h-4 mt-1">
          {MARKS.map((m) => (
            <div key={m} className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${(m / max) * 100}%` }}>
              <div className="h-2 w-0.5 bg-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground font-medium">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
