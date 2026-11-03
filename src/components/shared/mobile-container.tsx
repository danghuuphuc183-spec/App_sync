"use client";

import * as React from "react";
import { Smartphone, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileContainer({ children }: { children: React.ReactNode }) {
  const [isPhoneFrame, setIsPhoneFrame] = React.useState(true);

  return (
    <div className="min-h-screen bg-slate-950/5 dark:bg-black/40 flex flex-col justify-start items-center">
      {/* Desktop Helper Bar to Switch View Mode */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-5xl px-4 py-1.5 text-xs text-muted-foreground border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Ứng dụng tối ưu hóa cho trải nghiệm di động (Mobile-First 390px - 430px)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium",
              isPhoneFrame
                ? "bg-primary text-primary-foreground shadow-xs"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Khung Điện Thoại (Khuyên dùng)</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium",
              !isPhoneFrame
                ? "bg-primary text-primary-foreground shadow-xs"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Toàn màn hình</span>
          </button>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div
        className={cn(
          "w-full min-h-screen bg-background transition-all duration-300 relative flex flex-col",
          isPhoneFrame
            ? "max-w-[430px] my-0 lg:my-4 rounded-none lg:rounded-[40px] lg:border-[8px] lg:border-slate-800 lg:shadow-2xl overflow-hidden"
            : "max-w-5xl"
        )}
      >
        {/* Fake iOS Dynamic Island / Notch on Desktop Frame */}
        {isPhoneFrame && (
          <div className="hidden lg:flex w-full h-7 bg-slate-900 items-center justify-between px-6 text-[11px] text-white select-none z-50">
            <span className="font-semibold">09:41</span>
            <div className="w-20 h-4 bg-black rounded-full" />
            <div className="flex items-center gap-1 text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col w-full pb-20">{children}</div>
      </div>
    </div>
  );
}
