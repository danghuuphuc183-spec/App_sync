"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Video,
  Camera,
  Image as ImageIcon,
  Mic,
  Heart,
  Send,
  Calendar,
  MapPin,
  Shield,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatConversation, ChatMessage, INITIAL_CONVERSATIONS } from "@/features/chat/chat.data";
import { formatUt } from "@/features/trust/config";

interface InstagramChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConversationId?: string;
  partnerInfo?: {
    name: string;
    avatar: string;
    handle?: string;
    sportVi?: string;
    trustScore?: number;
    appointmentPrompt?: {
      title: string;
      dateTimeVi: string;
      locationName: string;
    };
  };
}

export function InstagramChatModal({
  isOpen,
  onClose,
  initialConversationId = "conv-1",
  partnerInfo,
}: InstagramChatModalProps) {
  const [conversations, setConversations] = React.useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = React.useState<string>(initialConversationId);
  const [inputText, setInputText] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Sync initial conversation or partner info
  React.useEffect(() => {
    if (initialConversationId) {
      setActiveConvId(initialConversationId);
    }
  }, [initialConversationId]);

  // Find active conversation
  const activeConv: ChatConversation = React.useMemo(() => {
    const found = conversations.find((c) => c.id === activeConvId);
    if (found) return found;
    // Fallback or custom partner
    if (partnerInfo) {
      return {
        id: "custom-partner",
        type: "direct" as const,
        partner: {
          id: "custom",
          name: partnerInfo.name,
          avatar: partnerInfo.avatar,
          handle: partnerInfo.handle || "@partner_sync",
          isOnline: true,
          lastActiveVi: "Đang hoạt động",
          trustScore: partnerInfo.trustScore || 120,
          tier: "gold" as const,
          sportVi: partnerInfo.sportVi || "Thể thao",
        },
        lastMessage: "Bắt đầu cuộc trò chuyện...",
        lastMessageTimeVi: "Bây giờ",
        unreadCount: 0,
        messages: partnerInfo.appointmentPrompt
          ? [
              {
                id: `init-${Date.now()}`,
                senderId: "partner",
                senderName: partnerInfo.name,
                senderAvatar: partnerInfo.avatar,
                text: `Chào bạn! Mình rất vui được kết nối để tập luyện cùng bạn. Dưới đây là thông tin buổi hẹn tập:`,
                timestamp: "Bây giờ",
                isRead: true,
                attachment: {
                  type: "appointment" as const,
                  title: partnerInfo.appointmentPrompt.title,
                  subTitle: `${partnerInfo.appointmentPrompt.dateTimeVi} • ${partnerInfo.appointmentPrompt.locationName}`,
                  detail: "Huỷ sớm −0,25 UT · trong 30 phút −0,5 UT · vắng −1 UT",
                  actionLabel: "Xem trên Bản Đồ",
                  actionHref: "/ban-do",
                },
              },
            ]
          : [],
      };
    }
    return conversations[0] || INITIAL_CONVERSATIONS[0]!;
  }, [conversations, activeConvId, partnerInfo]);

  // Scroll to bottom on new message
  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
    }
  }, [isOpen, activeConv?.messages.length]);

  if (!isOpen) return null;

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

    // Automated polite reply simulation after 1s
    if (activeConv.id.startsWith("conv-")) {
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: `reply-${Date.now()}`,
          senderId: activeConv.partner.id,
          senderName: activeConv.partner.name,
          senderAvatar: activeConv.partner.avatar,
          text: "Nhất trí bạn nhé! Hẹn gặp bạn đúng giờ, cùng giữ vững kỷ luật!",
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
    }
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-0 sm:p-3 animate-in fade-in duration-150">
      <div className="w-full h-full sm:max-w-md sm:h-[680px] bg-background border border-neutral-200 dark:border-neutral-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* =================================================================== */}
        {/* 1. INSTAGRAM CHAT HEADER */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-background/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-1 -ml-1 text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Đóng chat"
            >
              <ArrowLeft className="h-5 w-5 stroke-[2]" />
            </button>

            {/* Avatar with online dot */}
            <div className="relative shrink-0">
              <img
                src={activeConv.partner.avatar}
                alt={activeConv.partner.name}
                className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
              />
              {activeConv.partner.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
              )}
            </div>

            {/* Partner Info */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground truncate">
                  {activeConv.partner.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatUt(activeConv.partner.trustScore)} UT
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground truncate">
                {activeConv.partner.lastActiveVi}
              </span>
            </div>
          </div>

          {/* Instagram Action Icons (Audio, Video, Info) */}
          <div className="flex items-center gap-1 text-neutral-800 dark:text-neutral-200">
            <button
              onClick={() => alert(`Đang kết nối cuộc gọi thoại mã hóa với ${activeConv.partner.name}...`)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Gọi thoại"
            >
              <Phone className="h-4 w-4 stroke-[1.8]" />
            </button>
            <button
              onClick={() => alert(`Đang kết nối video call thể thao với ${activeConv.partner.name}...`)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Gọi video"
            >
              <Video className="h-4 w-4 stroke-[1.8]" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Đóng"
            >
              <X className="h-4 w-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. CONVERSATION SWITCHER TABS (NẾU CÓ NHIỀU HỘI THOẠI) */}
        {/* =================================================================== */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-900 overflow-x-auto scrollbar-none bg-neutral-50/70 dark:bg-neutral-950/70">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveConvId(c.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border",
                activeConvId === c.id
                  ? "bg-brand text-white border-brand shadow-xs"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-foreground"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{c.partner.name.split(" ")[0]}</span>
              {c.unreadCount > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {c.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* =================================================================== */}
        {/* 3. INSTAGRAM CHAT MESSAGES BODY */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-neutral-50/40 dark:bg-neutral-950/40">
          {/* Athlete Profile Greeting Header */}
          <div className="text-center py-4 space-y-1.5 border-b border-neutral-200/60 dark:border-neutral-800/60 mb-2">
            <img
              src={activeConv.partner.avatar}
              alt={activeConv.partner.name}
              className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-brand/30 shadow-md"
            />
            <h4 className="text-xs font-black text-foreground">{activeConv.partner.name}</h4>
            <p className="text-[11px] text-muted-foreground">{activeConv.partner.sportVi}</p>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand-100/30 dark:bg-brand/30 border border-brand-300/40 text-[10px] text-brand dark:text-brand-sky font-bold">
              <Shield className="h-3 w-3 stroke-[2]" />
              <span>{activeConv.partner.trustScore} Điểm Uy Tín • Khế Ước Kỷ Luật</span>
            </div>
          </div>

          {/* Messages Loop */}
          {activeConv.messages.map((msg) => {
            const isMe = msg.senderId === "current_user";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col group relative max-w-[82%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                {/* Text Message Bubble */}
                {msg.text && (
                  <div
                    onDoubleClick={() => handleToggleLike(msg.id)}
                    className={cn(
                      "px-3 py-2 text-xs leading-relaxed select-none relative transition-all shadow-xs",
                      isMe
                        ? "bg-brand text-white rounded-2xl rounded-tr-xs"
                        : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-tl-xs"
                    )}
                  >
                    <span>{msg.text}</span>

                    {/* Liked Heart Badge (Instagram style) */}
                    {msg.liked && (
                      <span className="absolute -bottom-1.5 -right-1 bg-white dark:bg-neutral-900 rounded-full p-0.5 shadow-sm border border-neutral-200 dark:border-neutral-700">
                        <Heart className="h-2.5 w-2.5 text-foreground fill-foreground" />
                      </span>
                    )}
                  </div>
                )}

                {/* Attachment: Workout Appointment Card */}
                {msg.attachment && msg.attachment.type === "appointment" && (
                  <div className="w-full mt-1.5 p-3 rounded-xl bg-white dark:bg-card border border-brand-300/40 shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-brand dark:text-brand-sky font-bold text-xs">
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
                        Đã chốt kèo
                      </span>
                      {msg.attachment.actionHref && (
                        <Link
                          href={msg.attachment.actionHref}
                          onClick={onClose}
                          className="text-[10px] font-bold text-brand dark:text-brand-sky hover:underline flex items-center gap-0.5"
                        >
                          <span>{msg.attachment.actionLabel}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamp & Seen status */}
                <span className="text-[9px] text-muted-foreground mt-0.5 px-1 font-mono">
                  {msg.timestamp} {isMe && (msg.isRead ? "• Đã xem" : "• Đã gửi")}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* =================================================================== */}
        {/* 4. INSTAGRAM BOTTOM INPUT BAR */}
        {/* =================================================================== */}
        <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 bg-background/95">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-1.5"
          >
            {/* Quick action buttons (Camera, Image, Mic) */}
            <button
              type="button"
              onClick={() => alert("Tính năng chụp ảnh buổi tập đang kết nối camera thiết bị!")}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-foreground rounded-lg transition-colors"
              title="Camera"
            >
              <Camera className="h-4 w-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              onClick={() => alert("Chọn ảnh cung đường từ thư viện ảnh")}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-foreground rounded-lg transition-colors"
              title="Gửi ảnh"
            >
              <ImageIcon className="h-4 w-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              onClick={() => alert("Đang ghi âm tin nhắn giọng nói (Voice Note)...")}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-foreground rounded-lg transition-colors"
              title="Ghi âm"
            >
              <Mic className="h-4 w-4 stroke-[1.8]" />
            </button>

            {/* Input Text Box */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Nhắn tin..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-brand"
              />
            </div>

            {/* Send button OR Instagram quick Heart button */}
            {inputText.trim() ? (
              <button
                type="submit"
                className="px-3 py-1.5 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors flex items-center gap-1"
              >
                <span>Gửi</span>
                <Send className="h-3 w-3 stroke-[2]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendMessage("♥︎")}
                className="p-1.5 text-neutral-500 hover:text-rose-500 active:scale-125 transition-transform"
                title="Gửi tim"
              >
                <Heart className="h-5 w-5 text-foreground fill-foreground" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
