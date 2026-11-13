"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bot, Send, X } from "lucide-react";
import { answerHelpQuestion, HELP_SUGGESTIONS, type HelpAnswer } from "@/features/assistant/help-bot";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  from: "user" | "bot";
  text: string;
  link?: HelpAnswer["link"];
}

const WELCOME: Message = {
  id: 0,
  from: "bot",
  text: "Xin chào! Mình là trợ lý SYNC. Bạn cần hỗ trợ gì khi sử dụng app?",
};

export function AiHelpAssistant({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = React.useState<Message[]>([WELCOME]);
  const [input, setInput] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);
  const nextId = React.useRef(1);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q) return;
    const answer = answerHelpQuestion(q);
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, from: "user", text: q },
      { id: nextId.current++, from: "bot", text: answer.text, link: answer.link },
    ]);
    setInput("");
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Trợ lý AI hỗ trợ sử dụng"
        className="w-full max-w-md h-[78vh] bg-background rounded-t-3xl border-t border-border shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand to-brand-500 text-white flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">Trợ lý SYNC</p>
              <p className="text-[11px] text-emerald-600 font-medium leading-tight">Hỗ trợ sử dụng app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng trợ lý"
            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                  m.from === "user"
                    ? "bg-brand text-white rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                <p>{m.text}</p>
                {m.link && (
                  <Link
                    href={m.link.href}
                    onClick={onClose}
                    className="mt-1.5 inline-block text-[12px] font-bold text-brand dark:text-brand-sky hover:underline"
                  >
                    {m.link.label} →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pt-1 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {HELP_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="shrink-0 rounded-lg border border-border px-3 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2 px-4 pb-5 pt-1"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi cách sử dụng app..."
            aria-label="Câu hỏi cho trợ lý"
            className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            aria-label="Gửi câu hỏi"
            disabled={!input.trim()}
            className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
