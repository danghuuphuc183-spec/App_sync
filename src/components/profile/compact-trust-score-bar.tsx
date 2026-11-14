"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Info, ShieldAlert, ShieldCheck } from "lucide-react";
import { TierBadge } from "@/components/shared/tier-badge";
import { cn } from "@/lib/utils";

interface CompactTrustScoreBarProps {
  score?: number;
  className?: string;
}

export function CompactTrustScoreBar({ score = 8.5, className }: CompactTrustScoreBarProps) {
  const [showRules, setShowRules] = React.useState(false);
  const percentage = Math.min(100, Math.max(0, (score / 10) * 100));

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-3.5 space-y-2.5 shadow-xs", className)}>
      {/* 1. Header: Shield Icon + Điểm số + Tier + Toggle button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-foreground">Điểm Uy Tín</span>
              <span className="text-[14px] font-black text-brand dark:text-brand-sky">{score.toFixed(1)} <span className="text-[11px] font-bold text-muted-foreground">/ 10 UT</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TierBadge score={score} />
          <button
            type="button"
            onClick={() => setShowRules((prev) => !prev)}
            aria-expanded={showRules}
            className="flex items-center gap-1 text-[11px] font-bold text-brand dark:text-brand-sky hover:underline px-2 py-1 rounded-lg bg-brand/5 dark:bg-brand/20 active:scale-95 transition-all"
          >
            <span>{showRules ? "Thu gọn" : "Cách tính điểm"}</span>
            {showRules ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* 2. Thanh ngang dài đo Điểm uy tín (Horizontal Bar) */}
      <div className="space-y-1">
        <div className="h-2.5 w-full rounded-full bg-muted/80 overflow-hidden relative border border-border/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-brand to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Các mốc điểm nhỏ tinh tế */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono px-0.5">
          <span>0 UT</span>
          <span className="text-amber-500 font-bold">5.0 (Cảnh báo)</span>
          <span className="text-brand dark:text-brand-sky font-bold">7.0 (Khởi điểm)</span>
          <span className="text-emerald-500 font-bold">10 UT (Tối đa)</span>
        </div>
      </div>

      {/* 3. Khối chú thích cách tính điểm & lý do trừ điểm (Expandable) */}
      {showRules && (
        <div className="pt-2 border-t border-border/60 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Cột Cộng Điểm */}
            <div className="p-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-[11.5px]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Cách cộng điểm (+UT)</span>
              </div>
              <ul className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-1">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Mặc định khởi điểm tài khoản: <strong className="text-foreground">7.0 UT</strong></span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Hoàn thành buổi tập đúng giờ (quét QR): <strong className="text-emerald-600 dark:text-emerald-400">+0.5 UT</strong></span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Chuỗi 5 buổi tập uy tín liên tiếp: <strong className="text-emerald-600 dark:text-emerald-400">+0.3 UT</strong> thưởng</span>
                </li>
              </ul>
            </div>

            {/* Cột Trừ Điểm */}
            <div className="p-2.5 rounded-xl bg-red-500/[0.06] border border-red-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 text-[11.5px]">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>Lý do bị trừ điểm (-UT)</span>
              </div>
              <ul className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-1">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Huỷ kèo sát giờ (&lt; 2 giờ): <strong className="text-red-500">-1.5 UT</strong></span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Huỷ kèo trước 2–12 giờ: <strong className="text-amber-500">-0.5 UT</strong> (hoặc dùng Thẻ ân hạn)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Bùng kèo (vắng mặt không báo trước): <strong className="text-red-500">-2.5 UT</strong> & tạm khoá ghép 24h</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Dưới 5.0 UT: Hạn chế ghép đôi, không thể tự tạo kèo mới</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[10.5px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" />
              <span>Điểm uy tín tự động đồng bộ theo từng buổi tập</span>
            </span>
            <Link href="/vi-uy-tin" className="font-bold text-brand dark:text-brand-sky hover:underline">
              Ví kỷ luật chi tiết →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
