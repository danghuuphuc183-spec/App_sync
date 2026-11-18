"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RankBadgeIcon, type RankBadgeLevel } from "./rank-badge-icon";

export interface RankThemeConfig {
  level: RankBadgeLevel;
  nameVi: string;
  nameEn: string;
  badgeTitle: string;
  metalName: string;
  primaryColor: string;
  accentColor: string;
  auraRgba: string;
  textClass: string;
  pillClass: string;
  borderClass: string;
  activeBorderClass: string;
  avatarRingGradient: string;
  progressGradient: string;
  orbGradientPrimary: string;
  orbGradientSecondary: string;
  headerRadialAura: string;
  glowShadow: string;
}

export const RANK_THEMES: Record<RankBadgeLevel, RankThemeConfig> = {
  1: {
    level: 1,
    nameVi: "Tân Binh",
    nameEn: "ROOKIE",
    badgeTitle: "Cấp 1 · Tân Binh",
    metalName: "Đồng (Bronze Metallic)",
    primaryColor: "#d97706",
    accentColor: "#b45309",
    auraRgba: "rgba(217, 119, 6, 0.35)",
    textClass: "text-amber-600 dark:text-amber-400 font-bold",
    pillClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25",
    borderClass: "border-amber-600/30 dark:border-amber-500/25",
    activeBorderClass: "border-amber-500 shadow-[0_0_20px_-3px_rgba(217,119,6,0.35)]",
    avatarRingGradient: "from-amber-600 via-amber-500 to-yellow-600",
    progressGradient: "from-amber-700 via-amber-500 to-yellow-500",
    orbGradientPrimary: "from-amber-500/30 via-orange-600/15 to-transparent",
    orbGradientSecondary: "from-yellow-600/20 via-amber-700/10 to-transparent",
    headerRadialAura: "radial-gradient(circle at 80% 20%, rgba(217,119,6,0.22) 0%, rgba(180,83,9,0.08) 45%, transparent 70%)",
    glowShadow: "shadow-[0_0_25px_-5px_rgba(217,119,6,0.4)]",
  },
  2: {
    level: 2,
    nameVi: "Thành Viên Chính Thức",
    nameEn: "RUNNER / LIFTER",
    badgeTitle: "Cấp 2 · Runner",
    metalName: "Bạc & Neon Cyan (Cyan & Silver)",
    primaryColor: "#06b6d4",
    accentColor: "#38bdf8",
    auraRgba: "rgba(6, 182, 212, 0.45)",
    textClass: "text-cyan-600 dark:text-cyan-400 font-bold",
    pillClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30",
    borderClass: "border-cyan-500/30 dark:border-cyan-400/30",
    activeBorderClass: "border-cyan-400 shadow-[0_0_22px_-3px_rgba(6,182,212,0.4)]",
    avatarRingGradient: "from-cyan-400 via-teal-400 to-sky-500",
    progressGradient: "from-cyan-500 via-teal-400 to-sky-400",
    orbGradientPrimary: "from-cyan-400/35 via-teal-500/20 to-transparent",
    orbGradientSecondary: "from-sky-400/25 via-cyan-600/15 to-transparent",
    headerRadialAura: "radial-gradient(circle at 80% 20%, rgba(6,182,212,0.28) 0%, rgba(56,189,248,0.12) 50%, transparent 75%)",
    glowShadow: "shadow-[0_0_30px_-5px_rgba(6,182,212,0.45)]",
  },
  3: {
    level: 3,
    nameVi: "Người Giữ Nhịp",
    nameEn: "PACER / SPOTTER",
    badgeTitle: "Cấp 3 · Pacer",
    metalName: "Đỏ Ruby Vương Miện (Crimson Ruby)",
    primaryColor: "#e11d48",
    accentColor: "#f43f5e",
    auraRgba: "rgba(225, 29, 72, 0.45)",
    textClass: "text-rose-600 dark:text-rose-400 font-bold",
    pillClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30",
    borderClass: "border-rose-500/30 dark:border-rose-400/30",
    activeBorderClass: "border-rose-500 shadow-[0_0_25px_-3px_rgba(225,29,72,0.45)]",
    avatarRingGradient: "from-rose-500 via-red-500 to-pink-500",
    progressGradient: "from-rose-600 via-red-500 to-pink-500",
    orbGradientPrimary: "from-rose-500/35 via-red-600/20 to-transparent",
    orbGradientSecondary: "from-pink-500/25 via-rose-700/15 to-transparent",
    headerRadialAura: "radial-gradient(circle at 80% 20%, rgba(225,29,72,0.28) 0%, rgba(244,63,94,0.12) 50%, transparent 75%)",
    glowShadow: "shadow-[0_0_30px_-5px_rgba(225,29,72,0.45)]",
  },
  4: {
    level: 4,
    nameVi: "Kỷ Luật Thép",
    nameEn: "IRON CORE",
    badgeTitle: "Cấp 4 · Iron Core",
    metalName: "Tím Pha Lê (Amethyst Purple)",
    primaryColor: "#9333ea",
    accentColor: "#a855f7",
    auraRgba: "rgba(147, 51, 234, 0.45)",
    textClass: "text-purple-600 dark:text-purple-400 font-bold",
    pillClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30",
    borderClass: "border-purple-500/30 dark:border-purple-400/30",
    activeBorderClass: "border-purple-500 shadow-[0_0_25px_-3px_rgba(147,51,234,0.45)]",
    avatarRingGradient: "from-purple-500 via-violet-500 to-indigo-500",
    progressGradient: "from-purple-600 via-violet-500 to-indigo-500",
    orbGradientPrimary: "from-purple-500/35 via-violet-600/20 to-transparent",
    orbGradientSecondary: "from-fuchsia-500/25 via-purple-700/15 to-transparent",
    headerRadialAura: "radial-gradient(circle at 80% 20%, rgba(147,51,234,0.3) 0%, rgba(168,85,247,0.12) 50%, transparent 75%)",
    glowShadow: "shadow-[0_0_30px_-5px_rgba(147,51,234,0.45)]",
  },
  5: {
    level: 5,
    nameVi: "Chiến Binh Tiên Phong",
    nameEn: "VANGUARD",
    badgeTitle: "Cấp 5 · Vanguard",
    metalName: "Vàng Rực Rỡ (Solar Gold & Amber)",
    primaryColor: "#f59e0b",
    accentColor: "#fbbf24",
    auraRgba: "rgba(245, 158, 11, 0.5)",
    textClass: "text-amber-500 dark:text-amber-300 font-bold",
    pillClass: "bg-amber-500/15 text-amber-700 dark:text-amber-200 border border-amber-400/40",
    borderClass: "border-amber-500/40 dark:border-amber-400/35",
    activeBorderClass: "border-amber-400 shadow-[0_0_28px_-3px_rgba(245,158,11,0.5)]",
    avatarRingGradient: "from-amber-400 via-yellow-400 to-orange-500",
    progressGradient: "from-amber-500 via-yellow-400 to-orange-400",
    orbGradientPrimary: "from-amber-400/40 via-yellow-500/25 to-transparent",
    orbGradientSecondary: "from-orange-500/25 via-amber-600/15 to-transparent",
    headerRadialAura: "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.32) 0%, rgba(251,191,36,0.14) 50%, transparent 75%)",
    glowShadow: "shadow-[0_0_35px_-5px_rgba(245,158,11,0.5)]",
  },
  6: {
    level: 6,
    nameVi: "Huyền Thoại",
    nameEn: "SYNESIS LEGEND",
    badgeTitle: "Cấp 6 · Legend",
    metalName: "Kim Cương Đa Sắc (Iridescent Diamond)",
    primaryColor: "#38bdf8",
    accentColor: "#c084fc",
    auraRgba: "rgba(56, 189, 248, 0.55)",
    textClass: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 font-extrabold",
    pillClass: "bg-gradient-to-r from-cyan-500/15 via-fuchsia-500/15 to-purple-500/15 text-purple-700 dark:text-cyan-200 border border-cyan-400/40",
    borderClass: "border-cyan-400/40 dark:border-fuchsia-400/40",
    activeBorderClass: "border-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 shadow-[0_0_32px_-3px_rgba(192,132,252,0.55)]",
    avatarRingGradient: "from-cyan-400 via-fuchsia-400 to-purple-500",
    progressGradient: "from-cyan-400 via-fuchsia-500 to-purple-500",
    orbGradientPrimary: "from-cyan-400/35 via-fuchsia-500/25 to-transparent",
    orbGradientSecondary: "from-purple-500/30 via-sky-500/20 to-transparent",
    headerRadialAura: "radial-gradient(circle at 80% 20%, rgba(56,189,248,0.35) 0%, rgba(192,132,252,0.2) 40%, rgba(244,114,182,0.1) 65%, transparent 80%)",
    glowShadow: "shadow-[0_0_38px_-5px_rgba(192,132,252,0.55)]",
  },
};

export function getRankTheme(level: number): RankThemeConfig {
  const safeLevel = Math.max(1, Math.min(6, Math.floor(level || 1))) as RankBadgeLevel;
  return RANK_THEMES[safeLevel];
}

interface RankAuraGlowProps {
  level: number;
  variant?: "corner-orb" | "dual-mesh" | "top-aurora" | "avatar-halo" | "subtle-banner";
  className?: string;
  pulse?: boolean;
}

/**
 * Hiệu ứng "màu loan" (ambient glow / radial aura mesh) chuẩn theo 6 bậc Rank Synesis
 */
export function RankAuraGlow({
  level,
  variant = "corner-orb",
  className,
  pulse = true,
}: RankAuraGlowProps) {
  const theme = getRankTheme(level);

  if (variant === "corner-orb") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl transition-all duration-700",
          `bg-gradient-to-br ${theme.orbGradientPrimary}`,
          pulse && "rank-aura-pulse",
          className
        )}
        style={{
          boxShadow: theme.glowShadow,
        }}
        aria-hidden="true"
      />
    );
  }

  if (variant === "dual-mesh") {
    return (
      <>
        {/* Top-right primary loan-màu */}
        <div
          className={cn(
            "pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl transition-all duration-700",
            `bg-gradient-to-br ${theme.orbGradientPrimary}`,
            pulse && "rank-aura-pulse",
            className
          )}
          aria-hidden="true"
        />
        {/* Bottom-left secondary loan-màu */}
        <div
          className={cn(
            "pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-70 transition-all duration-700",
            `bg-gradient-to-tr ${theme.orbGradientSecondary}`,
            className
          )}
          aria-hidden="true"
        />
      </>
    );
  }

  if (variant === "top-aurora") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-28 opacity-80 blur-xl transition-all duration-700",
          className
        )}
        style={{
          background: theme.headerRadialAura,
        }}
        aria-hidden="true"
      />
    );
  }

  if (variant === "avatar-halo") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -m-2 rounded-full blur-md opacity-60 transition-all duration-500",
          `bg-gradient-to-tr ${theme.avatarRingGradient}`,
          pulse && "rank-aura-pulse",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  // subtle-banner
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-2xl opacity-40 blur-lg transition-all duration-500",
        `bg-gradient-to-r ${theme.orbGradientPrimary}`,
        className
      )}
      aria-hidden="true"
    />
  );
}

interface RankPillProps {
  level: number;
  label?: string;
  onClick?: () => void;
  className?: string;
  size?: "xs" | "sm";
}

/**
 * Nút/Tag Rank có huy hiệu + hiệu ứng màu loan tinh tế
 */
export function RankPill({
  level,
  label,
  onClick,
  className,
  size = "xs",
}: RankPillProps) {
  const theme = getRankTheme(level);
  const displayLabel = label || theme.badgeTitle;

  const content = (
    <>
      <RankBadgeIcon level={theme.level} size="xs" showAura animated />
      <span className="truncate">{displayLabel}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1.5 font-bold rounded-full transition-all active:scale-95",
          size === "xs" ? "text-caption px-2.5 py-0.5" : "text-xs px-3 py-1",
          theme.pillClass,
          "hover:shadow-xs",
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold rounded-full",
        size === "xs" ? "text-caption px-2.5 py-0.5" : "text-xs px-3 py-1",
        theme.pillClass,
        className
      )}
    >
      {content}
    </span>
  );
}
