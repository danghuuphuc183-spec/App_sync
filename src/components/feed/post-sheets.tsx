"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, EyeOff, Info, Link2, MessageCircle, Share, UserMinus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedComment, Person } from "@/features/feed/feed.types";
import { formatPostTime } from "@/features/feed/feed.utils";
import { BottomSheet } from "./bottom-sheet";
import { profileHref } from "./post-card";

/* ====================================================================== */
/* Menu 3 chấm: Theo dõi · Lưu · Ẩn người dùng này · Ẩn quảng cáo         */
/* ====================================================================== */
export function PostOptionsSheet({
  open,
  onClose,
  author,
  isAd,
  isFollowing,
  isSaved,
  onToggleFollow,
  onToggleSave,
  onHideAuthor,
  onHideAd,
}: {
  open: boolean;
  onClose: () => void;
  author: Person | null;
  isAd: boolean;
  isFollowing: boolean;
  isSaved: boolean;
  onToggleFollow: () => void;
  onToggleSave: () => void;
  onHideAuthor: () => void;
  onHideAd: () => void;
}) {
  const [showWhy, setShowWhy] = React.useState(false);
  React.useEffect(() => setShowWhy(false), [open]);
  if (!author) return null;

  const run = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} bodyClassName="pb-6">
      <div className="flex items-center gap-3 px-4 pb-3 border-b border-border">
        <img src={author.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-foreground truncate">{author.name}</p>
          <p className="text-[12px] text-muted-foreground">{isAd ? "Quảng cáo · Được tài trợ" : `@${author.handle}`}</p>
        </div>
      </div>
      <ul className="py-1">
        {!author.isMe && (
          <SheetItem
            icon={isFollowing ? <UserMinus /> : <UserPlus />}
            label={isFollowing ? `Bỏ theo dõi ${author.name}` : `Theo dõi ${author.name}`}
            onClick={run(onToggleFollow)}
          />
        )}
        <SheetItem
          icon={<Bookmark className={cn(isSaved && "fill-current")} />}
          label={isSaved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
          onClick={run(onToggleSave)}
        />
        {isAd ? (
          <>
            <SheetItem icon={<EyeOff />} label="Ẩn quảng cáo" description="Bạn sẽ không thấy quảng cáo này nữa" onClick={run(onHideAd)} />
            <SheetItem icon={<Info />} label="Tại sao tôi thấy quảng cáo này?" onClick={() => setShowWhy((v) => !v)} />
            {showWhy && (
              <li className="mx-4 mb-2 rounded-xl bg-muted p-3 text-[12.5px] text-muted-foreground">
                Quảng cáo được hiển thị dựa trên môn thể thao bạn quan tâm (chạy bộ, gym) và khu vực TP.HCM. Chúng tôi không chia sẻ
                vị trí chính xác của bạn với nhà quảng cáo.
              </li>
            )}
          </>
        ) : (
          !author.isMe && (
            <SheetItem
              icon={<EyeOff />}
              label="Ẩn người dùng này"
              description={`Không hiện bài viết của ${author.name} trên bảng tin`}
              danger
              onClick={run(onHideAuthor)}
            />
          )
        )}
      </ul>
    </BottomSheet>
  );
}

function SheetItem({
  icon,
  label,
  description,
  onClick,
  danger,
}: {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  description?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <li>
      <button onClick={onClick} className="w-full flex items-center gap-3.5 px-4 py-3 text-left hover:bg-muted active:bg-muted">
        <span className={cn("h-9 w-9 rounded-full bg-muted flex items-center justify-center", danger && "text-red-600")}>
          {React.cloneElement(icon, { className: cn("h-[18px] w-[18px]", icon.props.className) })}
        </span>
        <span className="min-w-0">
          <span className={cn("block text-[14px] font-semibold", danger ? "text-red-600" : "text-foreground")}>{label}</span>
          {description && <span className="block text-[12px] text-muted-foreground">{description}</span>}
        </span>
      </button>
    </li>
  );
}

/* ====================================================================== */
/* Bình luận                                                               */
/* ====================================================================== */
export function CommentsSheet({
  open,
  onClose,
  comments,
  people,
  me,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  comments: FeedComment[];
  people: Record<string, Person>;
  me: Person;
  onAdd: (text: string) => void;
}) {
  const [text, setText] = React.useState("");
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [comments.length, open]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Bình luận" className="h-[75vh]" bodyClassName="flex-1 flex flex-col min-h-0">
      <ul ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {comments.length === 0 && (
          <li className="text-center py-10">
            <p className="text-[15px] font-bold text-foreground">Chưa có bình luận</p>
            <p className="text-[13px] text-muted-foreground">Hãy là người đầu tiên bình luận.</p>
          </li>
        )}
        {comments.map((c) => {
          const a = people[c.authorId];
          return (
            <li key={c.id} className="flex gap-3">
              {a ? (
                <Link href={profileHref(a)} onClick={onClose} className="shrink-0">
                  <img src={a.avatar} alt={a.name} className="h-9 w-9 rounded-full object-cover" />
                </Link>
              ) : (
                <span className="h-9 w-9 rounded-full bg-muted shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-[12.5px]">
                  <b className="text-foreground">{a?.name ?? "Ẩn danh"}</b>{" "}
                  <span className="text-muted-foreground">{formatPostTime(c.createdAt)}</span>
                </p>
                <p className="text-[13.5px] text-foreground leading-snug">{c.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onAdd(text.trim());
          setText("");
        }}
        className="flex items-center gap-2.5 border-t border-border px-4 py-3"
      >
        <img src={me.avatar} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Thêm bình luận..."
          aria-label="Nội dung bình luận"
          className="flex-1 min-w-0 rounded-lg bg-muted px-4 py-2.5 text-[13.5px] outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button type="submit" disabled={!text.trim()} className="text-[14px] font-bold text-brand dark:text-brand-sky disabled:opacity-40">
          Đăng
        </button>
      </form>
    </BottomSheet>
  );
}

/* ====================================================================== */
/* Chia sẻ                                                                 */
/* ====================================================================== */
export function ShareSheet({
  open,
  onClose,
  url,
  title,
  friends,
  onShared,
  toast,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
  friends: Person[];
  onShared: () => void;
  toast: (msg: string) => void;
}) {
  const [sentTo, setSentTo] = React.useState<string[]>([]);
  React.useEffect(() => setSentTo([]), [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast("Đã sao chép liên kết");
    } catch {
      toast("Không sao chép được liên kết");
    }
    onShared();
    onClose();
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        onShared();
      } catch {
        /* người dùng huỷ */
      }
    } else {
      await copy();
      return;
    }
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Chia sẻ" bodyClassName="pb-6">
      <p className="px-4 pt-3 pb-2 text-[12.5px] font-semibold text-muted-foreground">Gửi cho bạn bè</p>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-3">
        {friends.map((f) => {
          const sent = sentTo.includes(f.id);
          return (
            <div key={f.id} className="flex flex-col items-center gap-1 w-16 shrink-0">
              <img src={f.avatar} alt={f.name} className="h-14 w-14 rounded-full object-cover" />
              <span className="text-[11px] text-foreground truncate w-full text-center">{f.name}</span>
              <button
                onClick={() => {
                  setSentTo((s) => [...s, f.id]);
                  onShared();
                  toast(`Đã gửi cho ${f.name}`);
                }}
                disabled={sent}
                className={cn(
                  "rounded-lg px-2.5 py-0.5 text-[11px] font-bold",
                  sent ? "bg-muted text-muted-foreground" : "bg-brand text-white"
                )}
              >
                {sent ? "Đã gửi" : "Gửi"}
              </button>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 px-4 pt-2 border-t border-border">
        {[
          { icon: <Link2 />, label: "Sao chép liên kết", onClick: copy },
          { icon: <Share />, label: "Chia sẻ qua...", onClick: nativeShare },
          { icon: <MessageCircle />, label: "Mở tin nhắn", href: "/chat" },
        ].map((o) =>
          o.href ? (
            <Link key={o.label} href={o.href} onClick={onClose} className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-muted">
              <span className="h-12 w-12 rounded-full bg-muted flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5">{o.icon}</span>
              <span className="text-[12px] text-foreground">{o.label}</span>
            </Link>
          ) : (
            <button key={o.label} onClick={o.onClick} className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-muted">
              <span className="h-12 w-12 rounded-full bg-muted flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5">{o.icon}</span>
              <span className="text-[12px] text-foreground">{o.label}</span>
            </button>
          )
        )}
      </div>
    </BottomSheet>
  );
}
