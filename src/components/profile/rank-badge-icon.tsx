"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type RankBadgeLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface RankBadgeIconProps {
  level: RankBadgeLevel;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showAura?: boolean;
  animated?: boolean;
}

export function RankBadgeIcon({
  level,
  size = "md",
  className,
  showAura = false,
  animated = false,
}: RankBadgeIconProps) {
  const sizeMap = {
    xs: "w-6 h-7",
    sm: "w-8 h-9",
    md: "w-12 h-14",
    lg: "w-16 h-19",
    xl: "w-24 h-28",
  };

  // Distinct color palettes matching media_1794913688716_d30baf1c.png
  const configs = {
    1: {
      name: "Rookie (Bronze)",
      gradId: "grad-bronze",
      outerBorder: "#b45309",
      innerBorder: "#d97706",
      fillStart: "#78350f",
      fillEnd: "#451a03",
      accent: "#f59e0b",
      starGlow: "rgba(245, 158, 11, 0.4)",
      auraColor: "rgba(217, 119, 6, 0.3)",
      hasCrown: false,
    },
    2: {
      name: "Runner (Neon Cyan)",
      gradId: "grad-cyan",
      outerBorder: "#0891b2",
      innerBorder: "#22d3ee",
      fillStart: "#164e63",
      fillEnd: "#083344",
      accent: "#38bdf8",
      starGlow: "rgba(34, 211, 238, 0.6)",
      auraColor: "rgba(6, 182, 212, 0.45)",
      hasCrown: false,
    },
    3: {
      name: "Pacer (Ruby Crown)",
      gradId: "grad-ruby",
      outerBorder: "#e11d48",
      innerBorder: "#fb7185",
      fillStart: "#881337",
      fillEnd: "#4c0519",
      accent: "#f43f5e",
      starGlow: "rgba(251, 113, 133, 0.7)",
      auraColor: "rgba(225, 29, 72, 0.5)",
      hasCrown: true, // Crown on top as in the center image
    },
    4: {
      name: "Iron Core (Amethyst)",
      gradId: "grad-purple",
      outerBorder: "#7e22ce",
      innerBorder: "#c084fc",
      fillStart: "#581c87",
      fillEnd: "#3b0764",
      accent: "#a855f7",
      starGlow: "rgba(192, 132, 252, 0.6)",
      auraColor: "rgba(147, 51, 234, 0.4)",
      hasCrown: false,
    },
    5: {
      name: "Vanguard (Solar Gold)",
      gradId: "grad-gold",
      outerBorder: "#d97706",
      innerBorder: "#fde047",
      fillStart: "#78350f",
      fillEnd: "#451a03",
      accent: "#fbbf24",
      starGlow: "rgba(253, 224, 71, 0.7)",
      auraColor: "rgba(245, 158, 11, 0.5)",
      hasCrown: false,
    },
    6: {
      name: "Legend (Iridescent Diamond)",
      gradId: "grad-legend",
      outerBorder: "#38bdf8",
      innerBorder: "#e879f9",
      fillStart: "#1e1b4b",
      fillEnd: "#0f172a",
      accent: "#38bdf8",
      starGlow: "rgba(232, 121, 249, 0.8)",
      auraColor: "rgba(56, 189, 248, 0.6)",
      hasCrown: true,
    },
  }[level];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center shrink-0", sizeMap[size], className)}
    >
      {/* Ambient Pulsating Aura */}
      {showAura && (
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-md -z-10",
            animated && "animate-pulse"
          )}
          style={{
            backgroundColor: configs.auraColor,
            transform: "scale(1.35)",
          }}
        />
      )}

      {/* SVG Badge Shield Insignia */}
      <svg
        viewBox="0 0 100 120"
        className={cn("w-full h-full drop-shadow-md select-none", animated && "transition-transform hover:scale-105")}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Shield Gradient */}
          <linearGradient id={`${configs.gradId}-main`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={configs.fillStart} />
            <stop offset="100%" stopColor={configs.fillEnd} />
          </linearGradient>

          {/* Border Metallic Gradient */}
          <linearGradient id={`${configs.gradId}-border`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={configs.innerBorder} />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor={configs.outerBorder} />
          </linearGradient>

          {/* Star Glow Filter */}
          <filter id={`${configs.gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={configs.accent} floodOpacity="0.85" />
          </filter>
        </defs>

        {/* Crown (For Level 3 & Level 6) */}
        {configs.hasCrown && (
          <path
            d="M 38 12 L 43 20 L 50 10 L 57 20 L 62 12 L 60 23 L 40 23 Z"
            fill="url(#grad-silver-crown)"
            stroke={configs.innerBorder}
            strokeWidth="1.2"
          />
        )}
        <defs>
          <linearGradient id="grad-silver-crown" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* Outer Shield Border (Beveled Wing / Bracket) */}
        <path
          d="M 20 22 
             L 80 22 
             L 85 45 
             L 75 85 
             L 50 110 
             L 25 85 
             L 15 45 
             Z"
          fill={`url(#${configs.gradId}-border)`}
          stroke={configs.outerBorder}
          strokeWidth="1.5"
        />

        {/* Inner Shield Body */}
        <path
          d="M 24 26 
             L 76 26 
             L 80 47 
             L 71 82 
             L 50 103 
             L 29 82 
             L 20 47 
             Z"
          fill={`url(#${configs.gradId}-main)`}
          stroke={configs.innerBorder}
          strokeWidth="1.2"
        />

        {/* Diagonal Texture / Mesh Lines on Left and Right Wings */}
        <path
          d="M 28 32 L 40 32 M 27 38 L 42 38 M 28 44 L 40 44
             M 60 32 L 72 32 M 58 38 L 73 38 M 60 44 L 72 44"
          stroke={configs.innerBorder}
          strokeWidth="1"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />

        {/* Lower Armor Chevrons (V-Shaped Chevron Plating at base) */}
        <path
          d="M 33 76 L 50 92 L 67 76"
          stroke={configs.innerBorder}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 38 84 L 50 96 L 62 84"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeOpacity="0.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Center 5-Pointed White Star (White with Bright Rim) */}
        <g filter={`url(#${configs.gradId}-glow)`}>
          <polygon
            points="50,38 53.5,49 65,49 55.5,56 59,67 50,60 41,67 44.5,56 35,49 46.5,49"
            fill="#ffffff"
            stroke={configs.innerBorder}
            strokeWidth="0.8"
          />
        </g>

        {/* Iridescent Highlights for Legend Level 6 */}
        {level === 6 && (
          <path
            d="M 50 26 L 76 26 L 50 103 Z"
            fill="url(#legend-holo)"
            opacity="0.35"
            style={{ mixBlendMode: "overlay" }}
          />
        )}
        <defs>
          <linearGradient id="legend-holo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
