"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Tấm trượt từ dưới lên kiểu Instagram, render qua portal để không bị kẹt trong khung cuộn. */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
  bodyClassName,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1100] bg-black/50 flex items-end justify-center animate-in fade-in duration-150" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className={cn(
          "w-full max-w-md bg-background rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center pt-2.5 pb-1 shrink-0">
          <span className="h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        </div>
        {title && (
          <div className="relative flex items-center justify-center px-4 pb-2.5 border-b border-border shrink-0">
            <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
            <button onClick={onClose} aria-label="Đóng" className="absolute right-3 h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className={cn("overflow-y-auto", bodyClassName)}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

/** Thông báo nhỏ ở cuối màn hình */
export function useToast() {
  const [msg, setMsg] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = React.useCallback((text: string) => {
    setMsg(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2200);
  }, []);
  const node =
    msg && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed bottom-24 inset-x-0 z-[1200] flex justify-center pointer-events-none">
            <div role="status" className="rounded-full bg-black/90 text-white text-[13px] font-semibold px-4 py-2 shadow-lg animate-in fade-in slide-in-from-bottom-2">
              {msg}
            </div>
          </div>,
          document.body
        )
      : null;
  return { show, node };
}
