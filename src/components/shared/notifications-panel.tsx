"use client";

import * as React from "react";
import { Flame, UserPlus, Zap, ThumbsUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppNotification {
  id: string;
  kind: "streak" | "follow" | "match" | "like";
  text: string;
  timeAgo: string;
  unread: boolean;
}

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "streak",
    text: "Tuần này bạn chưa ghi hoạt động nào. Ghi 1 buổi tập trước Chủ Nhật để giữ chuỗi!",
    timeAgo: "1 giờ",
    unread: true,
  },
  { id: "n2", kind: "follow", text: "Nguyễn Gia Huy đã bắt đầu theo dõi bạn.", timeAgo: "3 giờ", unread: true },
  {
    id: "n3",
    kind: "match",
    text: "Hoàng Nam đã nhận kèo chạy 5:30 sáng mai tại Landmark 81.",
    timeAgo: "Hôm qua",
    unread: false,
  },
  { id: "n4", kind: "like", text: "Thuỳ Dung và 12 người khác đã thả Strong bài của bạn.", timeAgo: "2 ngày", unread: false },
];

const ICONS = { streak: Flame, follow: UserPlus, match: Zap, like: ThumbsUp } as const;

export function NotificationsPanel({
  open,
  items,
  onClose,
  onMarkAllRead,
}: {
  open: boolean;
  items: AppNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-label="Thông báo"
      className="absolute right-2 top-full mt-1 w-[min(22rem,calc(100vw-1rem))] rounded-2xl bg-card border border-border shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
        <p className="text-sm font-bold text-foreground">Thông báo</p>
        <div className="flex items-center gap-1">
          <button onClick={onMarkAllRead} className="text-[11px] font-semibold text-brand dark:text-brand-sky px-2 py-1 rounded-lg hover:bg-muted">
            Đánh dấu đã đọc
          </button>
          <button onClick={onClose} aria-label="Đóng thông báo" className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <ul className="max-h-[60vh] overflow-y-auto divide-y divide-border/60">
        {items.map((n) => {
          const Icon = ICONS[n.kind];
          return (
            <li key={n.id} className={cn("flex gap-2.5 px-3.5 py-2.5", n.unread && "bg-brand-50/70 dark:bg-brand-950/30")}>
              <div
                className={cn(
                  "h-8 w-8 shrink-0 rounded-full flex items-center justify-center",
                  n.kind === "streak" ? "bg-brand-100 text-brand-700 dark:bg-brand-950/50" : "bg-muted text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] leading-snug text-foreground">{n.text}</p>
                <p className="text-[10.5px] text-muted-foreground mt-0.5">{n.timeAgo}</p>
              </div>
              {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-label="Chưa đọc" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
