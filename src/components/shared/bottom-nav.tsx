"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Calendar, Activity, Users, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const MEMBER_BOTTOM_ITEMS = [
  { title: "Bảng kèo", href: "/bang-keo", icon: Flame },
  { title: "Kèo của tôi", href: "/keo-cua-toi", icon: Calendar },
  { title: "Chọn môn", href: "/chon-mon", icon: Activity },
  { title: "CLB", href: "/cau-lac-bo", icon: Users },
  { title: "Ví TS", href: "/vi-uy-tin", icon: ShieldCheck },
  { title: "Hồ sơ", href: "/ho-so", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính trên di động"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-2 py-1 safe-area-pb"
    >
      <div className="flex items-center justify-around">
        {MEMBER_BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] rounded-lg text-[10px] font-medium transition-colors select-none",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 mb-0.5",
                  isActive ? "stroke-[2.5]" : "stroke-[1.75]"
                )}
              />
              <span className="truncate max-w-[55px] text-center leading-none">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
