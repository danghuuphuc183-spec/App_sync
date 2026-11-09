"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, MessageCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { AiHelpAssistant } from "@/components/assistant/ai-help-assistant";
import { NotificationsPanel, INITIAL_NOTIFICATIONS, type AppNotification } from "@/components/shared/notifications-panel";

const ICON_BTN =
  "h-10 w-10 rounded-full relative text-foreground bg-neutral-100/80 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all active:scale-95";

/**
 * Header trên cùng: logo bên trái; bên phải chỉ có Trợ lý AI, Tin nhắn và Thông báo.
 */
export function PublicHeader() {
  const { isAuthenticated } = useAuth();
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const closeAssistant = React.useCallback(() => setIsAssistantOpen(false), []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div ref={notifRef} className="max-w-md mx-auto flex h-14 items-center justify-between px-3 relative">
        {/* LEFT: Logo */}
        <Link href="/" aria-label="Trang chủ" className="shrink-0 active:scale-95 transition-transform">
          <Image
            src="/logo-icon-128.png"
            alt="SYNC SPORT"
            width={36}
            height={36}
            unoptimized
            priority
            className="h-9 w-9 rounded-xl ring-1 ring-black/5 dark:ring-white/10 object-contain"
          />
        </Link>

        {/* RIGHT: Trợ lý AI · Tin nhắn · Thông báo */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={ICON_BTN}
            onClick={() => {
              setIsNotifOpen(false);
              setIsAssistantOpen(true);
            }}
            aria-label="Trợ lý AI hỗ trợ sử dụng"
            title="Trợ lý AI hỗ trợ sử dụng"
          >
            <Bot className="h-5 w-5 stroke-[1.9]" />
            <span className="absolute -top-0.5 -right-0.5 rounded-full bg-gradient-to-r from-brand to-brand-500 px-1 text-[8px] font-black text-white leading-[14px]">
              AI
            </span>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className={ICON_BTN}
            aria-label="Tin nhắn"
            title="Tin nhắn"
          >
            <Link href={isAuthenticated ? "/chat" : "/dang-nhap"}>
              <MessageCircle className="h-5 w-5 stroke-[1.9]" />
              {isAuthenticated && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
              )}
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={ICON_BTN}
            onClick={() => setIsNotifOpen((v) => !v)}
            aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"}
            aria-expanded={isNotifOpen}
            title="Thông báo"
          >
            <Bell className="h-5 w-5 stroke-[1.9]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-4 text-center ring-2 ring-background">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>

        <NotificationsPanel
          open={isNotifOpen}
          items={notifications}
          onClose={() => setIsNotifOpen(false)}
          onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
        />
      </div>

      <AiHelpAssistant open={isAssistantOpen} onClose={closeAssistant} />
    </header>
  );
}
