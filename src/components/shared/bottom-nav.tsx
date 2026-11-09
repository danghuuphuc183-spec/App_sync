"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Zap, Users, User, Plus, LayoutList, ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/feed/bottom-sheet";
import { cn } from "@/lib/utils";

export const FIVE_MAIN_TABS = [
  { title: "Trang Chủ", href: "/", icon: Home, exact: true },
  { title: "Bản Đồ", href: "/ban-do", icon: Map },
  { title: "Lên Kèo", href: "/len-keo", icon: Zap, isHighlight: true }, // Chính giữa - Tính năng cốt lõi
  { title: "Nhóm", href: "/cau-lac-bo", icon: Users },
  { title: "Bạn", href: "/ho-so", icon: User },
];

const KEO_MENU = [
  {
    href: "/len-keo",
    title: "Lên kèo mới",
    desc: "Tạo kèo tập cá nhân hoặc nhóm trong thời gian tới",
    icon: Plus,
    tone: "bg-brand text-white",
  },
  {
    href: "/len-keo/xem",
    title: "Xem kèo",
    desc: "Các kèo sắp diễn ra mà mọi người đã lên",
    icon: LayoutList,
    tone: "bg-black text-white dark:bg-white dark:text-black",
  },
];

export function BottomNav() {
  const pathname = usePathname();
  // Reels: thanh điều hướng nền đen giống Instagram
  const isDark = pathname?.startsWith("/reels") ?? false;
  const [isKeoMenuOpen, setIsKeoMenuOpen] = React.useState(false);

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
              <button
                key={item.href}
                type="button"
                onClick={() => setIsKeoMenuOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isKeoMenuOpen}
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
                    isActive ? "text-brand dark:text-brand-sky" : "text-neutral-700 dark:text-neutral-300"
                  )}
                >
                  {item.title}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 min-h-[46px] rounded-xl text-[10px] font-medium transition-all select-none active:scale-95",
                isActive
                  ? "text-brand dark:text-brand-sky font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center px-3 py-1 rounded-full transition-colors",
                  isActive && "bg-brand-100/50 dark:bg-brand"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "stroke-[2.2] scale-105 text-brand dark:text-brand-sky" : "stroke-[1.75]"
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

      {/* Menu nút Lên Kèo: cá nhân · nhóm · xem kèo */}
      <BottomSheet open={isKeoMenuOpen} onClose={() => setIsKeoMenuOpen(false)} title="Lên kèo" bodyClassName="p-3 pb-8 space-y-2">
        {KEO_MENU.map((o) => (
          <Link
            key={o.href}
            href={o.href}
            onClick={() => setIsKeoMenuOpen(false)}
            className="flex items-center gap-3.5 rounded-2xl border border-border p-3.5 hover:bg-muted active:scale-[0.99] transition-all text-foreground"
          >
            <span className={cn("h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center", o.tone)}>
              <o.icon className="h-6 w-6" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-bold">{o.title}</span>
              <span className="block text-[12.5px] text-muted-foreground">{o.desc}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </BottomSheet>
    </nav>
  );
}
