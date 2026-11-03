"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Plus,
  Shield,
  Phone,
  Video,
  Send,
  Heart,
  Camera,
  Image as ImageIcon,
  Mic,
  Calendar,
  MapPin,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChatConversation, ChatMessage, INITIAL_CONVERSATIONS } from "@/features/chat/chat.data";

export default function ChatPage() {
  const [conversations, setConversations] = React.useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = React.useState<string>("conv-1");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [inputText, setInputText] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const activeConv: ChatConversation = React.useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConvId) ||
      conversations[0] ||
      INITIAL_CONVERSATIONS[0]!
    );
  }, [conversations, activeConvId]);

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.partner.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q) ||
        c.partner.sportVi.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [activeConv?.messages.length]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "current_user",
      senderName: "Minh Thư",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      text,
      timestamp: "Bây giờ",
      isRead: false,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTimeVi: "Vừa xong",
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText("");

    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        senderId: activeConv.partner.id,
        senderName: activeConv.partner.name,
        senderAvatar: activeConv.partner.avatar,
        text: "Ok bạn nhé! Mình đã ghim lịch vào app và chuẩn bị trang bị rồi.",
        timestamp: "Vừa xong",
        isRead: true,
      };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              lastMessage: replyMsg.text || "",
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  const handleToggleLike = (msgId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId ? { ...m, liked: !m.liked } : m
            ),
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-112px)] max-w-md mx-auto bg-background">
      {/* 1. TOP HEADER INSTAGRAM CHAT */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-background/95">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1 -ml-1 text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2]" />
          </Link>
          <div>
            <h2 className="text-sm font-black text-foreground">Tin Nhắn Đồng Đội</h2>
            <p className="text-[10px] text-muted-foreground">Instagram Direct Thể Thao</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/len-keo"
            className="px-2.5 py-1 rounded-lg bg-[#1b3554] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#000f22]"
          >
            <Plus className="h-3 w-3 stroke-[2]" />
            <span>Tìm Bạn Mới</span>
          </Link>
        </div>
      </div>

      {/* 2. CONVERSATIONS LIST (HORIZONTAL STORIES STYLE FOR QUICK SWITCH) */}
      <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/50">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {filteredConversations.map((c) => {
            const isSelected = c.id === activeConv.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className="flex flex-col items-center gap-1 shrink-0 p-1 group"
              >
                <div
                  className={cn(
                    "relative p-0.5 rounded-full transition-all",
                    isSelected
                      ? "ring-2 ring-[#1b3554] dark:ring-[#c0e6fd] scale-105"
                      : "ring-1 ring-neutral-300 dark:ring-neutral-700 opacity-80 group-hover:opacity-100"
                  )}
                >
                  <img
                    src={c.partner.avatar}
                    alt={c.partner.name}
                    loading="lazy"
                    decoding="async"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  {c.partner.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold max-w-[64px] truncate text-center",
                    isSelected ? "text-foreground font-bold" : "text-muted-foreground"
                  )}
                >
                  {c.partner.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE CONVERSATION MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-neutral-50/40 dark:bg-neutral-950/40">
        {/* Partner Info Banner */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-card border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <img
              src={activeConv.partner.avatar}
              alt={activeConv.partner.name}
              decoding="async"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <span>{activeConv.partner.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {activeConv.partner.trustScore} TS
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">{activeConv.partner.sportVi}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => alert(`Đang gọi thoại mã hóa cho ${activeConv.partner.name}...`)}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-400"
              title="Gọi thoại"
            >
              <Phone className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => alert(`Đang kết nối video call thể thao với ${activeConv.partner.name}...`)}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-400"
              title="Gọi video"
            >
              <Video className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Message Bubbles */}
        {activeConv.messages.map((msg) => {
          const isMe = msg.senderId === "current_user";
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col group relative max-w-[85%]",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              {msg.text && (
                <div
                  onDoubleClick={() => handleToggleLike(msg.id)}
                  className={cn(
                    "px-3 py-2 text-xs leading-relaxed select-none relative transition-all shadow-xs",
                    isMe
                      ? "bg-[#1b3554] text-white rounded-2xl rounded-tr-xs"
                      : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-tl-xs"
                  )}
                >
                  <span>{msg.text}</span>
                  {msg.liked && (
                    <span className="absolute -bottom-1.5 -right-1 bg-white dark:bg-neutral-900 rounded-full p-0.5 shadow-sm border border-neutral-200 dark:border-neutral-700">
                      <Heart className="h-2.5 w-2.5 text-rose-500 fill-rose-500" />
                    </span>
                  )}
                </div>
              )}

              {/* Workout Appointment Attachment */}
              {msg.attachment && msg.attachment.type === "appointment" && (
                <div className="w-full mt-1.5 p-3 rounded-xl bg-white dark:bg-card border border-[#80aad3]/40 shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-[#1b3554] dark:text-[#c0e6fd] font-bold text-xs">
                    <Calendar className="h-3.5 w-3.5 stroke-[2]" />
                    <span>{msg.attachment.title}</span>
                  </div>
                  {msg.attachment.imageUrl && (
                    <img
                      src={msg.attachment.imageUrl}
                      alt="Địa điểm"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="space-y-0.5 text-[11px]">
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-neutral-500" />
                      <span>{msg.attachment.subTitle}</span>
                    </div>
                    <p className="text-muted-foreground text-[10px] pl-4">{msg.attachment.detail}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 stroke-[2]" />
                      Đã Khóa Cọc {msg.attachment.holdTs} TS
                    </span>
                    {msg.attachment.actionHref && (
                      <Link
                        href={msg.attachment.actionHref}
                        className="text-[10px] font-bold text-[#1b3554] dark:text-[#c0e6fd] hover:underline flex items-center gap-0.5"
                      >
                        <span>{msg.attachment.actionLabel}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <span className="text-[9px] text-muted-foreground mt-0.5 px-1 font-mono">
                {msg.timestamp} {isMe && (msg.isRead ? "• Đã xem" : "• Đã gửi")}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. INSTAGRAM BOTTOM INPUT BAR */}
      <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 bg-background/95">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-1.5"
        >
          <button
            type="button"
            onClick={() => alert("Chụp ảnh hoặc quay video ngắn chia sẻ tiến độ buổi tập")}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-foreground rounded-lg"
            title="Camera"
          >
            <Camera className="h-4 w-4 stroke-[1.8]" />
          </button>
          <button
            type="button"
            onClick={() => alert("Chọn ảnh cung đường từ thư viện ảnh")}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-foreground rounded-lg"
            title="Gửi ảnh"
          >
            <ImageIcon className="h-4 w-4 stroke-[1.8]" />
          </button>
          <button
            type="button"
            onClick={() => alert("Đang ghi âm tin nhắn giọng nói (Voice Note)...")}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-foreground rounded-lg"
            title="Ghi âm"
          >
            <Mic className="h-4 w-4 stroke-[1.8]" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Nhắn tin..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-[#1b3554]"
            />
          </div>

          {inputText.trim() ? (
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#1b3554] text-white rounded-xl text-xs font-bold hover:bg-[#000f22] transition-colors flex items-center gap-1"
            >
              <span>Gửi</span>
              <Send className="h-3 w-3 stroke-[2]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSendMessage("❤️")}
              className="p-1.5 text-neutral-500 hover:text-rose-500 active:scale-125 transition-transform"
              title="Gửi tim"
            >
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
