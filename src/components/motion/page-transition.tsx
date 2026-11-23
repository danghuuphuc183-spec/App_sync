"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FIVE_MAIN_TABS } from "@/components/shared/bottom-nav";

/**
 * Hiệu ứng chuyển trang theo hướng, giống app gốc:
 *  - đổi giữa 5 tab chính  → trượt ngắn theo vị trí tab (sang phải / sang trái)
 *  - đi sâu hơn (/len-keo → /len-keo/xem) → trượt vào từ phải (push)
 *  - quay ra nông hơn → trượt vào từ trái (pop)
 *  - còn lại → hiện dần + nhích lên
 * Lần tải đầu tiên không chạy hiệu ứng (tránh làm chậm hiển thị nội dung).
 *
 * Dùng trong `template.tsx` (Next remount template mỗi lần đổi route nên hiệu ứng chạy lại).
 * Kiểu "backwards" không giữ transform sau khi chạy xong → phần tử position:fixed trong trang
 * không bị neo theo khung đang trượt.
 */

type TransitionKind = "none" | "push" | "pop" | "tab-right" | "tab-left" | "fade";

/** Đường dẫn trang trước đó (giữ ở cấp module vì template bị remount mỗi lần điều hướng). */
let previousPath: string | null = null;

/** Trang toàn màn hình dùng position:fixed ngay khi mở → chỉ đổi độ mờ, không trượt. */
const FIXED_FULLSCREEN_PREFIXES = ["/reels"];

function tabIndexOf(path: string): number {
  return FIVE_MAIN_TABS.findIndex((tab) => path === tab.href);
}

function depthOf(path: string): number {
  return path.split("/").filter(Boolean).length;
}

export function resolveTransition(prev: string | null, next: string): TransitionKind {
  if (prev === null || prev === next) return "none";
  if (FIXED_FULLSCREEN_PREFIXES.some((p) => next.startsWith(p))) return "fade";

  const prevTab = tabIndexOf(prev);
  const nextTab = tabIndexOf(next);
  if (prevTab !== -1 && nextTab !== -1) return nextTab > prevTab ? "tab-right" : "tab-left";

  const prevDepth = depthOf(prev);
  const nextDepth = depthOf(next);
  if (nextDepth > prevDepth) return "push";
  if (nextDepth < prevDepth) return "pop";
  return "fade";
}

const KIND_CLASS: Record<Exclude<TransitionKind, "none">, string> = {
  push: "page-enter page-enter-push",
  pop: "page-enter page-enter-pop",
  "tab-right": "page-enter page-enter-tab-right",
  "tab-left": "page-enter page-enter-tab-left",
  fade: "page-enter page-enter-fade",
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  // Tính một lần lúc mount: server và lần hydrate đầu đều thấy previousPath = null → "none", không lệch HTML
  const [kind] = React.useState<TransitionKind>(() => resolveTransition(previousPath, pathname));

  React.useEffect(() => {
    previousPath = pathname;
  }, [pathname]);

  // Cuộn trang do Next.js tự lo (lên đầu khi vào trang mới, khôi phục vị trí khi bấm Quay lại)
  return <div className={cn("w-full", kind !== "none" && KIND_CLASS[kind])}>{children}</div>;
}
