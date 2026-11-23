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
  // Stage timeline:
  // 1 (0s-2.5s): Kèo đã chốt Nhật Vy & Hữu Phúc (Giao diện nền trắng)
  // 2 (2.5s-5.5s): Hữu Phúc bùng kèo, trừ điểm uy tín Hữu Phúc (-1.5 UT: 9.5 -> 8.0)
  // 3 (5.5s-8.0s): Kích hoạt Auto-Rematch cho Nhật Vy, quét & hiển thị ghép người mới ngay lúc đó
  // 4 (8.0s-10s): Ghép thành công Lưu Thịnh (9.2 UT) thế chỗ, bảo vệ chuỗi tập của Nhật Vy
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
    <main className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col items-center justify-center p-2 sm:p-6 text-foreground font-sans">
      {/* Simulation Header Controller & Video Switcher */}
      <div className="w-full max-w-[420px] mb-3 flex flex-col gap-2 px-1 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
              Mô phỏng Bùng Kèo & Rematch (10s)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href="/videos/bung-keo-auto-rematch.mp4"
              download="bung-keo-auto-rematch.mp4"
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 transition"
            >
              Tải MP4
            </a>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 rounded-2xl shadow-xs">
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("interactive")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "interactive"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Khung App Nền Trắng
            </button>
            <button
              onClick={() => setViewMode("video")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "video"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Video MP4 Đã Quay
            </button>
          </div>
          {viewMode === "interactive" && (
            <div className="flex items-center gap-2 pr-1.5">
              <span className="font-mono bg-neutral-100 dark:bg-neutral-950 px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-blue-600 dark:text-sky-400 font-bold">
                {seconds.toFixed(1)}s
              </span>
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
                title="Xem lại từ đầu"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {viewMode === "video" ? (
        <div className="w-full max-w-[390px] bg-white dark:bg-neutral-900 border-[7px] border-neutral-300 dark:border-neutral-800 rounded-[46px] shadow-2xl p-4 flex flex-col items-center gap-3">
          <p className="text-xs text-neutral-800 dark:text-neutral-200 font-bold self-start flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Video MP4 (10 Giây): Hữu Phúc bùng kèo & Ghép lại người mới
          </p>
          <video
            src="/videos/bung-keo-auto-rematch.mp4"
            controls
            autoPlay
            loop
            playsInline
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-md"
          />
          <div className="w-full flex items-center justify-between text-xs text-neutral-500 pt-1">
            <span>Thời lượng: 10.0 giây</span>
            <a
              href="/videos/bung-keo-auto-rematch.mp4"
              download
              className="text-blue-600 font-bold hover:underline"
            >
              Lưu video về máy (.mp4)
            </a>
          </div>
        </div>
      ) : (
        /* Mobile Device Mockup - NỀN TRẮNG */
        <div className="w-full max-w-[390px] h-[812px] bg-white border-[7px] border-neutral-300 rounded-[46px] shadow-2xl overflow-hidden flex flex-col relative select-none">
          {/* Dynamic Island / Notch */}
          <div className="h-9 w-full bg-white flex items-center justify-between px-7 shrink-0 z-40 border-b border-neutral-100">
            <span className="text-[12px] font-extrabold text-neutral-900 font-mono tracking-tight">05:25</span>
            <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 text-neutral-800 text-[11px]">
              <span className="font-extrabold">5G</span>
              <div className="w-4 h-2 border border-neutral-700 rounded-xs p-[0.5px] flex items-center">
                <div className="w-full h-full bg-neutral-900 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Top App Bar - White Theme */}
          <div className="px-4 py-2.5 bg-white/95 backdrop-blur border-b border-neutral-100 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-xs">
                S
              </div>
              <div>
                <p className="text-[13px] font-black tracking-tight text-neutral-900 leading-none">SYNESIS LÊN KÈO</p>
                <p className="text-[10px] text-blue-600 font-semibold">Bảo vệ quyền lợi Host & Cam kết UT</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-full text-[11px]">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span className="font-extrabold text-orange-950">Chuỗi 6 tuần</span>
            </div>
          </div>

          {/* Main Content Area - Clean White / Slate-50 Background */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/70 relative">
            {/* Card: Thông tin Host (Nhật Vy) */}
            <div className="rounded-2xl bg-white border border-neutral-200/90 p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Image
                      src="/users/nhat-vy.png"
                      alt="Nhật Vy"
                      width={46}
                      height={46}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-blue-600 text-[9px] font-black text-white px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
                      HOST
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-neutral-900">Nhật Vy</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-300">
                        Gold
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-medium">Yoga & Runner phục hồi • Bình Thạnh</p>
                  </div>
                </div>

                {/* Trust Score Nhật Vy */}
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Điểm Uy Tín</span>
                  <div className="flex items-center gap-1 text-blue-600 font-extrabold text-base">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>8.5 UT</span>
                  </div>
                </div>
              </div>

              {/* Kèo Info */}
              <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-neutral-900 text-[13px]">Chạy 10km bờ kè Landmark 81</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                    Kèo 1:1
                  </span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600 text-[11px]">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-neutral-500" /> 05:30 Sáng nay
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-neutral-500" /> Cổng bến thuyền Landmark
                  </span>
                </div>
              </div>
            </div>

            {/* DYNAMIC SCENARIO STAGES */}

            {/* STAGE 1: ĐÃ CHỐT VỚI HỮU PHÚC */}
            {stage === 1 && (
              <div className="rounded-2xl bg-white border border-neutral-200/90 p-3.5 space-y-3 transition-all animate-in fade-in zoom-in-95 duration-300 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" /> Bạn tập đã nhận kèo (1/1)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300">
                    Đã chốt kèo 2/2
                  </span>
                </div>

                <div className="flex items-center justify-between bg-neutral-50 rounded-xl p-2.5 border border-neutral-200/80">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src="/users/huu-phuc.jpg"
                      alt="Hữu Phúc"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/60"
                    />
                    <div>
                      <span className="text-[13px] font-extrabold text-neutral-900 block">Hữu Phúc</span>
                      <span className="text-[11px] text-neutral-500 font-medium">Pace 5:30 - 5:45 • Khế ước chuẩn bị</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block font-medium">Uy tín</span>
                    <span className="text-sm font-black text-emerald-600">9.5 UT</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <div className="flex-1 py-2 rounded-xl bg-white border border-neutral-200 text-center text-xs font-bold text-neutral-700 flex items-center justify-center gap-1.5 shadow-2xs">
                    <MessageCircle className="w-3.5 h-3.5 text-blue-600" /> Chat với Phúc
                  </div>
                  <div className="flex-1 py-2 rounded-xl bg-emerald-600 text-center text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng đến hẹn
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 2: HỮU PHÚC BÙNG KÈO & BỊ TRỪ ĐIỂM UY TÍN */}
            {stage === 2 && (
              <div className="space-y-2.5 transition-all animate-in shake duration-300">
                {/* Alert Banner Bùng Kèo */}
                <div className="rounded-2xl bg-rose-50 border-2 border-rose-400 p-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-rose-700 mb-1">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                    <span className="text-xs font-black uppercase tracking-wider text-rose-800">
                      Cảnh báo vi phạm: Bùng kèo sát giờ!
                    </span>
                  </div>
                  <p className="text-[11.5px] text-rose-900 font-medium leading-snug">
                    Bạn tập <strong className="text-rose-950 font-black">Hữu Phúc</strong> đã đơn phương huỷ kèo khi chỉ còn 5 phút trước giờ hẹn.
                  </p>
                </div>

                {/* Penalty Card: Hữu Phúc bị trừ điểm */}
                <div className="rounded-2xl bg-white border-2 border-rose-300 p-3 space-y-2.5 relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
                    Trừ điểm UT
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <Image
                        src="/users/huu-phuc.jpg"
                        alt="Hữu Phúc"
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-cover grayscale ring-2 ring-rose-500"
                      />
                      <div className="absolute inset-0 bg-rose-900/40 rounded-full flex items-center justify-center">
                        <UserX className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-neutral-400 line-through">Hữu Phúc</span>
                      <span className="text-[11px] text-rose-600 font-extrabold block">Vi phạm bùng kèo khế ước</span>
                    </div>
                  </div>

                  {/* Score deduction visual */}
                  <div className="bg-rose-50/70 rounded-xl p-2.5 border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 block font-medium">Hình phạt hệ thống</span>
                      <span className="text-xs text-rose-700 font-extrabold">Khóa tạo kèo 1:1 (48h)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-neutral-400 line-through text-xs font-bold">9.5 UT</span>
                      <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-base font-black text-rose-700">8.0 UT</span>
                      <span className="text-[10px] bg-rose-200 text-rose-800 px-1 py-0.5 rounded font-black">
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
                <div className="rounded-2xl bg-sky-50 border-2 border-sky-300 p-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-sky-700 mb-1">
                    <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider text-sky-800">
                      Bảo vệ quyền lợi Host Nhật Vy
                    </span>
                  </div>
                  <p className="text-[11.5px] text-sky-950 font-medium leading-snug">
                    Chuỗi tập của bạn được bảo toàn! Đang tự động quét người mới cùng khung giờ và vị trí...
                  </p>
                </div>

                {/* Radar Rematch Box */}
                <div className="rounded-2xl bg-white border border-sky-300 p-3.5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                      <span className="text-xs font-extrabold text-neutral-900">Đang tìm bạn tập thay thế...</span>
                    </div>
                    <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Bán kính 1.2km
                    </span>
                  </div>

                  {/* Candidate 1: Lưu Thịnh (Top Match) */}
                  <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 p-2.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Image
                          src="/users/luu-thinh.jpg"
                          alt="Lưu Thịnh"
                          width={42}
                          height={42}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                        />
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-black text-neutral-900">Lưu Thịnh</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-600 text-white">
                            98% MATCH
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-600 font-medium block">
                          Pacer FTU2 • Cách 600m • Sẵn sàng ngay
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block font-medium">Uy tín</span>
                      <span className="text-xs font-black text-blue-700">9.2 UT</span>
                    </div>
                  </div>

                  {/* Button Action */}
                  <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white font-black text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 animate-pulse">
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
                <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-400 p-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-800 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                      Ghép bạn tập mới thành công!
                    </span>
                  </div>
                  <p className="text-[11.5px] text-emerald-950 font-medium leading-snug">
                    <strong className="text-emerald-950 font-black">Lưu Thịnh</strong> đã xác nhận tiếp quản kèo. Buổi chạy 10km của bạn tiếp tục đúng giờ!
                  </p>
                </div>

                {/* Updated Roster Card */}
                <div className="rounded-2xl bg-white border border-emerald-300 p-3 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-neutral-900">Cặp đôi chạy bộ mới (2/2)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300">
                      Đã cứu kèo an toàn
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src="/users/luu-thinh.jpg"
                        alt="Lưu Thịnh"
                        width={42}
                        height={42}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                      />
                      <div>
                        <span className="text-[13px] font-black text-neutral-900 block">Lưu Thịnh (Bạn tập mới)</span>
                        <span className="text-[11px] text-neutral-500 font-medium">Đang tới điểm hẹn bến thuyền • 4 phút</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block font-medium">Uy tín</span>
                      <span className="text-xs font-black text-emerald-600">9.2 UT</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900 font-medium">
                    <span>Thưởng Host Nhật Vy giữ hẹn:</span>
                    <span className="font-black text-emerald-700">+0.25 UT</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-neutral-800 flex items-center justify-center gap-1.5 shadow-2xs hover:bg-neutral-50">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Gọi Thịnh
                    </button>
                    <button className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs">
                      <MessageCircle className="w-3.5 h-3.5" /> Mở Chat Kèo Mới
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Stage Progress Steps */}
          <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
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
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold text-center transition-all ${
                    stage === st.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : stage > st.id
                      ? "bg-neutral-100 text-neutral-800"
                      : "bg-white text-neutral-400 border border-neutral-200"
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
