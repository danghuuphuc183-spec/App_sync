"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Camera,
  MapPin,
  Bell,
  ShieldCheck,
  Flame,
  Award,
  Zap,
  Activity,
  Heart,
  Footprints,
  Compass,
  Watch,
  X,
  Sparkles,
  ChevronRight,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

// 1. MỤC ĐÍCH SỬ DỤNG (Chuẩn 100% từ video Strava của người dùng)
const USAGE_PURPOSES = [
  { id: "habit", label: "Xây dựng thói quen tập luyện" },
  { id: "event", label: "Tập luyện cho một sự kiện hoặc mục tiêu cá nhân" },
  { id: "compete", label: "Cạnh tranh với người khác" },
  { id: "social", label: "Kết nối với những người năng động khác" },
  { id: "health", label: "Duy trì sức khỏe" },
  { id: "explore", label: "Khám phá những địa điểm mới" },
];

// 2. BỘ MÔN THỂ THAO
const SPORTS_OPTIONS = [
  { id: "running", label: "Chạy bộ", icon: "🏃" },
  { id: "cycling", label: "Đạp xe", icon: "🚴" },
  { id: "gym", label: "Gym & Kháng lực", icon: "💪" },
  { id: "pickleball", label: "Pickleball", icon: "🎾" },
  { id: "badminton", label: "Cầu lông", icon: "🏸" },
  { id: "swimming", label: "Bơi lội", icon: "🏊" },
  { id: "tennis", label: "Quần vợt / Tennis", icon: "🎾" },
  { id: "yoga", label: "Yoga & Dẻo dai", icon: "🧘" },
];

// 3. PACE & TRÌNH ĐỘ
const PACE_OPTIONS = [
  { id: "sub5", pace: "Dưới 5:00 /km", desc: "Nâng cao • Tốc độ cao" },
  { id: "pace5_6", pace: "5:00 - 5:45 /km", desc: "Chuyên cần • Bền bỉ" },
  { id: "pace6_7", pace: "5:45 - 6:30 /km", desc: "Phong trào phổ biến" },
  { id: "easy", pace: "Trên 6:30 /km", desc: "Chạy thư giãn • Tân binh" },
];

// 4. DANH SÁCH 16 THIẾT BỊ ĐEO (Chuẩn 100% từ Frame 2 trong Video)
const FITNESS_DEVICES = [
  { id: "amazfit", name: "amazfit" },
  { id: "apple_watch", name: " WATCH" },
  { id: "coros", name: "COROS" },
  { id: "google_health", name: "Google Health" },
  { id: "garmin", name: "GARMIN." },
  { id: "huawei", name: "HUAWEI" },
  { id: "nike", name: "Nike" },
  { id: "oura", name: "ŌURA" },
  { id: "peloton", name: "PELOTON" },
  { id: "polar", name: "POLAR." },
  { id: "remaker", name: "REMAKER" },
  { id: "samsung", name: "SAMSUNG" },
  { id: "suunto", name: "SUUNTO" },
  { id: "wahoo", name: "wahoo" },
  { id: "whoop", name: "WHOOP" },
  { id: "zwift", name: "ZWIFT" },
];

export default function OnboardingSurveyPage() {
  const router = useRouter();
  const { user, updateSurvey, updatePermissions, toggleAppConnection } = useAuth();

  const [step, setStep] = React.useState<number>(1);
  const totalSteps = 5;

  // Step 1: Mục đích sử dụng (Strava exact match)
  const [selectedPurposes, setSelectedPurposes] = React.useState<string[]>([
    "habit",
    "social",
  ]);

  // Step 2: Môn thể thao & Pace
  const [selectedSports, setSelectedSports] = React.useState<string[]>(["running"]);
  const [selectedPace, setSelectedPace] = React.useState<string>("pace5_6");
  const [preferredTime, setPreferredTime] = React.useState<string>("Sáng sớm (05:30 - 06:45)");

  // Step 3: Quyền thiết bị
  const [cameraGranted, setCameraGranted] = React.useState(false);
  const [gpsGranted, setGpsGranted] = React.useState(false);
  const [notifGranted, setNotifGranted] = React.useState(false);
  const [privacyZone, setPrivacyZone] = React.useState(true);

  // Step 4: Thiết bị & Ứng dụng đã kết nối
  const [connectedStrava, setConnectedStrava] = React.useState(user?.connectedApps?.strava ?? true);
  const [connectedAppleHealth, setConnectedAppleHealth] = React.useState(user?.connectedApps?.appleHealth ?? true);
  const [connectedGarmin, setConnectedGarmin] = React.useState(user?.connectedApps?.garmin ?? false);
  const [selectedDevices, setSelectedDevices] = React.useState<string[]>(["apple_watch", "garmin"]);

  // Apple Health iOS Permission Modal
  const [isHealthModalOpen, setIsHealthModalOpen] = React.useState(false);
  const [healthPermissions, setHealthPermissions] = React.useState({
    workouts: true,
    steps: true,
    routes: true,
    activeEnergy: true,
    heartRate: true,
    cyclingDistance: true,
    walkingRunningDistance: true,
  });

  // Strava Success Connection Modal
  const [isStravaSuccessOpen, setIsStravaSuccessOpen] = React.useState(false);

  // Toggle purpose
  const togglePurpose = (id: string) => {
    setSelectedPurposes((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id]
    );
  };

  // Toggle sport
  const toggleSport = (id: string) => {
    setSelectedSports((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((s) => s !== id) : prev) : [...prev, id]
    );
  };

  // Toggle device
  const toggleDevice = (id: string) => {
    setSelectedDevices((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
    if (id === "apple_watch" && !connectedAppleHealth) {
      setIsHealthModalOpen(true);
    }
  };

  // Request permissions with REAL browser hardware API call
  const handleRequestPermission = async (type: "camera" | "gps" | "notif") => {
    if (type === "camera") {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.warn("Camera hardware access info:", err);
      }
      setCameraGranted(true);
      updatePermissions({ camera: true });
    } else if (type === "gps") {
      try {
        if (typeof navigator !== "undefined" && "geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              console.log("GPS Location acquired:", pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
              console.warn("GPS hardware access info:", err.message);
            },
            { enableHighAccuracy: true, timeout: 6000 }
          );
        }
      } catch (err) {
        console.warn("GPS API info:", err);
      }
      setGpsGranted(true);
      updatePermissions({ gps: true });
    } else if (type === "notif") {
      try {
        if (typeof window !== "undefined" && "Notification" in window) {
          await Notification.requestPermission();
        }
      } catch (err) {
        console.warn("Notification permission info:", err);
      }
      setNotifGranted(true);
      updatePermissions({ notifications: true });
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinish = () => {
    updateSurvey({
      preferredSports: selectedSports,
      runningPace: PACE_OPTIONS.find((p) => p.id === selectedPace)?.pace || "5:00 - 5:45 /km",
      preferredTime,
      privacyZoneEnabled: privacyZone,
      fitnessGoal: USAGE_PURPOSES.find((u) => u.id === selectedPurposes[0])?.label || "Xây dựng thói quen tập luyện",
    });
    router.push("/");
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col min-h-[92vh] py-3 px-3">
      {/* TOP NAVIGATION & PROGRESS */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 rounded-full hover:bg-muted text-foreground transition-all active:scale-95"
              aria-label="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <div className="w-7 h-7" />
          )}
          <span className="text-xs font-bold text-foreground">
            Bước {step} / {totalSteps}
          </span>
        </div>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-xs text-muted-foreground hover:text-foreground font-medium"
        >
          Để sau
        </button>
      </div>

      <div className="py-1">
        <Progress value={(step / totalSteps) * 100} className="h-1 bg-muted" />
      </div>

      {/* STEP CONTENTS */}
      <div className="flex-1 py-4">
        {/* =================================================================== */}
        {/* BƯỚC 1: MỤC ĐÍCH SỬ DỤNG (GIỐNG HỆT FRAME 0 TRONG VIDEO STRAVA) */}
        {/* =================================================================== */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight leading-tight">
                Bạn dự định sử dụng SYNC SPORT cho mục đích gì?
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Chọn tất cả những mục phù hợp.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {USAGE_PURPOSES.map((purpose) => {
                const isSelected = selectedPurposes.includes(purpose.id);
                return (
                  <button
                    key={purpose.id}
                    type="button"
                    onClick={() => togglePurpose(purpose.id)}
                    className={cn(
                      "w-full p-3.5 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between select-none active:scale-[0.99]",
                      isSelected
                        ? "bg-[#1b3554] text-white shadow-xs"
                        : "bg-muted/50 hover:bg-muted text-foreground border border-border/70"
                    )}
                  >
                    <span className="leading-relaxed">{purpose.label}</span>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-2">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* BƯỚC 2: BỘ MÔN SỞ TRƯỜNG & PACE NĂNG LỰC */}
        {/* =================================================================== */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight leading-tight">
                Môn thể thao và nhịp độ tập luyện
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Giúp thuật toán gợi ý bạn tập cùng dải tốc độ và khung giờ.
              </p>
            </div>

            {/* Sports Grid */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-foreground block">
                Môn thể thao bạn quan tâm:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SPORTS_OPTIONS.map((sport) => {
                  const isSelected = selectedSports.includes(sport.id);
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => toggleSport(sport.id)}
                      className={cn(
                        "p-3 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition-all select-none active:scale-98",
                        isSelected
                          ? "border-[#1b3554] bg-[#1b3554]/10 text-foreground ring-1 ring-[#1b3554]"
                          : "border-border/80 bg-card hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <span className="text-xl">{sport.icon}</span>
                      <span className="truncate">{sport.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pace Range */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-foreground block">
                Tốc độ chạy bộ hoặc nhịp độ thoải mái nhất:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PACE_OPTIONS.map((p) => {
                  const isSelected = selectedPace === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPace(p.id)}
                      className={cn(
                        "p-3 rounded-2xl border text-left text-xs transition-all select-none active:scale-98",
                        isSelected
                          ? "border-[#1b3554] bg-[#1b3554]/10 text-foreground font-bold ring-1 ring-[#1b3554]"
                          : "border-border/80 bg-card text-muted-foreground"
                      )}
                    >
                      <div className="font-bold text-foreground">{p.pace}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Golden hour */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-foreground block">
                Khung giờ vàng ưa thích:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {["Sáng sớm (05:30 - 06:45)", "Chiều tan sở (17:30 - 19:00)", "Buổi tối (19:30 - 21:00)", "Cuối tuần linh hoạt"].map(
                  (t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPreferredTime(t)}
                      className={cn(
                        "p-2.5 rounded-xl border text-left text-[11px] transition-all select-none",
                        preferredTime === t
                          ? "border-[#1b3554] bg-[#1b3554]/10 text-foreground font-bold"
                          : "border-border/80 bg-card text-muted-foreground"
                      )}
                    >
                      {t}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* BƯỚC 3: QUYỀN CAMERA, GPS & VÙNG ĐỆM BẢO MẬT (PRIVACY ZONE) */}
        {/* =================================================================== */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight leading-tight">
                Quyền thiết bị và vị trí
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Kích hoạt các tính năng điểm danh và tìm bạn tập gần bạn.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Camera */}
              <div className="p-3.5 rounded-2xl border border-border/80 bg-card flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Máy ảnh (Camera)</h4>
                    <p className="text-[10.5px] text-muted-foreground mt-0.5">
                      Quét mã QR điểm hẹn và chụp ảnh xác nhận buổi tập.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={cameraGranted ? "outline" : "default"}
                  onClick={() => handleRequestPermission("camera")}
                  className={cn(
                    "h-8 px-3 rounded-xl text-xs font-bold shrink-0",
                    cameraGranted
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : "bg-[#1b3554] text-white"
                  )}
                >
                  {cameraGranted ? <Check className="h-3.5 w-3.5" /> : "Cho phép"}
                </Button>
              </div>

              {/* GPS */}
              <div className="p-3.5 rounded-2xl border border-border/80 bg-card flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Vị trí GPS</h4>
                    <p className="text-[10.5px] text-muted-foreground mt-0.5">
                      Gợi ý bạn tập và các cung đường chạy trong bán kính 3-10km.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={gpsGranted ? "outline" : "default"}
                  onClick={() => handleRequestPermission("gps")}
                  className={cn(
                    "h-8 px-3 rounded-xl text-xs font-bold shrink-0",
                    gpsGranted
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : "bg-[#1b3554] text-white"
                  )}
                >
                  {gpsGranted ? <Check className="h-3.5 w-3.5" /> : "Cho phép"}
                </Button>
              </div>

              {/* Push Notifications */}
              <div className="p-3.5 rounded-2xl border border-border/80 bg-card flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Thông báo đẩy</h4>
                    <p className="text-[10.5px] text-muted-foreground mt-0.5">
                      Nhắc lịch hẹn trước 30 phút và thông báo khi đối tác đã đến sân.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={notifGranted ? "outline" : "default"}
                  onClick={() => handleRequestPermission("notif")}
                  className={cn(
                    "h-8 px-3 rounded-xl text-xs font-bold shrink-0",
                    notifGranted
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : "bg-[#1b3554] text-white"
                  )}
                >
                  {notifGranted ? <Check className="h-3.5 w-3.5" /> : "Cho phép"}
                </Button>
              </div>

              {/* Privacy Zone (Strava standard buffer) */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Vùng đệm an toàn (Ẩn nhà riêng 200m)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={privacyZone}
                    onChange={(e) => setPrivacyZone(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#1b3554] cursor-pointer"
                  />
                </div>
                <p className="text-[10.5px] text-muted-foreground leading-relaxed">
                  Tự động làm mờ điểm bắt đầu và kết thúc quanh địa chỉ nhà riêng hoặc nơi làm việc theo chuẩn bảo mật Strava.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* BƯỚC 4: KẾT NỐI THIẾT BỊ VÀ ỨNG DỤNG (CHUẨN 100% TỪ VIDEO CỦA BẠN) */}
        {/* =================================================================== */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight leading-tight">
                Kết nối thiết bị và ứng dụng
              </h1>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                SYNC SPORT tương thích với hầu hết mọi thiết bị và ứng dụng thể dục. Tải hoạt động lên thật liền mạch – cùng với cái nhìn toàn diện hơn về hiệu suất và quá trình phục hồi của bạn.
              </p>
            </div>

            {/* PHẦN ỨNG DỤNG THỂ DỤC (STRAVA & APPLE HEALTH) */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wider">
                <span>Ứng dụng thể chất</span>
                <span className="text-[9px] font-bold bg-amber-500/15 text-amber-600 px-1.5 py-0.5 rounded-md">
                  Mới
                </span>
              </div>

              {/* Strava Integration Card */}
              <div className="p-3 rounded-2xl border border-border/80 bg-card flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FC4C02] text-white flex items-center justify-center shrink-0">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.92 15.602h4.172" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Strava</h4>
                    <p className="text-[10px] text-muted-foreground">Đồng bộ lộ trình GPS, nhịp tim và Pace</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={connectedStrava ? "outline" : "default"}
                  onClick={() => {
                    if (!connectedStrava) {
                      setConnectedStrava(true);
                      toggleAppConnection("strava", true);
                      setIsStravaSuccessOpen(true);
                    } else {
                      setConnectedStrava(false);
                      toggleAppConnection("strava", false);
                    }
                  }}
                  className={cn(
                    "h-8 px-3 rounded-xl text-xs font-bold shrink-0",
                    connectedStrava
                      ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
                      : "bg-[#FC4C02] hover:bg-[#e04300] text-white"
                  )}
                >
                  {connectedStrava ? "Đã kết nối" : "Kết nối"}
                </Button>
              </div>

              {/* Apple Health Integration Card */}
              <div className="p-3 rounded-2xl border border-border/80 bg-card flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Heart className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Apple Health</h4>
                    <p className="text-[10px] text-muted-foreground">Đồng bộ Calo, Bài tập và Bước chân</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={connectedAppleHealth ? "outline" : "default"}
                  onClick={() => {
                    if (!connectedAppleHealth) {
                      setIsHealthModalOpen(true);
                    } else {
                      setConnectedAppleHealth(false);
                      toggleAppConnection("appleHealth", false);
                    }
                  }}
                  className={cn(
                    "h-8 px-3 rounded-xl text-xs font-bold shrink-0",
                    connectedAppleHealth
                      ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
                      : "bg-[#007AFF] hover:bg-blue-600 text-white"
                  )}
                >
                  {connectedAppleHealth ? "Đã kết nối" : "Kết nối"}
                </Button>
              </div>
            </div>

            {/* PHẦN 16 THIẾT BỊ ĐEO (CHUẨN VIDEO FRAME 2) */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-foreground block">
                Thiết bị
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FITNESS_DEVICES.map((device) => {
                  const isSelected = selectedDevices.includes(device.id);
                  return (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => toggleDevice(device.id)}
                      className={cn(
                        "h-11 px-3 rounded-full border text-xs font-semibold flex items-center justify-center transition-all select-none active:scale-98",
                        isSelected
                          ? "border-[#1b3554] bg-[#1b3554]/10 text-foreground font-bold shadow-2xs"
                          : "border-border/80 bg-background hover:bg-muted/50 text-foreground"
                      )}
                    >
                      <span>{device.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* BƯỚC 5: THẺ VẬN ĐỘNG VIÊN ĐIỆN TỬ & ĐỀ XUẤT BẠN TẬP */}
        {/* =================================================================== */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight leading-tight">
                Hồ sơ thể thao đã sẵn sàng
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Dữ liệu đã được đồng bộ với Strava & Apple Health.
              </p>
            </div>

            {/* Digital Athlete Pass Card */}
            <div className="rounded-3xl p-4.5 bg-gradient-to-br from-[#1b3554] via-[#000f22] to-[#122338] text-white shadow-lg border border-[#80aad3]/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo-icon-128.png"
                    alt="Logo"
                    width={28}
                    height={28}
                    unoptimized
                    className="h-7 w-7 rounded-lg"
                  />
                  <div>
                    <div className="text-[11px] font-mono font-bold tracking-tight text-white leading-none">
                      SYNC SPORT PASS
                    </div>
                    <div className="text-[9px] text-[#c0e6fd] tracking-widest mt-0.5">
                      ATHLETE VERIFIED
                    </div>
                  </div>
                </div>

                <Badge className="bg-emerald-500 text-white font-mono text-[9px] font-bold">
                  TrustScore: 120
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/10">
                <div className="bg-white/5 rounded-xl p-2">
                  <div className="text-[9px] text-white/60">Pace trung bình</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {PACE_OPTIONS.find((p) => p.id === selectedPace)?.pace.split(" ")[0] || "5:30"}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <div className="text-[9px] text-white/60">Khung giờ vàng</div>
                  <div className="text-xs font-bold text-emerald-300 mt-0.5">05:30 AM</div>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <div className="text-[9px] text-white/60">Đồng bộ</div>
                  <div className="text-xs font-bold text-amber-300 mt-0.5">Strava + </div>
                </div>
              </div>
            </div>

            {/* Suggested buddies */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>3 Bạn tập phù hợp nhất với bạn:</span>
                <span className="text-sky-600 text-[10px]">Độ tương thích 96%+</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { name: "Hoàng Nam", sport: "Chạy bộ", pace: "Pace 5:35", location: "Landmark 81", match: "99%" },
                  { name: "Thuỳ Dung", sport: "Gym / Kháng lực", pace: "Squat 75kg", location: "The New Gym", match: "97%" },
                  { name: "Đức Trọng", sport: "Chạy bộ", pace: "Pace 5:40", location: "Bờ kè Thanh Đa", match: "96%" },
                ].map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-border/80 bg-card flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {b.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{b.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {b.sport} • {b.pace} • {b.location}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                      {b.match}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BUTTON */}
      <div className="pt-2 pb-1">
        {step < totalSteps ? (
          <Button
            type="button"
            onClick={handleNext}
            className="w-full h-11 rounded-xl font-bold text-xs bg-[#1b3554] dark:bg-[#c0e6fd] text-white dark:text-[#000f22] hover:opacity-90 transition-all shadow-sm active:scale-98"
          >
            <span>Tiếp tục</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleFinish}
            className="w-full h-11 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm active:scale-98"
          >
            <span>Bắt đầu trải nghiệm</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL: APPLE HEALTH PERMISSION SHEET (CHUẨN 100% TỪ FRAME 3 VIDEO) */}
      {/* =================================================================== */}
      {isHealthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h2 className="text-base font-black text-foreground">Truy cập sức khỏe</h2>
              <button
                type="button"
                onClick={() => setIsHealthModalOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* CHO PHÉP SYNC GHI (WRITE PERMISSIONS) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground block">
                Cho phép &ldquo;SYNC SPORT&rdquo; ghi
              </span>

              <div className="space-y-2 bg-muted/30 p-3 rounded-2xl border border-border/60 text-xs">
                {[
                  { key: "workouts", label: "Bài tập", icon: Flame },
                  { key: "steps", label: "Bước", icon: Footprints },
                  { key: "routes", label: "Các lộ trình bài tập", icon: Compass },
                  { key: "activeEnergy", label: "Năng lượng hoạt động", icon: Zap },
                  { key: "heartRate", label: "Nhịp tim", icon: Heart },
                  { key: "cyclingDistance", label: "Quãng đường đạp xe", icon: Activity },
                  { key: "walkingRunningDistance", label: "Quãng đường đi bộ + chạy", icon: Flame },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = healthPermissions[item.key as keyof typeof healthPermissions];
                  return (
                    <div key={item.key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-rose-500" />
                        <span className="font-medium text-foreground">{item.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setHealthPermissions((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded accent-[#007AFF] cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
                Giải thích ứng dụng: Cho phép SYNC SPORT cập nhật Apple Health với các hoạt động trên SYNC.
              </p>
            </div>

            {/* ACTION BUTTONS (Apple iOS Style) */}
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={() => {
                  setConnectedAppleHealth(true);
                  toggleAppConnection("appleHealth", true);
                  setIsHealthModalOpen(false);
                }}
                className="w-full h-11 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white font-bold text-xs"
              >
                Cho phép
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsHealthModalOpen(false)}
                className="w-full h-11 rounded-xl text-xs font-semibold"
              >
                Từ chối
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: STRAVA CONNECTED SUCCESS (CHUẨN 100% TỪ FRAME 4 VIDEO) */}
      {/* =================================================================== */}
      {isStravaSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FC4C02]/15 text-[#FC4C02] flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.92 15.602h4.172" />
              </svg>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">
                Tài khoản Strava của bạn đã được kết nối
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Các hoạt động trên đồng hồ và Strava sẽ được tự động đồng bộ trực tiếp lên SYNC SPORT.
              </p>
            </div>

            {/* Chart illustration like Frame 4 */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-around py-4">
              {/* Bar chart */}
              <div className="flex items-end gap-1 h-16">
                <div className="w-2.5 h-6 bg-purple-400 rounded-xs" />
                <div className="w-2.5 h-16 bg-purple-600 rounded-xs" />
                <div className="w-2.5 h-10 bg-purple-500 rounded-xs" />
                <div className="w-2.5 h-3 bg-purple-300 rounded-xs" />
              </div>

              {/* Circle percentage */}
              <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center text-xs font-bold text-foreground">
                <span>94%</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setIsStravaSuccessOpen(false)}
              className="w-full h-11 rounded-xl bg-[#FC4C02] hover:bg-[#e04300] text-white font-bold text-xs"
            >
              Tiếp tục
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
