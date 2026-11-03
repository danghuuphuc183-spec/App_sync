"use client";

import * as React from "react";
import Link from "next/link";
import {
  MessageCircle,
  Share2,
  Calendar,
  MapPin,
  Shield,
  Plus,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  X,
  Zap,
  VolumeX,
  Search,
  Bell,
  Trophy,
  Users,
  QrCode,
  Droplet,
  Car,
  Lightbulb,
  ThumbsUp,
  Award,
  Bookmark,
  Camera,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/shared/tier-badge";
import { INITIAL_POSTS, WorkoutPost } from "@/features/community/posts.data";
import { cn } from "@/lib/utils";
import { RouteReels } from "@/components/community/route-reels";
import { InstagramChatModal } from "@/components/chat/instagram-chat-modal";

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
  const [posts, setPosts] = React.useState<WorkoutPost[]>(INITIAL_POSTS);
  const [activeFilter, setActiveFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedPostForJoin, setSelectedPostForJoin] = React.useState<WorkoutPost | null>(null);
  const [joinSuccess, setJoinSuccess] = React.useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState<boolean>(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = React.useState<boolean>(false);
  const [congratulatedMilestones, setCongratulatedMilestones] = React.useState<Record<string, boolean>>({});
  const [savedSpots, setSavedSpots] = React.useState<Record<string, boolean>>({});
  const [isChatModalOpen, setIsChatModalOpen] = React.useState(false);
  const [chatPartnerInfo, setChatPartnerInfo] = React.useState<{
    name: string;
    avatar: string;
    sportVi?: string;
    trustScore?: number;
    appointmentPrompt?: {
      title: string;
      dateTimeVi: string;
      locationName: string;
      holdTs: number;
    };
  } | null>(null);

  // New post form state
  const [newCaption, setNewCaption] = React.useState("");
  const [newSport, setNewSport] = React.useState<
    | "running"
    | "gym"
    | "pickleball"
    | "badminton"
    | "table_tennis"
    | "football"
    | "basketball"
    | "cycling"
  >("running");
  const [newLocation, setNewLocation] = React.useState("Khuôn viên Landmark 81");
  const [newTime, setNewTime] = React.useState("05:45 AM • Ngày mai");
  const [newHoldTs, setNewHoldTs] = React.useState("20");
  const [newPostImage, setNewPostImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredPosts = React.useMemo(() => {
    return posts.filter((p) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.caption.toLowerCase().includes(q);
        const matchAuthor = p.author.name.toLowerCase().includes(q);
        const matchSport = p.sportNameVi.toLowerCase().includes(q);
        const matchLocation = p.workoutPlan?.locationName.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchAuthor && !matchSport && !matchLocation) return false;
      }

      // Chip filter
      if (activeFilter === "all") return true;
      if (activeFilter === "my_club") return !!p.author.clubName;
      if (activeFilter === "near_me") return p.workoutPlan?.areaVi.includes("Bình Thạnh") || p.spot?.name.includes("Hoàng Văn Thụ");
      if (activeFilter === "running") return p.sport === "running";
      if (activeFilter === "gym") return p.sport === "gym";
      if (activeFilter === "pickleball") return p.sport === "pickleball" || p.caption.toLowerCase().includes("pickleball");
      if (activeFilter === "badminton") return p.sport === "badminton" || p.caption.toLowerCase().includes("cầu lông");
      if (activeFilter === "cycling") return p.sport === "cycling" || p.caption.toLowerCase().includes("đạp xe");
      if (activeFilter === "upcoming") return p.cardType === "workout";
      return true;
    });
  }, [posts, activeFilter, searchQuery]);

  const handleToggleStrong = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = !p.hasLiked;
          return {
            ...p,
            hasLiked,
            likes: hasLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;

    const newPost: WorkoutPost = {
      id: `post-created-${Date.now()}`,
      cardType: "workout",
      author: {
        name: "Minh Thư (Bạn)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        handle: "@minhthu_sync",
        tier: "gold",
        trustScore: 125,
        badgeTitle: "VĐV Kỷ Luật",
        clubName: "Saigon Runners (SRC)",
      },
      sport: newSport,
      sportNameVi: newSport === "running" ? "Chạy bộ" : newSport === "gym" ? "Gym / Kháng lực" : "Padel",
      timeAgo: "Vừa xong",
      images: newPostImage
        ? [newPostImage]
        : [
            newSport === "running"
              ? "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
          ],
      caption: newCaption,
      tags: ["#KèoMới", "#KhếƯớcTS", "#KhôngBùngKèo"],
      workoutPlan: {
        dateTimeVi: newTime,
        locationName: newLocation,
        areaVi: "Bình Thạnh, TP.HCM",
        intensity: newSport === "running" ? "10 km • Pace 6:00" : "Kháng lực 75 phút",
        holdTs: parseInt(newHoldTs) || 20,
        slotsLeft: 1,
        status: "open",
      },
      likes: 1,
      commentsCount: 0,
      hasLiked: true,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setIsCreateModalOpen(false);
    setNewCaption("");
    setNewPostImage(null);
  };

  const handleJoinWorkout = () => {
    setJoinSuccess(true);
    setTimeout(() => {
      setJoinSuccess(false);
      setSelectedPostForJoin(null);
    }, 2200);
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
            className="w-full bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl pl-9 pr-9 py-2 text-xs text-foreground placeholder:text-neutral-400 focus:outline-hidden focus:ring-1.5 focus:ring-[#1b3554] shadow-2xs transition-all"
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
      <div className="w-full overflow-x-auto scrollbar-none px-3">
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
                    ? "border-2 border-dashed border-[#1b3554] dark:border-[#c0e6fd]"
                    : "ring-2 ring-[#1b3554]/60 dark:ring-[#80aad3]"
                )}
              >
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-background"
                />
                {story.isAdd && (
                  <div className="absolute bottom-0 right-0 bg-[#1b3554] text-white rounded-full p-0.5 border border-background">
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

      {/* 3. QUICK ACTION BAR (4 phím tắt tối giản, icon trắng đen, bo nhẹ) */}
      <div className="px-3">
        <div className="grid grid-cols-4 gap-2 p-1.5 rounded-xl bg-white dark:bg-card border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 hover:bg-[#c0e6fd]/30 transition-colors group"
          >
            <Zap className="h-4 w-4 mb-1 text-neutral-900 dark:text-neutral-100 stroke-[1.8] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">Tạo Kèo</span>
          </button>
          <Link
            href="/cau-lac-bo"
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 hover:bg-[#c0e6fd]/30 transition-colors group"
          >
            <Users className="h-4 w-4 mb-1 text-neutral-900 dark:text-neutral-100 stroke-[1.8] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">Tìm Nhóm</span>
          </Link>
          <button
            onClick={() => setIsCheckInModalOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 hover:bg-[#c0e6fd]/30 transition-colors group"
          >
            <QrCode className="h-4 w-4 mb-1 text-neutral-900 dark:text-neutral-100 stroke-[1.8] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">Check-in</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 hover:bg-[#c0e6fd]/30 transition-colors group"
          >
            <Share2 className="h-4 w-4 mb-1 text-neutral-900 dark:text-neutral-100 stroke-[1.8] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">Chia Sẻ</span>
          </button>
        </div>
      </div>

      {/* 4. REELS CUNG ĐƯỜNG & QUÃNG ĐƯỜNG ĐẸP */}
      <RouteReels />

      {/* 5. PROMO BANNER: GHÉP ĐÔI BẠN TẬP KỶ LUẬT (KHÔNG CÒN TINDER) */}
      <div className="px-3">
        <div className="relative overflow-hidden rounded-xl bg-[#1b3554] dark:bg-[#000f22] border border-[#3f6593]/40 p-3 text-white shadow-xs">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1 max-w-[70%]">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#c0e6fd] text-[#1b3554] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                <Zap className="h-2.5 w-2.5 stroke-[2] fill-current" />
                Ghép Bạn Tập Kỷ Luật
              </span>
              <h3 className="text-xs font-black tracking-tight leading-tight">
                Khám phá & Ghép đôi bạn tập thể thao
              </h3>
              <p className="text-[10px] text-neutral-300 leading-tight">
                Đối chiếu khung năng lực, thói quen & tạo lịch hẹn tập có bảo chứng TS.
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-white text-[#1b3554] hover:bg-neutral-100 font-bold text-[11px] rounded-lg shadow-sm shrink-0 h-7 px-3"
            >
              <Link href="/len-keo">
                Lên Kèo
                <ArrowRight className="ml-1 h-3 w-3 stroke-[2]" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 6. FILTER CHIPS (Tất cả / CLB / Chạy bộ / Gym / Pickleball / Cầu lông / Đạp xe) */}
      <div className="w-full overflow-x-auto scrollbar-none px-3">
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "Tất cả" },
            { id: "my_club", label: "CLB của tôi" },
            { id: "near_me", label: "Gần tôi" },
            { id: "running", label: "🏃 Chạy bộ" },
            { id: "gym", label: "🏋️ Gym" },
            { id: "pickleball", label: "🏓 Pickleball" },
            { id: "badminton", label: "🏸 Cầu lông" },
            { id: "cycling", label: "🚴 Đạp xe" },
            { id: "upcoming", label: "Kèo sắp diễn ra" },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                activeFilter === chip.id
                  ? "bg-[#1b3554] text-white dark:bg-[#c0e6fd] dark:text-[#000f22] border-[#1b3554] shadow-xs"
                  : "bg-white dark:bg-card text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. CONTROLLED ACTIVITY FEED (5 LOẠI CARD CHUẨN, ICON TRẮNG ĐEN) */}
      <div className="flex flex-col space-y-3.5 px-3">
        {filteredPosts.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-card p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
              <Zap className="h-6 w-6 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">Chưa có hoạt động gần bạn</h4>
              <p className="text-xs text-muted-foreground">
                Hãy là người tiên phong tạo kèo tập luyện đầu tiên cho khu vực của bạn!
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-lg text-xs font-bold bg-[#1b3554] hover:bg-[#000f22] text-white"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
              Tạo kèo ngay
            </Button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            /* 6.1. WORKOUT CARD (KÈO MỞ) */
            if (post.cardType === "workout") {
              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-card shadow-xs overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-3 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">{post.author.name}</span>
                          <TierBadge tier={post.author.tier} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="text-[#1b3554] dark:text-[#c0e6fd] font-bold">{post.author.trustScore} TS</span>
                          <span>•</span>
                          <span>{post.timeAgo}</span>
                          {post.author.clubName && (
                            <>
                              <span>•</span>
                              <span className="text-neutral-700 dark:text-neutral-300 font-medium">{post.author.clubName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-[#c0e6fd]/50 text-[#1b3554] dark:bg-[#1b3554] dark:text-[#c0e6fd] border-[#80aad3]/30 text-[10px] font-bold">
                      Kèo Mở
                    </Badge>
                  </div>

                  {/* Image */}
                  {post.images.length > 0 && (
                    <div className="relative w-full aspect-16/9 bg-neutral-100">
                      <img
                        src={post.images[0]}
                        alt="Workout banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <Badge className="bg-[#000f22]/75 backdrop-blur-xs text-white text-[10px] border-none font-semibold">
                          {post.sportNameVi}
                        </Badge>
                        {post.workoutPlan?.isGhostMode && (
                          <Badge className="bg-neutral-900/80 backdrop-blur-xs text-neutral-200 text-[10px] border-none font-semibold flex items-center gap-1">
                            <VolumeX className="w-2.5 h-2.5 stroke-[2]" />
                            Ghost Mode
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Caption & Appointment Details */}
                  <div className="p-3.5 space-y-3">
                    <p className="text-xs text-foreground leading-relaxed font-medium">
                      {post.caption}
                    </p>

                    {/* Workout Details Box */}
                    {post.workoutPlan && (
                      <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900/60 p-2.5 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                          <span className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-bold">
                            <Calendar className="w-3.5 h-3.5 stroke-[1.8] text-neutral-700 dark:text-neutral-300" />
                            {post.workoutPlan.dateTimeVi}
                          </span>
                          <span className="text-[#1b3554] dark:text-[#c0e6fd] font-black">
                            Cọc {post.workoutPlan.holdTs} TS
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0 stroke-[1.8] text-neutral-700 dark:text-neutral-300" />
                          <span className="truncate">{post.workoutPlan.locationName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 dark:border-neutral-800 text-[10px] text-muted-foreground">
                          <span>Mục tiêu: <strong className="text-foreground">{post.workoutPlan.intensity}</strong></span>
                          <span>Còn: <strong className="text-[#1b3554] dark:text-[#c0e6fd] font-bold">{post.workoutPlan.slotsLeft} chỗ</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Actions: Thả Strong, Chat Instagram, Nhận Kèo */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStrong(post.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all active:scale-95",
                            post.hasLiked
                              ? "bg-[#c0e6fd]/60 text-[#1b3554] border-[#80aad3]/60 dark:bg-[#1b3554] dark:text-[#c0e6fd]"
                              : "bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100"
                          )}
                        >
                          <ThumbsUp className="w-3.5 h-3.5 stroke-[1.8]" />
                          <span>{post.likes}</span>
                        </button>
                        <button
                          onClick={() => {
                            setChatPartnerInfo({
                              name: post.author.name,
                              avatar: post.author.avatar,
                              sportVi: post.sportNameVi,
                              trustScore: post.author.trustScore,
                              appointmentPrompt: post.workoutPlan
                                ? {
                                    title: `Kèo ${post.sportNameVi}`,
                                    dateTimeVi: post.workoutPlan.dateTimeVi,
                                    locationName: post.workoutPlan.locationName,
                                    holdTs: post.workoutPlan.holdTs,
                                  }
                                : undefined,
                            });
                            setIsChatModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1 text-xs font-medium"
                          title="Mở chat Instagram"
                        >
                          <MessageCircle className="w-3.5 h-3.5 stroke-[1.8]" />
                          <span>{post.commentsCount}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setChatPartnerInfo({
                              name: post.author.name,
                              avatar: post.author.avatar,
                              sportVi: post.sportNameVi,
                              trustScore: post.author.trustScore,
                              appointmentPrompt: post.workoutPlan
                                ? {
                                    title: `Kèo ${post.sportNameVi}`,
                                    dateTimeVi: post.workoutPlan.dateTimeVi,
                                    locationName: post.workoutPlan.locationName,
                                    holdTs: post.workoutPlan.holdTs,
                                  }
                                : undefined,
                            });
                            setIsChatModalOpen(true);
                          }}
                          className="h-8 px-2.5 rounded-lg border border-[#1b3554]/30 dark:border-[#c0e6fd]/30 text-[#1b3554] dark:text-[#c0e6fd] hover:bg-[#c0e6fd]/20 flex items-center gap-1 text-xs font-bold transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5 stroke-[2]" />
                          <span>Chat</span>
                        </button>
                        <Button
                          size="sm"
                          onClick={() => setSelectedPostForJoin(post)}
                          className="bg-[#1b3554] hover:bg-[#000f22] text-white dark:bg-[#c0e6fd] dark:text-[#000f22] font-bold text-xs rounded-lg h-8 px-3 shadow-xs"
                        >
                          <Zap className="mr-1 h-3 w-3 stroke-[2]" />
                          Nhận Kèo
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }

            /* 6.2. ACTIVITY POST (HEVY / STRAVA STYLE VERIFIED LOG) */
            if (post.cardType === "activity") {
              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-card shadow-xs overflow-hidden flex flex-col"
                >
                  <div className="p-3 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">{post.author.name}</span>
                          <TierBadge tier={post.author.tier} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="text-[#1b3554] dark:text-[#c0e6fd] font-bold">{post.author.trustScore} TS</span>
                          <span>•</span>
                          <span>{post.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-[#c0e6fd]/50 text-[#1b3554] dark:bg-[#1b3554] dark:text-[#c0e6fd] border-[#80aad3]/30 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 stroke-[2]" />
                      {post.stats?.verifiedSource || "Strava"} Verified
                    </Badge>
                  </div>

                  {post.images.length > 0 && (
                    <div className="relative w-full aspect-16/9 bg-neutral-100">
                      <img
                        src={post.images[0]}
                        alt="Activity post"
                        className="w-full h-full object-cover"
                      />
                      {post.stats && (
                        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-[#000f22]/85 backdrop-blur-md p-2 text-white flex items-center justify-around text-center text-xs">
                          {post.stats.distance && (
                            <div>
                              <div className="text-[10px] text-neutral-300">Cự ly</div>
                              <div className="font-black text-white">{post.stats.distance}</div>
                            </div>
                          )}
                          {post.stats.pace && (
                            <div>
                              <div className="text-[10px] text-neutral-300">Pace</div>
                              <div className="font-black text-[#c0e6fd]">{post.stats.pace}</div>
                            </div>
                          )}
                          {post.stats.duration && (
                            <div>
                              <div className="text-[10px] text-neutral-300">Thời gian</div>
                              <div className="font-black text-white">{post.stats.duration}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3.5 space-y-2.5">
                    <p className="text-xs text-foreground leading-relaxed">{post.caption}</p>
                    {post.stats?.partnerName && (
                      <div className="text-[11px] text-neutral-800 dark:text-neutral-200 font-semibold bg-neutral-100 dark:bg-neutral-800 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 stroke-[1.8]" />
                        Đồng hành: {post.stats.partnerName}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={() => handleToggleStrong(post.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all active:scale-95",
                          post.hasLiked
                            ? "bg-[#c0e6fd]/60 text-[#1b3554] border-[#80aad3]/60 dark:bg-[#1b3554] dark:text-[#c0e6fd]"
                            : "bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100"
                        )}
                      >
                        <ThumbsUp className="w-3.5 h-3.5 stroke-[1.8]" />
                        <span>{post.likes} Strong</span>
                      </button>
                      <button
                        onClick={() => {
                          setChatPartnerInfo({
                            name: post.author.name,
                            avatar: post.author.avatar,
                            sportVi: post.sportNameVi,
                            trustScore: post.author.trustScore,
                          });
                          setIsChatModalOpen(true);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 stroke-[1.8]" />
                        {post.commentsCount} bình luận
                      </button>
                    </div>
                  </div>
                </article>
              );
            }

            /* 6.3. CLUB CHALLENGE CARD */
            if (post.cardType === "challenge") {
              const ch = post.challenge;
              const percent = ch ? Math.min(100, Math.round((ch.currentKm / ch.targetKm) * 100)) : 0;
              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-card p-3.5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                        <Trophy className="h-4 w-4 stroke-[1.8]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{post.author.name}</div>
                        <div className="text-[10px] text-neutral-500 font-semibold">Thử Thách CLB</div>
                      </div>
                    </div>
                    <Badge className="bg-[#1b3554] text-white text-[10px] rounded-md">Còn {ch?.daysLeft} ngày</Badge>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-foreground">{ch?.targetTitle}</h4>
                    <p className="text-[11px] text-muted-foreground">{post.caption}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-[#1b3554] dark:text-[#c0e6fd]">{ch?.currentKm} km</span>
                      <span className="text-muted-foreground">Mục tiêu: {ch?.targetKm} km ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-[#1b3554] dark:bg-[#c0e6fd] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3 stroke-[1.8]" />
                      {ch?.participantsCount} thành viên đã chạy
                    </span>
                    <Button
                      asChild
                      size="sm"
                      className="bg-[#1b3554] hover:bg-[#000f22] text-white rounded-lg text-xs h-7 px-3.5 font-semibold"
                    >
                      <Link href="/cau-lac-bo">Tham Gia</Link>
                    </Button>
                  </div>
                </article>
              );
            }

            /* 6.4. MILESTONE CARD */
            if (post.cardType === "milestone") {
              const ms = post.milestone;
              const hasCongratulated = congratulatedMilestones[post.id];
              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-card p-3.5 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                        <Award className="h-4 w-4 stroke-[1.8]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Huy Hiệu Kỷ Luật Mới</div>
                        <div className="text-[10px] text-[#1b3554] dark:text-[#c0e6fd] font-bold">{ms?.badgeUnlocked}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold rounded-md">
                      +10 TS Thưởng
                    </Badge>
                  </div>

                  <p className="text-xs text-foreground leading-relaxed">{post.caption}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() =>
                        setCongratulatedMilestones((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }))
                      }
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all active:scale-95",
                        hasCongratulated
                          ? "bg-[#c0e6fd]/60 text-[#1b3554] border-[#80aad3]/60 dark:bg-[#1b3554] dark:text-[#c0e6fd]"
                          : "bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100"
                      )}
                    >
                      <ThumbsUp className="w-3.5 h-3.5 stroke-[1.8]" />
                      <span>{hasCongratulated ? "Đã chúc mừng" : "Chúc mừng"}</span>
                    </button>
                    <Link
                      href="/ho-so"
                      className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
                    >
                      Xem hồ sơ đối tác →
                    </Link>
                  </div>
                </article>
              );
            }

            /* 6.5. SPOT RECOMMENDATION CARD */
            if (post.cardType === "spot") {
              const sp = post.spot;
              const isSaved = savedSpots[post.id];
              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-card p-3.5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                        <MapPin className="h-4 w-4 stroke-[1.8]" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-foreground">{sp?.name}</div>
                        <div className="text-[10px] text-neutral-500 font-bold">⭐ {sp?.rating} ({sp?.reviewCount} đánh giá)</div>
                      </div>
                    </div>
                    <Badge className="bg-[#c0e6fd]/50 text-[#1b3554] border-[#80aad3]/40 text-[10px] rounded-md">
                      Gợi Ý An Toàn
                    </Badge>
                  </div>

                  <p className="text-xs text-foreground leading-relaxed">{post.caption}</p>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-900 p-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      <Lightbulb className="w-3 h-3 text-neutral-700 dark:text-neutral-300 stroke-[1.8] shrink-0" />
                      <span>Đủ sáng lúc 5h sáng</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-900 p-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      <Droplet className="w-3 h-3 text-neutral-700 dark:text-neutral-300 stroke-[1.8] shrink-0" />
                      <span>Có vòi nước công cộng</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-900 p-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      <Car className="w-3 h-3 text-neutral-700 dark:text-neutral-300 stroke-[1.8] shrink-0" />
                      <span>Bãi giữ xe từ 05:00</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-900 p-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      <Users className="w-3 h-3 text-neutral-700 dark:text-neutral-300 stroke-[1.8] shrink-0" />
                      <span>Đông runner sáng sớm</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() =>
                        setSavedSpots((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }))
                      }
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all",
                        isSaved
                          ? "bg-[#c0e6fd]/60 text-[#1b3554] border-[#80aad3]/60 dark:bg-[#1b3554] dark:text-[#c0e6fd]"
                          : "bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100"
                      )}
                    >
                      <Bookmark className="w-3.5 h-3.5 stroke-[1.8]" />
                      <span>{isSaved ? "Đã lưu" : "Lưu địa điểm"}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/ban-do"
                        className="text-[11px] text-[#1b3554] dark:text-[#c0e6fd] font-bold flex items-center gap-0.5 hover:underline"
                      >
                        Chỉ đường trên Bản đồ →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            }

            return null;
          })
        )}
      </div>

      {/* 7. MODAL NHẬN KÈO & CỌC TRUST SCORE */}
      {selectedPostForJoin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl bg-card border border-neutral-200 dark:border-neutral-800 p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-neutral-900 dark:text-neutral-100 stroke-[1.8]" />
                <h3 className="text-sm font-black text-foreground">Xác Nhận Khế Ước Bắt Kèo</h3>
              </div>
              <button
                onClick={() => setSelectedPostForJoin(null)}
                className="text-neutral-500 hover:text-foreground"
              >
                <X className="h-4 w-4 stroke-[2]" />
              </button>
            </div>

            {joinSuccess ? (
              <div className="py-5 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 stroke-[2.2] mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-foreground">Bắt Kèo Thành Công!</h4>
                  <p className="text-xs text-muted-foreground px-2">
                    Đã khóa tạm thời {selectedPostForJoin.workoutPlan?.holdTs} TS vào khế ước bảo chứng kỷ luật.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left text-xs space-y-1">
                  <div><strong>Bạn tập:</strong> {selectedPostForJoin.author.name}</div>
                  <div><strong>Thời gian:</strong> {selectedPostForJoin.workoutPlan?.dateTimeVi}</div>
                  <div><strong>Địa điểm:</strong> {selectedPostForJoin.workoutPlan?.locationName}</div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setJoinSuccess(false);
                      setSelectedPostForJoin(null);
                    }}
                    className="flex-1 rounded-lg text-xs h-9"
                  >
                    Đóng
                  </Button>
                  <Button
                    onClick={() => {
                      const partner = selectedPostForJoin;
                      setJoinSuccess(false);
                      setSelectedPostForJoin(null);
                      setChatPartnerInfo({
                        name: partner.author.name,
                        avatar: partner.author.avatar,
                        sportVi: partner.sportNameVi,
                        trustScore: partner.author.trustScore,
                        appointmentPrompt: partner.workoutPlan
                          ? {
                              title: `Kèo ${partner.sportNameVi}`,
                              dateTimeVi: partner.workoutPlan.dateTimeVi,
                              locationName: partner.workoutPlan.locationName,
                              holdTs: partner.workoutPlan.holdTs,
                            }
                          : undefined,
                      });
                      setIsChatModalOpen(true);
                    }}
                    className="flex-1 rounded-lg bg-[#1b3554] hover:bg-[#000f22] text-white font-bold text-xs h-9 flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Mở Chat Instagram</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 space-y-1.5">
                  <div className="font-bold text-foreground">{selectedPostForJoin.author.name}</div>
                  <div className="text-muted-foreground">{selectedPostForJoin.workoutPlan?.dateTimeVi}</div>
                  <div className="text-muted-foreground truncate">{selectedPostForJoin.workoutPlan?.locationName}</div>
                  <div className="text-[#1b3554] dark:text-[#c0e6fd] font-bold">{selectedPostForJoin.workoutPlan?.intensity}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#c0e6fd]/30 dark:bg-[#1b3554]/30 border border-[#80aad3]/40 space-y-1 text-neutral-900 dark:text-neutral-100">
                  <div className="font-bold flex items-center gap-1.5 text-[#1b3554] dark:text-[#c0e6fd]">
                    <Shield className="h-3.5 w-3.5 stroke-[2]" />
                    <span>Cam kết bảo chứng kỷ luật:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-muted-foreground">
                    <li>Khóa tạm giữ <strong>{selectedPostForJoin.workoutPlan?.holdTs} TS</strong> từ ví của bạn.</li>
                    <li>Có mặt check-in đúng giờ: hoàn cọc + cộng <strong>+2 TS</strong>.</li>
                    <li>Bùng kèo không báo trước: phạt <strong>-30 TS</strong>.</li>
                  </ul>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPostForJoin(null)}
                    className="flex-1 rounded-lg text-xs h-9"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleJoinWorkout}
                    className="flex-1 rounded-lg bg-[#1b3554] hover:bg-[#000f22] dark:bg-[#c0e6fd] dark:text-[#000f22] text-white font-bold text-xs h-9"
                  >
                    Ký Khế Ước ({selectedPostForJoin.workoutPlan?.holdTs} TS)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. MODAL CHECK-IN NHANH */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl bg-card border border-neutral-200 dark:border-neutral-800 p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-neutral-900 dark:text-neutral-100 stroke-[1.8]" />
                <h3 className="text-sm font-black text-foreground">Điểm Danh Buổi Tập (Check-in)</h3>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="text-neutral-500 hover:text-foreground"
              >
                <X className="h-4 w-4 stroke-[2]" />
              </button>
            </div>

            <div className="text-center py-4 space-y-2">
              <div className="mx-auto w-40 h-40 bg-white p-2.5 rounded-lg shadow-inner flex items-center justify-center border-2 border-[#1b3554]">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SYNC-SPORT-CHECKIN-2026"
                  alt="Mã QR Check-in"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs font-bold text-foreground">Quét mã QR 2 chiều cùng bạn tập</p>
              <p className="text-[11px] text-muted-foreground px-4">
                Khi cả hai quét mã thành công tại tọa độ GPS buổi tập, khế ước sẽ hoàn tất và tự động cộng +2 TS vào ví!
              </p>
            </div>

            <Button
              onClick={() => setIsCheckInModalOpen(false)}
              className="w-full rounded-lg text-xs font-bold bg-[#1b3554] hover:bg-[#000f22] text-white"
            >
              Đóng
            </Button>
          </div>
        </div>
      )}

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
                          ? "bg-[#1b3554] text-white border-[#1b3554]"
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
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#1b3554]"
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
                    <Camera className="h-4 w-4 text-[#1b3554] dark:text-[#80aad3]" />
                    <span>Chụp ảnh hoặc chọn ảnh từ máy</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Thời gian</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5 text-xs text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Mức cọc TS</label>
                  <select
                    value={newHoldTs}
                    onChange={(e) => setNewHoldTs(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5 text-xs text-foreground"
                  >
                    <option value="15">15 TS (Tối thiểu)</option>
                    <option value="20">20 TS (Khuyên dùng)</option>
                    <option value="30">30 TS (Cam kết cao)</option>
                  </select>
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
                  className="flex-1 rounded-lg bg-[#1b3554] hover:bg-[#000f22] text-white font-bold text-xs h-9"
                >
                  Đăng Kèo Mới
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. INSTAGRAM DIRECT CHAT MODAL */}
      <InstagramChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        partnerInfo={chatPartnerInfo || undefined}
      />
    </div>
  );
}
