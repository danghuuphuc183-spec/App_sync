"use client";

import * as React from "react";
import { PlusCircle, X, Zap, Search, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WeeklyStreakCard } from "@/components/home/weekly-streak-card";
import { SuggestedFollows } from "@/components/home/suggested-follows";
import { HomeFeed } from "@/components/feed/home-feed";
import { INITIAL_FEED } from "@/features/feed/feed.data";
import type { FeedPost } from "@/features/feed/feed.types";
import { SPORT_LABEL } from "@/features/feed/feed.utils";

type NewSport = "running" | "gym" | "pickleball" | "badminton" | "table_tennis" | "football" | "basketball" | "cycling";

const DEFAULT_SPORT_PHOTO: Record<string, string> = {
  running: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&auto=format&fit=crop&q=80",
  gym: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80",
  cycling: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&auto=format&fit=crop&q=80",
};

const STORIES = [
  {
    id: "story-1",
    name: "Bạn",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isAdd: true,
    tag: "Đăng tin",
  },
  {
    id: "story-2",
    name: "Hoàng Nam",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    tag: "Chạy 5h sáng",
    isLive: true,
  },
  {
    id: "story-3",
    name: "Thuỳ Dung",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    tag: "Gym Legday",
  },
  {
    id: "story-4",
    name: "Đức Trọng",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    tag: "Sala 10km",
  },
  {
    id: "story-5",
    name: "Yến Nhi",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    tag: "Ghost Mode",
  },
];

export default function HomePage() {
  const [posts, setPosts] = React.useState<FeedPost[]>(INITIAL_FEED);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState<boolean>(false);

  // Form đăng bài / lên kèo
  const [newCaption, setNewCaption] = React.useState("");
  const [newSport, setNewSport] = React.useState<NewSport>("running");
  const [newLocation, setNewLocation] = React.useState("Khuôn viên Landmark 81");
  const [newTime, setNewTime] = React.useState("05:45 AM • Ngày mai");
  const [newPostImage, setNewPostImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPostImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;
    const newPost: FeedPost = {
      id: `post-created-${Date.now()}`,
      authorId: "me",
      createdAt: new Date().toISOString(),
      caption: newCaption,
      sport: newSport,
      media: [
        {
          type: "photo",
          src: newPostImage ?? DEFAULT_SPORT_PHOTO[newSport] ?? DEFAULT_SPORT_PHOTO.running!,
          alt: `Buổi tập ${SPORT_LABEL[newSport] ?? ""}`,
        },
      ],
      location: { name: newLocation },
      invite: {
        dateTimeVi: newTime,
        locationName: newLocation,
        intensity: newSport === "running" ? "10 km • Pace 6:00" : "75 phút",
        slotsLeft: 1,
      },
      likes: 0,
      shares: 0,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setIsCreateModalOpen(false);
    setNewCaption("");
    setNewPostImage(null);
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-3.5">
      {/* 1. SEARCH & QUICK DISCOVERY BAR */}
      <div className="px-3 pt-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500 stroke-[2]" />
          <input
            type="text"
            placeholder="Tìm bạn tập, địa điểm, giải đấu, môn thể thao..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl pl-9 pr-9 py-2 text-xs text-foreground placeholder:text-neutral-400 focus:outline-hidden focus:ring-1.5 focus:ring-brand shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. STORIES BAR - ATHLETES ACTIVE */}
      <div className="w-full overflow-x-auto no-scrollbar px-3">
        <div className="flex items-center gap-3">
          {STORIES.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
              onClick={() => {
                if (story.isAdd) setIsCreateModalOpen(true);
              }}
            >
              <div
                className={cn(
                  "relative p-[2px] rounded-full transition-transform active:scale-95 group-hover:scale-105",
                  story.isAdd
                    ? "border-2 border-dashed border-brand dark:border-brand-sky"
                    : "ring-2 ring-brand/60 dark:ring-brand-sky"
                )}
              >
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-background"
                />
                {story.isAdd && (
                  <div className="absolute bottom-0 right-0 bg-brand text-white rounded-full p-0.5 border border-background">
                    <PlusCircle className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-foreground tracking-tight max-w-[56px] truncate text-center">
                {story.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CHUỖI LIÊN TIẾP THEO TUẦN (giữ chuỗi kiểu Strava) */}
      <WeeklyStreakCard />

      {/* 4. NÊN THEO DÕI — gợi ý người nổi tiếng & người có điểm chung */}
      <SuggestedFollows />

      {/* 6. BẢNG TIN: bài người dùng · CLB · quảng cáo + Reels */}
      <HomeFeed posts={posts} setPosts={setPosts} searchQuery={searchQuery} onCreatePost={() => setIsCreateModalOpen(true)} />

      {/* 9. MODAL TẠO KÈO HOẶC CHIA SẺ BUỔI TẬP */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl bg-card border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-neutral-900 dark:text-neutral-100 stroke-[1.8]" />
                <h3 className="text-sm font-black text-foreground">Lên Kèo / Chia Sẻ Buổi Tập</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-500 hover:text-foreground"
              >
                <X className="h-4 w-4 stroke-[2]" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Loại hình thể thao</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "running", label: "Chạy bộ" },
                    { id: "gym", label: "Gym" },
                    { id: "pickleball", label: "Pickleball" },
                    { id: "badminton", label: "Cầu lông" },
                    { id: "table_tennis", label: "Bóng bàn" },
                    { id: "football", label: "Bóng đá" },
                    { id: "basketball", label: "Bóng rổ" },
                    { id: "cycling", label: "Đạp xe" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        setNewSport(
                          s.id as
                            | "running"
                            | "gym"
                            | "pickleball"
                            | "badminton"
                            | "table_tennis"
                            | "football"
                            | "basketball"
                            | "cycling"
                        )
                      }
                      className={cn(
                        "py-1.5 rounded-lg border text-[11px] font-bold transition-all text-center",
                        newSport === s.id
                          ? "bg-brand text-white border-brand"
                          : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nội dung / Mục tiêu buổi tập</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ví dụ: Sáng mai 5:30 chạy 10km pace 6:00 quanh Landmark. Cần bạn tập nghiêm túc không bùng kèo!"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Ảnh đính kèm / Chụp trực tiếp từ điện thoại */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground text-[11px]">
                    Hình ảnh buổi tập (Tùy chọn)
                  </label>
                  {newPostImage && (
                    <button
                      type="button"
                      onClick={() => setNewPostImage(null)}
                      className="text-[10px] text-red-500 font-bold hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {newPostImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-border h-32 bg-black/5">
                    <img
                      src={newPostImage}
                      alt="Ảnh tải lên"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewPostImage(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-border/80 bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all active:scale-98"
                  >
                    <Camera className="h-4 w-4 text-foreground" />
                    <span>Chụp ảnh hoặc chọn ảnh từ máy</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Thời gian</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Địa điểm tập trung</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5 text-xs text-foreground"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-lg text-xs h-9"
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold text-xs h-9"
                >
                  Đăng Kèo Mới
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
