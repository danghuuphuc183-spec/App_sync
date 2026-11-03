"use client";

import * as React from "react";
import {
  ShieldCheck,
  Star,
  Users,
  User,
  Sparkles,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoachMatchResult } from "@/features/coaching/coaching.types";
import { cn } from "@/lib/utils";

interface CoachCardProps {
  matchResult: CoachMatchResult;
  onViewDetails: () => void;
  onBookSession: () => void;
}

export function CoachCard({ matchResult, onViewDetails, onBookSession }: CoachCardProps) {
  const { coach, matchScore, matchReasons, compatibilityHighlight } = matchResult;

  // Format currency
  const formatVnd = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const isTopMatch = matchScore >= 95;

  return (
    <div
      className={cn(
        "rounded-3xl border bg-card p-4 space-y-3.5 transition-all shadow-xs relative overflow-hidden",
        isTopMatch
          ? "border-[#1b3554]/60 dark:border-[#80aad3]/60 bg-gradient-to-b from-[#f0f8ff]/60 to-card dark:from-[#1b3554]/20 dark:to-card ring-1 ring-[#1b3554]/20"
          : "border-border hover:border-[#1b3554]/40"
      )}
    >
      {/* Top Match Ribbon */}
      {isTopMatch && (
        <div className="flex items-center justify-between pb-1 border-b border-[#1b3554]/15 dark:border-[#80aad3]/20">
          <span className="flex items-center gap-1.5 text-[11px] font-black text-[#1b3554] dark:text-[#c0e6fd]">
            <Sparkles className="h-3.5 w-3.5 fill-[#1b3554] dark:fill-[#c0e6fd]" />
            GỢI Ý TỐT NHẤT CHO BẠN
          </span>
          <Badge className="bg-[#1b3554] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            ⚡ {matchScore}% TƯƠNG THÍCH
          </Badge>
        </div>
      )}

      {/* Main Header Profile */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <img
              src={coach.avatar}
              alt={coach.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-background shadow-xs"
            />
            {coach.isVerified && (
              <div
                className="absolute -bottom-1 -right-1 bg-white dark:bg-[#000f22] p-0.5 rounded-full shadow-xs"
                title="HLV Đã Xác Minh Bằng Cấp & Kỷ Luật"
              >
                <ShieldCheck className="h-4 w-4 text-[#1b3554] dark:text-[#80aad3] fill-[#c0e6fd] dark:fill-[#1b3554]" />
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-black text-foreground">{coach.name}</h3>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 font-bold border-[#1b3554]/30 text-[#1b3554] dark:text-[#c0e6fd] bg-[#c0e6fd]/30"
              >
                {coach.trustScore} TS
              </Badge>
            </div>
            <div className="text-[11px] font-semibold text-muted-foreground line-clamp-1">
              {coach.title}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {coach.rating}
              </span>
              <span>•</span>
              <span className="font-medium">({coach.reviewCount} đánh giá thực tế)</span>
              <span>•</span>
              <span className="font-semibold text-foreground">{coach.sportCategory}</span>
            </div>
          </div>
        </div>

        {!isTopMatch && (
          <Badge className="bg-[#c0e6fd]/70 text-[#1b3554] dark:bg-[#1b3554]/40 dark:text-[#c0e6fd] text-[10px] font-black shrink-0">
            {matchScore}% Phù hợp
          </Badge>
        )}
      </div>

      {/* Body Stats & Measurements Bar */}
      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-muted/60 text-center text-xs">
        <div>
          <div className="text-[9px] text-muted-foreground uppercase font-bold">Chiều cao</div>
          <div className="font-black text-foreground text-xs">{coach.bodyStats.heightCm} cm</div>
        </div>
        <div>
          <div className="text-[9px] text-muted-foreground uppercase font-bold">Cân nặng</div>
          <div className="font-black text-foreground text-xs">{coach.bodyStats.weightKg} kg</div>
        </div>
        <div>
          <div className="text-[9px] text-muted-foreground uppercase font-bold">Kinh nghiệm</div>
          <div className="font-black text-[#1b3554] dark:text-[#80aad3] text-xs">
            {coach.bodyStats.experienceYears} năm
          </div>
        </div>
        <div>
          <div className="text-[9px] text-muted-foreground uppercase font-bold">Đã kèm</div>
          <div className="font-black text-foreground text-xs">{coach.bodyStats.totalTrainees}+ bạn</div>
        </div>
      </div>

      {/* Why Matched Badge */}
      <div className="space-y-1">
        <div className="text-[11px] text-foreground font-semibold flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-[#1b3554] dark:text-[#80aad3]" />
          <span>{compatibilityHighlight}:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {matchReasons.map((reason, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-background border border-border/80 text-muted-foreground"
            >
              ✓ {reason}
            </span>
          ))}
        </div>
      </div>

      {/* Transparent Pricing Comparison (1:1 vs Nhóm) */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-[#f0f8ff]/50 dark:bg-muted/40 border border-[#80aad3]/30">
        <div className="space-y-0.5">
          <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
            <User className="h-3 w-3 text-[#1b3554] dark:text-[#80aad3]" />
            Gói Kèm 1:1 Riêng
          </div>
          <div className="text-xs font-black text-foreground">
            {formatVnd(coach.pricing.single1on1.pricePerSession)}
            <span className="text-[9px] font-normal text-muted-foreground"> /buổi</span>
          </div>
          {coach.pricing.single1on1.trialPrice && (
            <div className="text-[9px] text-[#1b3554] dark:text-[#80aad3] font-semibold">
              Tập thử: {formatVnd(coach.pricing.single1on1.trialPrice)}
            </div>
          )}
        </div>

        <div className="space-y-0.5 border-l border-border/80 pl-2">
          <div className="text-[10px] text-[#1b3554] dark:text-[#80aad3] font-bold flex items-center gap-1">
            <Users className="h-3 w-3 text-[#1b3554] dark:text-[#80aad3]" />
            Gói Nhóm (Squad 2-4)
          </div>
          <div className="text-xs font-black text-[#1b3554] dark:text-[#80aad3]">
            {formatVnd(coach.pricing.groupCoaching.pricePerPersonPerSession)}
            <span className="text-[9px] font-normal text-muted-foreground"> /người/buổi</span>
          </div>
          <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
            Tiết kiệm -{coach.pricing.groupCoaching.savingsPercent}% chi phí
          </div>
        </div>
      </div>

      {/* Review Sneak Peek */}
      {coach.reviews.length > 0 && coach.reviews[0] && (() => {
        const firstReview = coach.reviews[0];
        return (
          <div className="p-2 rounded-xl bg-muted/40 text-[10px] text-muted-foreground space-y-1">
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-1.5 text-foreground">
                <img
                  src={firstReview.traineeAvatar}
                  alt={firstReview.traineeName}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="font-bold text-[10px]">{firstReview.traineeName}</span>
                <span className="text-[9px] text-muted-foreground">({firstReview.trainingType === "1:1" ? "Học 1:1" : "Tập nhóm"})</span>
              </div>
              {firstReview.achievementBadge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#1b3554]/10 text-[#1b3554] dark:bg-[#c0e6fd]/20 dark:text-[#c0e6fd] font-bold">
                  🏆 {firstReview.achievementBadge}
                </span>
              )}
            </div>
            <p className="line-clamp-2 italic text-foreground/90 pl-1">
              &ldquo;{firstReview.comment}&rdquo;
            </p>
          </div>
        );
      })()}

      {/* Location and Hobbies Tag */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
        <span className="flex items-center gap-1 truncate max-w-[200px]">
          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
          {coach.locations.slice(0, 2).join(", ")}
        </span>
        <span className="truncate text-[10px] text-muted-foreground font-medium">
          Sở thích: {coach.hobbies.slice(0, 2).join(" • ")}
        </span>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
        <Button
          onClick={onViewDetails}
          variant="outline"
          size="sm"
          className="rounded-full text-xs h-8 font-semibold border-border hover:bg-muted/60"
        >
          Hồ Sơ & Đánh Giá
        </Button>
        <Button
          onClick={onBookSession}
          size="sm"
          className="rounded-full bg-[#1b3554] hover:bg-[#000f22] text-white text-xs font-bold h-8 shadow-xs gap-1"
        >
          <span>Đặt Lịch Thử</span>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
