"use client";

import * as React from "react";
import Image from "next/image";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UserX,
  UserCheck,
  RefreshCw,
  MapPin,
  Clock,
  Flame,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
} from "lucide-react";

export default function DemoRematchPage() {
  const [stage, setStage] = React.useState<1 | 2 | 3 | 4>(1);
  const [seconds, setSeconds] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<"interactive" | "video">("interactive");

  React.useEffect(() => {
    if (viewMode === "video") return;
    const timer = setInterval(() => {
      setSeconds((prev) => {
        const next = +(prev + 0.1).toFixed(1);
        if (next >= 8.0) setStage(4);
        else if (next >= 5.2) setStage(3);
        else if (next >= 2.5) setStage(2);
        else setStage(1);
        return next >= 10.5 ? 0 : next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [viewMode]);

  const handleRestart = () => {
    setSeconds(0);
    setStage(1);
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-2 sm:p-6 text-foreground font-sans">
      {/* Simulation Header Controller & Video Switcher */}
      <div className="w-full max-w-[420px] mb-3 flex flex-col gap-2 px-1 text-xs text-neutral-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-white text-sm">Mô phỏng Bùng Kèo & Rematch (10s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href="/videos/bung-keo-auto-rematch.mp4"
              download="bung-keo-auto-rematch.mp4"
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
            >
              Tải MP4
            </a>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("interactive")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === "interactive" ? "bg-sky-600 text-white shadow-xs" : "text-neutral-400 hover:text-white"
              }`}
            >
              Khung App Giả Lập
            </button>
            <button
              onClick={() => setViewMode("video")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === "video" ? "bg-sky-600 text-white shadow-xs" : "text-neutral-400 hover:text-white"
              }`}
            >
              Video MP4 Đã Quay
            </button>
          </div>
          {viewMode === "interactive" && (
            <div className="flex items-center gap-2 pr-1.5">
              <span className="font-mono bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-sky-400 font-bold">
                {seconds.toFixed(1)}s
              </span>
              <button
                onClick={handleRestart}
                className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                title="Xem lại từ đầu"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {viewMode === "video" ? (
        <div className="w-full max-w-[390px] bg-neutral-900 border-[7px] border-neutral-800 rounded-[44px] shadow-2xl p-4 flex flex-col items-center gap-3">
          <p className="text-xs text-neutral-300 font-bold self-start flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Video MP4 (10 Giây): Hữu Phúc bùng kèo & Ghép lại người mới
          </p>
          <video
            src="/videos/bung-keo-auto-rematch.mp4"
            controls
            autoPlay
            loop
            playsInline
            className="w-full rounded-2xl border border-neutral-700 shadow-lg"
          />
          <div className="w-full flex items-center justify-between text-xs text-neutral-400 pt-1">
            <span>Thời lượng: 10.0 giây</span>
            <a
              href="/videos/bung-keo-auto-rematch.mp4"
              download
              className="text-sky-400 font-bold hover:underline"
            >
              Lưu video về máy (.mp4)
            </a>
          </div>
        </div>
      ) : (
      /* Mobile Device Mockup */
      <div className="w-full max-w-[390px] h-[812px] bg-neutral-900 border-[7px] border-neutral-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative select-none">
        {/* Dynamic Island / Notch */}
        <div className="h-9 w-full bg-neutral-900 flex items-center justify-between px-7 shrink-0 z-40">
          <span className="text-[12px] font-bold text-neutral-200 font-mono tracking-tight">05:25</span>
          <div className="w-24 h-4 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 text-neutral-300 text-[11px]">
            <span className="font-semibold">5G</span>
            <div className="w-4 h-2 border border-neutral-400 rounded-sm p-[0.5px] flex items-center">
              <div className="w-full h-full bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Top App Bar */}
        <div className="px-4 py-2 bg-neutral-900/90 backdrop-blur border-b border-neutral-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              S
            </div>
            <div>
              <p className="text-[13px] font-black tracking-tight text-white leading-none">SYNESIS LÊN KÈO</p>
              <p className="text-[10px] text-sky-400 font-medium">Bảo vệ quyền lợi Host & Cam kết UT</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-800/90 border border-neutral-700/60 px-2.5 py-1 rounded-full text-[11px]">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="font-bold text-neutral-200">Chuỗi 6 tuần</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-neutral-950/70 relative">
          {/* Card: Thông tin Host (Nhật Vy) */}
          <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-3 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Image
                    src="/users/nhat-vy.png"
                    alt="Nhật Vy"
                    width={46}
                    height={46}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-sky-500/80"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-sky-600 text-[9px] font-black text-white px-1.5 py-0.2 rounded-full border border-neutral-900">
                    HOST
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-white">Nhật Vy</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Gold
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Yoga & Runner phục hồi • Bình Thạnh</p>
                </div>
              </div>

              {/* Trust Score Nhật Vy */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Điểm Uy Tín</span>
                <div className="flex items-center gap-1 text-sky-400 font-extrabold text-base">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>8.5 UT</span>
                </div>
              </div>
            </div>

            {/* Kèo Info */}
            <div className="bg-neutral-950/80 rounded-xl p-2.5 border border-neutral-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-neutral-300">
                <span className="font-bold text-white text-[13px]">Chạy 10km bờ kè Landmark 81</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-semibold text-[10px]">
                  Kèo 1:1
                </span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" /> 05:30 Sáng nay
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400" /> Cổng bến thuyền Landmark
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC SCENARIO STAGES */}

          {/* STAGE 1: ĐÃ CHỐT VỚI HỮU PHÚC */}
          {stage === 1 && (
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-3.5 space-y-3 transition-all animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Bạn tập đã nhận kèo (1/1)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                  Đã chốt kèo 2/2
                </span>
              </div>

              <div className="flex items-center justify-between bg-neutral-950/90 rounded-xl p-2.5 border border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/users/huu-phuc.jpg"
                    alt="Hữu Phúc"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-emerald-500/50"
                  />
                  <div>
                    <span className="text-[13px] font-bold text-white block">Hữu Phúc</span>
                    <span className="text-[11px] text-neutral-400">Pace 5:30 - 5:45 • Khế ước chuẩn bị</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block">Uy tín</span>
                  <span className="text-sm font-extrabold text-emerald-400">9.5 UT</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <div className="flex-1 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-center text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-sky-400" /> Chat với Phúc
                </div>
                <div className="flex-1 py-2 rounded-xl bg-emerald-600/30 border border-emerald-500/50 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng đến hẹn
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: HỮU PHÚC BÙNG KÈO & BỊ TRỪ ĐIỂM UY TÍN */}
          {stage === 2 && (
            <div className="space-y-2.5 transition-all animate-in shake duration-300">
              {/* Alert Banner Bùng Kèo */}
              <div className="rounded-2xl bg-red-950/90 border-2 border-red-500/80 p-3 shadow-lg shadow-red-950/50">
                <div className="flex items-center gap-2 text-red-400 mb-1.5">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
                  <span className="text-xs font-black uppercase tracking-wider text-red-300">
                    Cảnh báo vi phạm: Bùng kèo sát giờ!
                  </span>
                </div>
                <p className="text-[11.5px] text-red-200 leading-snug">
                  Bạn tập <strong className="text-white">Hữu Phúc</strong> đã đơn phương huỷ kèo khi chỉ còn 5 phút trước giờ hẹn.
                </p>
              </div>

              {/* Penalty Card: Hữu Phúc bị trừ điểm */}
              <div className="rounded-2xl bg-neutral-900 border border-red-500/40 p-3 space-y-2.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
                  Trừ điểm UT
                </div>

                <div className="flex items-center gap-2.5 opacity-90">
                  <div className="relative">
                    <Image
                      src="/users/huu-phuc.jpg"
                      alt="Hữu Phúc"
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover grayscale ring-2 ring-red-500"
                    />
                    <div className="absolute inset-0 bg-red-950/60 rounded-full flex items-center justify-center">
                      <UserX className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-neutral-300 line-through">Hữu Phúc</span>
                    <span className="text-[10px] text-red-400 font-semibold block">Vi phạm bùng kèo khế ước</span>
                  </div>
                </div>

                {/* Score deduction visual */}
                <div className="bg-neutral-950 rounded-xl p-2.5 border border-red-900/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-medium">Hình phạt hệ thống</span>
                    <span className="text-xs text-red-400 font-semibold">Khóa tạo kèo 1:1 (48h)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-neutral-500 line-through text-xs font-bold">9.5 UT</span>
                    <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-base font-black text-red-500">8.0 UT</span>
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1 py-0.5 rounded font-bold">
                      -1.5 UT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: KÍCH HOẠT SMART AUTO-REMATCH CHO NHẬT VY */}
          {stage === 3 && (
            <div className="space-y-3 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Host Protection Shield */}
              <div className="rounded-2xl bg-sky-950/80 border border-sky-500/60 p-3 shadow-lg shadow-sky-950/50">
                <div className="flex items-center gap-2 text-sky-400 mb-1">
                  <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-sky-300">
                    Bảo vệ quyền lợi Host Nhật Vy
                  </span>
                </div>
                <p className="text-[11.5px] text-sky-200">
                  Chuỗi tập của bạn được bảo toàn! Đang tự động quét người mới cùng khung giờ và vị trí...
                </p>
              </div>

              {/* Radar Rematch Box */}
              <div className="rounded-2xl bg-neutral-900 border border-sky-500/40 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                    <span className="text-xs font-bold text-white">Đang tìm bạn tập thay thế...</span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 font-semibold">Bán kính 1.2km</span>
                </div>

                {/* Candidate 1: Lưu Thịnh (Top Match) */}
                <div className="rounded-xl bg-gradient-to-r from-sky-950/90 to-blue-950/70 border-2 border-sky-400 p-2.5 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <Image
                        src="/users/luu-thinh.jpg"
                        alt="Lưu Thịnh"
                        width={42}
                        height={42}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-400"
                      />
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-black text-white">Lưu Thịnh</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/30 text-sky-300">
                          98% MATCH
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-300 block">Pacer FTU2 • Cách 600m • Sẵn sàng ngay</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block">Uy tín</span>
                    <span className="text-xs font-black text-sky-300">9.2 UT</span>
                  </div>
                </div>

                {/* Button Action */}
                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 animate-pulse">
                  <Zap className="w-4 h-4 fill-white" />
                  GHÉP NGƯỜI MỚI NGAY LÚC NÀY
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: GHÉP THÀNH CÔNG VỚI LƯU THỊNH */}
          {stage === 4 && (
            <div className="space-y-3 transition-all animate-in zoom-in-95 duration-400">
              {/* Success Banner */}
              <div className="rounded-2xl bg-emerald-950/90 border-2 border-emerald-500/80 p-3 shadow-lg shadow-emerald-950/50">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    Ghép bạn tập mới thành công!
                  </span>
                </div>
                <p className="text-[11.5px] text-emerald-200">
                  <strong className="text-white">Lưu Thịnh</strong> đã xác nhận tiếp quản kèo. Buổi chạy 10km của bạn tiếp tục đúng giờ!
                </p>
              </div>

              {/* Updated Roster Card */}
              <div className="rounded-2xl bg-neutral-900 border border-emerald-500/40 p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-300">Cặp đôi chạy bộ mới (2/2)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    Đã cứu kèo an toàn
                  </span>
                </div>

                <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src="/users/luu-thinh.jpg"
                      alt="Lưu Thịnh"
                      width={42}
                      height={42}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                    />
                    <div>
                      <span className="text-[13px] font-black text-white block">Lưu Thịnh (Bạn tập mới)</span>
                      <span className="text-[11px] text-neutral-400">Đang tới điểm hẹn bến thuyền • 4 phút</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block">Uy tín</span>
                    <span className="text-xs font-black text-emerald-400">9.2 UT</span>
                  </div>
                </div>

                <div className="bg-emerald-950/40 rounded-xl p-2 border border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-300">
                  <span>Thưởng Host Nhật Vy giữ hẹn:</span>
                  <span className="font-extrabold text-emerald-400">+0.25 UT</span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Gọi Thịnh
                  </button>
                  <button className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30">
                    <MessageCircle className="w-3.5 h-3.5" /> Mở Chat Kèo Mới
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Stage Progress Steps */}
        <div className="p-3 bg-neutral-900 border-t border-neutral-800 shrink-0">
          <div className="flex items-center justify-between gap-1">
            {[
              { id: 1, label: "Kèo 1:1" },
              { id: 2, label: "Bùng kèo" },
              { id: 3, label: "Auto-Rematch" },
              { id: 4, label: "Ghép thành công" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStage(st.id as 1 | 2 | 3 | 4);
                  setSeconds(st.id === 1 ? 0 : st.id === 2 ? 2.6 : st.id === 3 ? 5.3 : 8.1);
                }}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                  stage === st.id
                    ? "bg-sky-500 text-white shadow-xs"
                    : stage > st.id
                    ? "bg-neutral-800 text-neutral-300"
                    : "bg-neutral-900 text-neutral-600 border border-neutral-800"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      )}
    </main>
  );
}
