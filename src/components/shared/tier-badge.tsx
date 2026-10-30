import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getTierFromScore, getTierNameVi, type SportTier } from "@/features/trust/config";
import { Shield, Award, Flame, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  score?: number;
  tier?: SportTier;
  showScore?: boolean;
  className?: string;
}

export function TierBadge({
  score,
  tier: directTier,
  showScore = false,
  className,
}: TierBadgeProps) {
  const effectiveTier: SportTier =
    directTier ?? (score !== undefined ? getTierFromScore(score) : "gold");
  const tierName = getTierNameVi(effectiveTier);

  const icons: Record<SportTier, React.ReactNode> = {
    bronze: <Shield className="mr-1 h-3.5 w-3.5" />,
    silver: <Award className="mr-1 h-3.5 w-3.5" />,
    gold: <Flame className="mr-1 h-3.5 w-3.5" />,
    diamond: <Gem className="mr-1 h-3.5 w-3.5" />,
  };

  return (
    <Badge
      variant={effectiveTier}
      className={cn("font-medium tracking-wide shadow-sm text-xs py-1 px-2.5", className)}
      aria-label={`Hạng ${tierName}${score !== undefined ? ` với ${score} điểm uy tín` : ""}`}
    >
      {icons[effectiveTier]}
      <span>Hạng {tierName}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-90 font-mono">({score})</span>
      )}
    </Badge>
  );
}
