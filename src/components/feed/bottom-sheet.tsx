"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Thời gian hiệu ứng đóng; giữ sheet trong DOM đúng bằng khoảng này rồi mới gỡ. */
const EXIT_MS = 200;

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
  // Giữ sheet thêm EXIT_MS sau khi `open` tắt để kịp chạy hiệu ứng trượt xuống
  const [rendered, setRendered] = React.useState(open);
  if (open && !rendered) setRendered(true);

  React.useEffect(() => {
    if (open) return;
    const timer = setTimeout(() => setRendered(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!rendered || typeof document === "undefined") return null;
  const closing = !open;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[1100] bg-ink/55 backdrop-blur-[2px] flex items-end justify-center",
        closing ? "animate-out fade-out duration-200" : "animate-in fade-in duration-200"
      )}
      onClick={closing ? undefined : onClose}
      // Đang đóng: ẩn khỏi trình đọc màn hình và không nhận thao tác nữa
      aria-hidden={closing || undefined}
      inert={closing || undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "w-full max-w-md bg-card rounded-t-3xl shadow-lift flex flex-col max-h-[85vh] border-t border-border/60",
          closing
            ? "animate-out slide-out-to-bottom duration-200"
            : "animate-in slide-in-from-bottom [animation-duration:360ms]",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center pt-2.5 pb-1 shrink-0">
          <span className="h-1.5 w-10 rounded-full bg-border" />
        </div>
        {title && (
          <div className="relative flex items-center justify-center px-4 pb-2.5 border-b border-border shrink-0">
            <h3 className="text-body font-bold text-foreground">{title}</h3>
            <button onClick={onClose} aria-label="Đóng" className="absolute right-3 h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className={cn("overflow-y-auto overscroll-contain", bodyClassName)}>{children}</div>
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
            <div role="status" className="rounded-xl bg-ink/95 text-white text-label font-semibold px-4 py-2.5 shadow-lift ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-300">
              {msg}
            </div>
          </div>,
          document.body
        )
      : null;
  return { show, node };
}
