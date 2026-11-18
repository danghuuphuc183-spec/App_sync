"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Zap, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const FIVE_MAIN_TABS = [
  { title: "Trang Chủ", href: "/", icon: Home, exact: true },
  { title: "Bản Đồ", href: "/ban-do", icon: Map },
  { title: "Lên Kèo", href: "/len-keo", icon: Zap, isHighlight: true }, // Chính giữa - Tính năng cốt lõi
  { title: "Đồng đội", href: "/dong-doi", icon: Users },
  { title: "Bạn", href: "/ho-so", icon: User },
];

/** Màn hình hội thoại có ô soạn tin riêng ở đáy → ẩn thanh điều hướng (như Instagram Direct). */
const HIDE_ON_PREFIXES = ["/chat"];

export function BottomNav() {
  const pathname = usePathname();
  // Reels: thanh điều hướng nền đen giống Instagram
  const isDark = pathname?.startsWith("/reels") ?? false;

  if (pathname && HIDE_ON_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      aria-label="Điều hướng 5 trang chính trên di động"
      className={cn(
        "fixed bottom-0 inset-x-0 mx-auto w-full max-w-[430px] z-50 border-t px-2 pt-1 safe-area-pb",
        isDark
          ? "dark bg-black border-neutral-800 text-white"
          : "border-border/70 bg-card/85 backdrop-blur-xl supports-[backdrop-filter]:bg-card/75 shadow-[0_-8px_24px_-16px_rgb(7_11_26/0.18)]"
      )}
    >
      <div className="max-w-md mx-auto flex items-end justify-between">
        {FIVE_MAIN_TABS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(`${item.href}`)) ||
              (item.href === "/ho-so" && pathname?.startsWith("/cai-dat"));
          const Icon = item.icon;

          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="relative -top-3 flex flex-1 flex-col items-center justify-center group rounded-2xl"
              >
                <span
                  className={cn(
                    "btn-electric flex h-[52px] w-[52px] items-center justify-center rounded-full ring-4 transition-transform duration-300 ease-spring group-active:scale-90",
                    isDark ? "ring-black" : "ring-background",
                    isActive ? "scale-105 shadow-glow-lg" : "animate-glow-breathe"
                  )}
                >
                  <Icon className={cn("h-6 w-6 stroke-[2.3]", isActive && "animate-icon-pop")} />
                </span>
                <span
                  className={cn(
                    "text-micro font-bold mt-1 tracking-tight transition-colors",
                    isActive ? "text-brand dark:text-brand-glow" : "text-foreground/80"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 pt-2 pb-1 min-h-[52px] rounded-xl text-micro select-none transition-colors",
                isActive
                  ? "text-foreground font-bold"
                  : "text-muted-foreground font-medium hover:text-foreground"
              )}
            >
              {/* Vạch chỉ báo kiểu "vạch làn chạy": giãn ra khi tab được chọn */}
              <span
                aria-hidden
                className={cn(
                  "absolute top-0 h-[3px] w-6 rounded-full bg-brand-gradient transition-all duration-300 ease-out-expo",
                  isActive ? "opacity-100 scale-x-100 shadow-glow" : "opacity-0 scale-x-0"
                )}
              />
              <Icon
                className={cn(
                  "h-[22px] w-[22px] transition-[stroke-width,color] duration-200",
                  isActive ? "stroke-[2.3] text-brand dark:text-brand-glow animate-icon-pop" : "stroke-[1.8]"
                )}
              />
              <span className="truncate max-w-[64px] text-center leading-none mt-1">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
