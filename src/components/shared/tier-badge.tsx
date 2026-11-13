import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { formatUt, getUtBand, getUtBandNameVi, type UtBand } from "@/features/trust/config";
import { ShieldAlert, ShieldMinus, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  /** Điểm uy tín UT 0–10 */
  score: number;
  showScore?: boolean;
  className?: string;
}

const VARIANT: Record<UtBand, "bronze" | "silver" | "gold" | "diamond"> = {
  low: "bronze",
  limited: "silver",
  watch: "gold",
  high: "diamond",
};

const ICON: Record<UtBand, React.ReactNode> = {
  low: <ShieldAlert className="mr-1 h-3.5 w-3.5" />,
  limited: <ShieldMinus className="mr-1 h-3.5 w-3.5" />,
  watch: <Shield className="mr-1 h-3.5 w-3.5" />,
  high: <ShieldCheck className="mr-1 h-3.5 w-3.5" />,
};

/** Nhãn mức Uy tín (UT 0–10) */
export function TierBadge({ score, showScore = false, className }: TierBadgeProps) {
  const band = getUtBand(score);
  const name = getUtBandNameVi(band);
  return (
    <Badge
      variant={VARIANT[band]}
      className={cn("font-medium tracking-wide shadow-sm text-xs py-1 px-2.5", className)}
      aria-label={`${name}, ${formatUt(score)} điểm uy tín`}
    >
      {ICON[band]}
      <span>{name}</span>
      {showScore && <span className="ml-1 opacity-90 font-mono">({formatUt(score)} UT)</span>}
    </Badge>
  );
}
