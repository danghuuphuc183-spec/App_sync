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
  { title: "Nhóm", href: "/cau-lac-bo", icon: Users },
  { title: "Bạn", href: "/ho-so", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  // Reels: thanh điều hướng nền đen giống Instagram
  const isDark = pathname?.startsWith("/reels") ?? false;

  return (
    <nav
      aria-label="Điều hướng 5 trang chính trên di động"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t px-3 py-1.5 safe-area-pb shadow-sm",
        isDark
          ? "dark bg-black border-neutral-800 text-white"
          : "border-neutral-200/80 dark:border-neutral-800 bg-background/95 backdrop-blur-md"
      )}
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {FIVE_MAIN_TABS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || (item.href !== "/" && pathname?.startsWith(`${item.href}`));
          const Icon = item.icon;

          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3 flex flex-col items-center justify-center group focus:outline-none"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all duration-200 active:scale-95",
                    isActive
                      ? "bg-black dark:bg-brand-sky text-white dark:text-black ring-2 ring-brand/40"
                      : "bg-brand hover:bg-brand-700 dark:bg-brand-sky text-white dark:text-black shadow-brand/25 group-hover:scale-105"
                  )}
                >
                  <Icon className="h-6 w-6 stroke-[2.2]" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold mt-0.5 tracking-tight",
                    isActive ? "text-foreground" : "text-neutral-700 dark:text-neutral-300"
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
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 min-h-[46px] rounded-xl text-[10px] font-medium transition-all select-none active:scale-95",
                isActive
                  ? "text-foreground font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center px-3 py-1 rounded-lg transition-colors",
                  isActive && "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "stroke-[2.2] scale-105 text-foreground" : "stroke-[1.75]"
                  )}
                />
              </div>
              <span className="truncate max-w-[58px] text-center leading-none mt-0.5">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>

    </nav>
  );
}
