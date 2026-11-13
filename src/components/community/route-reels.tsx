"use client";

import * as React from "react";
import Link from "next/link";
import {
  Film,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Clock,
  Sparkles,
  X,
  Compass,
  Zap,
  Volume2,
  VolumeX,
  Music2,
  Disc3,
  ChevronUp,
  ChevronDown,
  Check,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ROUTE_REELS,
  RouteReel,
  REEL_SOUNDTRACKS,
  ReelSoundtrack,
} from "@/features/community/reels.data";
import { SportIcon } from "@/components/shared/sport-icon";

export function RouteReels() {
  const [reels, setReels] = React.useState<RouteReel[]>(ROUTE_REELS);
  const [activeReelIndex, setActiveReelIndex] = React.useState<number | null>(null);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);

  // Audio Context Ref for Real Web Audio Synthesis
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // New Reel upload form state
  const [uploadTitle, setUploadTitle] = React.useState("");
  const [uploadLocation, setUploadLocation] = React.useState("");
  const [uploadDistance, setUploadDistance] = React.useState("7.5");
  const [uploadCaption, setUploadCaption] = React.useState("");
  const [uploadTime, setUploadTime] = React.useState("05:30 AM");
  const [uploadSuccess, setUploadSuccess] = React.useState(false);

  // Touch gesture state for TikTok-style vertical swipe
  const touchStartY = React.useRef<number | null>(null);
  const touchDeltaY = React.useRef<number>(0);

  const activeReel = activeReelIndex !== null ? reels[activeReelIndex] || null : null;

  // Web Audio Beat Synthesis based on soundtrack tone
  const playSynthesizedBeat = React.useCallback(
    (soundtrack: ReelSoundtrack) => {
      if (typeof window === "undefined" || isMuted) return;

      try {
        if (!audioContextRef.current) {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
          }
        }

        const ctx = audioContextRef.current;
        if (!ctx) return;

        if (ctx.state === "suspended") {
          ctx.resume();
        }

        // Clear previous rhythm interval
        if (audioIntervalRef.current) {
          clearInterval(audioIntervalRef.current);
          audioIntervalRef.current = null;
        }

        const intervalMs = (60 / soundtrack.bpm) * 1000;
        let step = 0;

        const triggerNote = () => {
          if (isMuted || !ctx || ctx.state === "closed") return;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          const now = ctx.currentTime;

          // Sound pattern based on genre
          if (soundtrack.audioToneType === "phonk") {
            // Heavy deep kick & cowbell lead
            if (step % 2 === 0) {
              osc.type = "sine";
              osc.frequency.setValueAtTime(130, now);
              osc.frequency.exponentialRampToValueAtTime(38, now + 0.18);
              gain.gain.setValueAtTime(0.2, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
              osc.start(now);
              osc.stop(now + 0.18);
            } else {
              osc.type = "triangle";
              osc.frequency.setValueAtTime(587.33, now); // D5
              gain.gain.setValueAtTime(0.12, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
              osc.start(now);
              osc.stop(now + 0.12);
            }
          } else if (soundtrack.audioToneType === "edm") {
            // Four-on-the-floor driving kick
            osc.type = "sine";
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.start(now);
            osc.stop(now + 0.14);
          } else if (soundtrack.audioToneType === "lofi" || soundtrack.audioToneType === "chill") {
            // Mellow soft chord ping
            osc.type = "sine";
            const pitches = [261.63, 329.63, 392.0, 523.25]; // C major triad
            const pitch = pitches[step % pitches.length] ?? 261.63;
            osc.frequency.setValueAtTime(pitch, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc.start(now);
            osc.stop(now + 0.45);
          } else {
            // Epic / Indie cadence pulse
            osc.type = "triangle";
            osc.frequency.setValueAtTime(110 + (step % 4) * 30, now);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
          }

          step = (step + 1) % 8;
        };

        // Fire immediately and set loop
        triggerNote();
        audioIntervalRef.current = setInterval(triggerNote, intervalMs);
        setIsPlayingAudio(true);
      } catch (err) {
        console.warn("Web Audio autoplay prevented or not supported:", err);
      }
    },
    [isMuted]
  );

  // Stop Audio
  const stopSynthesizedAudio = React.useCallback(() => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    setIsPlayingAudio(false);
  }, []);

  // Update audio when active reel changes or muted status changes
  React.useEffect(() => {
    if (activeReel && !isMuted) {
      playSynthesizedBeat(activeReel.soundtrack);
    } else {
      stopSynthesizedAudio();
    }

    return () => {
      stopSynthesizedAudio();
    };
  }, [activeReel, isMuted, playSynthesizedBeat, stopSynthesizedAudio]);

  // Navigate to next reel (like swiping up on TikTok)
  const goToNextReel = React.useCallback(() => {
    if (activeReelIndex === null) return;
    setActiveReelIndex((prev) => (prev !== null ? (prev + 1) % reels.length : 0));
  }, [activeReelIndex, reels.length]);

  // Navigate to previous reel (like swiping down on TikTok)
  const goToPrevReel = React.useCallback(() => {
    if (activeReelIndex === null) return;
    setActiveReelIndex((prev) => (prev !== null ? (prev - 1 + reels.length) % reels.length : 0));
  }, [activeReelIndex, reels.length]);

  // Handle keyboard arrow navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeReelIndex === null) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        goToNextReel();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        goToPrevReel();
      } else if (e.key === "Escape") {
        setActiveReelIndex(null);
      } else if (e.key === "m") {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReelIndex, goToNextReel, goToPrevReel]);

  // Wheel scroll with debounce to trigger TikTok reel transition
  const lastScrollTime = React.useRef<number>(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 400) return;

    if (e.deltaY > 35) {
      lastScrollTime.current = now;
      goToNextReel();
    } else if (e.deltaY < -35) {
      lastScrollTime.current = now;
      goToPrevReel();
    }
  };

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
    touchDeltaY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0]?.clientY ?? touchStartY.current;
    touchDeltaY.current = currentY - touchStartY.current;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null) return;
    const threshold = 50; // pixels to trigger vertical reel flip
    if (touchDeltaY.current < -threshold) {
      // Swiped UP -> Next reel
      goToNextReel();
    } else if (touchDeltaY.current > threshold) {
      // Swiped DOWN -> Previous reel
      goToPrevReel();
    }
    touchStartY.current = null;
    touchDeltaY.current = 0;
  };

  const handleToggleLike = (reelId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const hasLiked = !r.hasLiked;
          return {
            ...r,
            hasLiked,
            stats: {
              ...r.stats,
              likes: hasLiked ? r.stats.likes + 1 : r.stats.likes - 1,
            },
          };
        }
        return r;
      })
    );
  };

  // Lồng nhạc / Đổi nhạc cho Reel đang xem
  const handleSelectSoundtrack = (track: ReelSoundtrack) => {
    if (activeReelIndex === null) return;
    setReels((prev) =>
      prev.map((r, idx) => {
        if (idx === activeReelIndex) {
          return {
            ...r,
            soundtrack: track,
          };
        }
        return r;
      })
    );
    setIsMusicModalOpen(false);
    if (!isMuted) {
      playSynthesizedBeat(track);
    }
  };

  const handleUploadReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    const newReel: RouteReel = {
      id: `reel-${Date.now()}`,
      title: uploadTitle,
      caption: uploadCaption || "Cung đường chạy cực đẹp vừa khám phá sáng nay!",
      routeLocation: uploadLocation || "Cung đường ven sông TP.HCM",
      districtVi: "TP. Hồ Chí Minh",
      distanceKm: parseFloat(uploadDistance) || 5.0,
      sport: "running",
      sportNameVi: "Chạy bộ",
      bestTime: uploadTime || "05:30 AM",
      surfaceQuality: "Đường nhựa phẳng, an toàn cho runner",
      mediaUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=900&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500&auto=format&fit=crop&q=80",
      soundtrack: REEL_SOUNDTRACKS[0]!,
      author: {
        name: "Minh Thư (Bạn)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        handle: "@minhthu_sync",
        trustScore: 8.5,
        badgeTitle: "Pacer",
      },
      stats: {
        views: 12,
        likes: 1,
        commentsCount: 0,
        sharesCount: 0,
      },
      hasLiked: false,
    };

    setReels((prev) => [newReel, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadOpen(false);
      setUploadTitle("");
      setUploadCaption("");
    }, 1500);
  };

  return (
    <div className="w-full space-y-2">
      {/* Header bar: Title & Upload Reel Button */}
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          <Film className="h-4 w-4 text-foreground stroke-[2]" />
          <h3 className="text-xs font-black tracking-tight text-foreground uppercase">
            Reels Cung Đường Đẹp
          </h3>
          <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
            (Lướt từ trên xuống như TikTok • Có âm thanh & lồng nhạc)
          </span>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand hover:bg-brand-700 text-white text-[11px] font-bold transition-colors shadow-xs"
        >
          <Plus className="h-3 w-3 stroke-[2.5]" />
          <span>Đăng Reel</span>
        </button>
      </div>

      {/* Horizontal Carousel of Vertical Reel Cards */}
      <div className="w-full overflow-x-auto scrollbar-none px-3">
        <div className="flex items-center gap-2.5 pb-1">
          {reels.map((reel, idx) => (
            <div
              key={reel.id}
              onClick={() => setActiveReelIndex(idx)}
              className="relative shrink-0 w-32 h-52 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-neutral-200 dark:border-neutral-800 transition-transform active:scale-95"
            >
              {/* Thumbnail Image */}
              <img
                src={reel.thumbnailUrl}
                alt={reel.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 pointer-events-none" />

              {/* Top Distance & Sport Badge */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <span className="px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold">
                  {reel.distanceKm} km
                </span>
                <span className="text-white drop-shadow-md">
                  <SportIcon sport={reel.sport === "running" ? "running" : "cycling"} className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* Soundtrack Tag */}
              <div className="absolute top-8 left-2 right-2 flex items-center gap-1 text-[8.5px] text-white/80 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded pointer-events-none">
                <Music2 className="h-2.5 w-2.5 text-white shrink-0" />
                <span className="truncate">{reel.soundtrack.title}</span>
              </div>

              {/* Bottom Content: Author & Title */}
              <div className="absolute bottom-2 left-2 right-2 space-y-1 pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <img
                    src={reel.author.avatar}
                    alt={reel.author.name}
                    loading="lazy"
                    decoding="async"
                    className="w-5 h-5 rounded-full object-cover border border-white/60"
                  />
                  <span className="text-[10px] text-white/90 font-medium truncate drop-shadow-xs">
                    {reel.author.name}
                  </span>
                </div>
                <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight drop-shadow-xs">
                  {reel.title}
                </h4>
                <div className="flex items-center justify-between text-[9px] text-white/75 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Heart
 className={cn(
"h-2.5 w-2.5",
 reel.hasLiked ?"text-white fill-white" :"text-white"
 )}
 />
                    {reel.stats.likes}
                  </span>
                  <span className="font-mono">{reel.stats.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TIKTOK-STYLE IMMERSIVE VERTICAL REEL VIEWER */}
      {/* =================================================================== */}
      {activeReel && activeReelIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Reel Container */}
          <div className="relative w-full h-full sm:max-w-sm sm:h-[660px] bg-black rounded-none sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-neutral-800">
            {/* Background Image / Video Simulation */}
            <img
              src={activeReel.mediaUrl}
              alt={activeReel.title}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-black/60 pointer-events-none" />

            {/* Top Bar: Author, Reel Counter & Controls */}
            <div className="relative z-20 flex items-center justify-between p-3 text-white">
              <div className="flex items-center gap-2">
                <img
                  src={activeReel.author.avatar}
                  alt={activeReel.author.name}
                  decoding="async"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/80"
                />
                <div>
                  <h4 className="text-xs font-bold leading-tight drop-shadow-md">
                    {activeReel.author.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-mono">
                    <span>{activeReel.author.badgeTitle}</span>
                    <span>•</span>
                    <span className="text-brand-300">
                      Reel {activeReelIndex + 1}/{reels.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sound & Close Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className={cn(
                    "p-2 rounded-full backdrop-blur-md transition-all active:scale-90",
                    isMuted
                      ? "bg-red-500/80 text-white"
                      : "bg-emerald-500/80 text-white shadow-lg shadow-emerald-500/30"
                  )}
                  title={isMuted ? "Bật âm thanh (Phím M)" : "Tắt âm thanh (Phím M)"}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4 animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => setActiveReelIndex(null)}
                  className="p-2 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/75 transition-all"
                  title="Đóng (ESC)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Desktop Vertical Navigation Floating Indicators */}
            <div className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 flex-col gap-2">
              <button
                onClick={goToPrevReel}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md transition-all active:scale-90 border border-white/10"
                title="Lướt lên reel trước (Mũi tên lên)"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
              <button
                onClick={goToNextReel}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md transition-all active:scale-90 border border-white/10"
                title="Lướt xuống reel tiếp theo (Mũi tên xuống / Scroll)"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            {/* Right Side Action Column (TikTok Style) */}
            <div className="relative z-20 self-end pr-3 pb-28 flex flex-col items-center gap-4 text-white">
              {/* Like Button */}
              <button
                onClick={(e) => handleToggleLike(activeReel.id, e)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md group-active:scale-125 transition-transform border border-white/10">
                  <Heart
 className={cn(
"h-6 w-6 stroke-[1.8]",
 activeReel.hasLiked ?"text-white fill-white" :"text-white"
 )}
 />
                </div>
                <span className="text-[10px] font-bold drop-shadow-md">
                  {activeReel.stats.likes}
                </span>
              </button>

              {/* Comment Button */}
              <button
                onClick={() => alert(`Bình luận cho cung đường "${activeReel.title}"`)}
                className="flex flex-col items-center gap-1"
              >
                <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                  <MessageCircle className="h-6 w-6 stroke-[1.8]" />
                </div>
                <span className="text-[10px] font-bold drop-shadow-md">
                  {activeReel.stats.commentsCount}
                </span>
              </button>

              {/* Share Button */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: activeReel.title, text: activeReel.caption });
                  } else {
                    alert("Đã sao chép liên kết cung đường để gửi bạn tập!");
                  }
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                  <Share2 className="h-6 w-6 stroke-[1.8]" />
                </div>
                <span className="text-[10px] font-bold drop-shadow-md">
                  {activeReel.stats.sharesCount}
                </span>
              </button>

              {/* Button LỒNG NHẠC / ĐỔI NHẠC */}
              <button
                onClick={() => setIsMusicModalOpen(true)}
                className="flex flex-col items-center gap-1 group"
                title="Lồng nhạc cho Reel"
              >
                <div className="p-2.5 rounded-full bg-brand-600/80 hover:bg-brand-500 text-white backdrop-blur-md border border-brand-400/50 shadow-lg shadow-brand-500/30 group-active:scale-110 transition-transform">
                  <Music2 className="h-5 w-5 stroke-[2.2]" />
                </div>
                <span className="text-[9px] font-black tracking-tight text-brand-300 drop-shadow-md">
                  Lồng Nhạc
                </span>
              </button>

              {/* Spinning Vinyl Disc with Floating Musical Notes */}
              <button
                onClick={() => setIsMusicModalOpen(true)}
                className="relative mt-1 group"
                title="Đang phát: Nhấn để đổi nhạc"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full bg-linear-to-tr from-neutral-900 via-neutral-700 to-neutral-900 border-2 border-neutral-600 flex items-center justify-center shadow-lg",
                    !isMuted && isPlayingAudio && "animate-[spin_4s_linear_infinite]"
                  )}
                >
                  <Disc3 className="h-5 w-5 text-white" />
                </div>
                {!isMuted && isPlayingAudio && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
                  </span>
                )}
              </button>
            </div>

            {/* Bottom Content & Direct Route Action */}
            <div className="relative z-20 p-3 space-y-2 text-white">
              {/* Soundtrack Marquee Banner */}
              <div
                onClick={() => setIsMusicModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-brand-500/30 w-fit max-w-[280px] cursor-pointer hover:bg-black/80 transition-colors"
              >
                <Radio className="h-3 w-3 text-white animate-pulse shrink-0" />
                <span className="text-[10px] font-bold text-brand-200 truncate">
                  ♫ {activeReel.soundtrack.title} • {activeReel.soundtrack.bpm} BPM
                </span>
                <span className="text-[9px] text-brand-400 font-mono underline ml-1">Đổi nhạc</span>
              </div>

              {/* Route & Surface Meta */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-brand text-white text-[10px] font-bold">
                    {activeReel.distanceKm} km
                  </span>
                  <span className="text-[10px] text-white/90 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Đẹp nhất: {activeReel.bestTime}
                  </span>
                </div>

                <h3 className="text-sm font-black drop-shadow-md leading-tight">
                  {activeReel.title}
                </h3>
                <p className="text-xs text-white/90 drop-shadow-xs line-clamp-2">
                  {activeReel.caption}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-white/80">
                  <MapPin className="h-3 w-3 text-white shrink-0" />
                  <span className="truncate">{activeReel.routeLocation}</span>
                </div>
              </div>

              {/* Action Buttons: Lên Kèo Cung Này & Xem Bản Đồ */}
              <div className="flex gap-2 pt-1">
                <Link
                  href="/len-keo"
                  onClick={() => setActiveReelIndex(null)}
                  className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Zap className="h-3.5 w-3.5 stroke-[2.2]" />
                  <span>Lên Kèo Cung Này</span>
                </Link>

                <Link
                  href="/ban-do"
                  onClick={() => setActiveReelIndex(null)}
                  className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white font-bold text-xs text-center flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Bản Đồ</span>
                </Link>
              </div>

              {/* TikTok Swipe Tip */}
              <div className="flex items-center justify-center gap-1 pt-1 text-[9px] text-white/60">
                <ChevronDown className="h-3 w-3 animate-bounce" />
                <span>Vuốt lên hoặc dùng phím mũi tên để xem reel tiếp theo</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL LỒNG NHẠC / CHỌN BÀI HÁT CHO REEL */}
      {/* =================================================================== */}
      {isMusicModalOpen && activeReel && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3.5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Music2 className="h-4 w-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">
                    Lồng Nhạc Cho Reel
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Chọn bài hát & nhịp điệu BPM phù hợp với bài tập
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMusicModalOpen(false)}
                className="text-neutral-500 hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4 stroke-[2]" />
              </button>
            </div>

            {/* List of Soundtracks */}
            <div className="space-y-2">
              {REEL_SOUNDTRACKS.map((track) => {
                const isSelected = activeReel.soundtrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectSoundtrack(track)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all active:scale-98",
                      isSelected
                        ? "bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-950 dark:text-brand-100 shadow-xs"
                        : "bg-neutral-50/70 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                          isSelected
                            ? "bg-brand-600 text-white"
                            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                        )}
                      >
                        <Disc3
                          className={cn(
                            "h-4 w-4",
                            isSelected && "animate-[spin_3s_linear_infinite]"
                          )}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold leading-tight">
                            {track.title}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold">
                            {track.bpm} BPM
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {track.artist} • {track.descriptionVi}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelected ? (
                        <div className="h-6 w-6 rounded-full bg-foreground text-background flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground">
                          Chọn
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setIsMusicModalOpen(false)}
                className="w-full py-2 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-700 transition-colors"
              >
                Xác Nhận & Tiếp Tục Xem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL UPLOAD / SHARE SCENIC ROUTE REEL */}
      {/* =================================================================== */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl bg-card border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-foreground stroke-[2]" />
                <h3 className="text-sm font-black text-foreground">
                  Chia Sẻ Reel Quãng Đường Đẹp
                </h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-neutral-500 hover:text-foreground"
              >
                <X className="h-4 w-4 stroke-[2]" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-6 text-center space-y-2">
                <Sparkles className="h-10 w-10 text-foreground mx-auto animate-bounce stroke-[2]" />
                <h4 className="text-sm font-bold text-foreground">Đã Đăng Reel Cung Đường!</h4>
                <p className="text-xs text-muted-foreground">
                  Cung đường của bạn đã được công khai trên feed để cộng đồng cùng trải nghiệm.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadReel} className="space-y-2.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Tên cung đường / Điểm nhấn</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hoàng hôn Bờ Kè Thanh Đa, Bình minh Sala..."
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-foreground placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Cự ly (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={uploadDistance}
                      onChange={(e) => setUploadDistance(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Khung giờ đẹp nhất</label>
                    <input
                      type="text"
                      placeholder="VD: 05:30 AM"
                      value={uploadTime}
                      onChange={(e) => setUploadTime(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Địa điểm / Lộ trình</label>
                  <input
                    type="text"
                    placeholder="VD: Cổng bến thuyền Landmark 81 dọc bờ sông"
                    value={uploadLocation}
                    onChange={(e) => setUploadLocation(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Cảm nhận / Review mặt đường</label>
                  <textarea
                    rows={2}
                    placeholder="Mặt đường thế nào? Có trạm nước không? Đèn chiếu sáng thế nào?"
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-foreground placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="flex-1 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-foreground font-semibold hover:bg-neutral-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-lg bg-brand text-white font-bold hover:bg-brand-700"
                  >
                    Đăng Ngay
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
