"use client";

import * as React from "react";

const TOTAL_MS = 5300;

/**
 * Hiệu ứng mở đầu khi vào màn đăng nhập (theo video mẫu):
 *  1. Bảng số liệu tập luyện phát sáng + tuyến chạy tự vẽ
 *  2. Hai vận động viên lướt qua màn hình, chữ SYNESIS quét ngang
 *  3. Hạt sáng xoáy tụ lại thành logo SYNESIS rồi toả ra
 * Bỏ qua được; tự tắt nếu người dùng bật "giảm chuyển động".
 */
export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [leaving, setLeaving] = React.useState(false);
  const doneRef = React.useRef(false);

  const finish = React.useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    setTimeout(onDone, 450);
  }, [onDone]);

  React.useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    // Dự phòng: nếu sự kiện kết thúc animation không tới (tab chạy nền...), vẫn đóng sau 9 giây
    const t = setTimeout(finish, 9000);
    return () => clearTimeout(t);
  }, [finish]);

  // Hạt sáng xoáy thành logo
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const N = 240;
    const parts = Array.from({ length: N }, () => ({
      a: Math.random() * Math.PI * 2,
      r0: 90 + Math.random() * 260,
      spin: 2.2 + Math.random() * 2.5,
      size: 0.6 + Math.random() * 2.2,
      hue: Math.random() < 0.35 ? "255,255,255" : Math.random() < 0.5 ? "57,161,244" : "5,103,225",
    }));
    const start = performance.now();
    const VORTEX_FROM = 2900;
    const VORTEX_TO = 4300;
    let raf = 0;

    const draw = (now: number) => {
      const t = now - start;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (t > VORTEX_FROM - 300) {
        const p = Math.min(1, Math.max(0, (t - VORTEX_FROM) / (VORTEX_TO - VORTEX_FROM)));
        const ease = 1 - (1 - p) ** 3;
        const burst = t > VORTEX_TO ? Math.min(1, (t - VORTEX_TO) / 900) : 0;
        const cx = w / 2;
        const cy = h * 0.42;
        ctx.globalCompositeOperation = "lighter";
        for (const q of parts) {
          const angle = q.a + ease * q.spin * Math.PI;
          const r = (q.r0 * (1 - ease * 0.92) + burst * q.r0 * 1.4) * dpr;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r * 0.85;
          const alpha = (t < VORTEX_FROM ? (t - (VORTEX_FROM - 300)) / 300 : 1) * (1 - burst);
          ctx.beginPath();
          ctx.fillStyle = `rgba(${q.hue},${Math.max(0, alpha) * 0.9})`;
          ctx.arc(x, y, q.size * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }
      if (t < TOTAL_MS + 200) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[2000] overflow-hidden bg-[#020611] text-white transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}
      role="img"
      aria-label="Hiệu ứng giới thiệu SYNESIS"
    >
      {/* nền lưới phát sáng */}
      <div className="absolute inset-0 intro-grid" />
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[70vh] w-[70vh] rounded-full bg-brand/30 blur-[120px]" />

      {/* 1. Bảng số liệu + tuyến chạy */}
      <div className="absolute inset-x-6 top-[14%] intro-dashboard">
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Nhịp tim", "152", "bpm"],
            ["Pace", "5'12", "/km"],
            ["Calo", "340", "kcal"],
          ].map(([k, v, u], i) => (
            <div key={k} className="rounded-xl border border-brand-sky/30 bg-white/5 backdrop-blur px-2.5 py-2 intro-chip" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
              <p className="text-[10px] text-brand-200/80">{k}</p>
              <p className="text-[18px] font-extrabold font-display leading-tight">
                {v}
                <span className="ml-0.5 text-[10px] font-semibold text-brand-200/80">{u}</span>
              </p>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 320 170" className="mt-3 w-full" aria-hidden>
          <defs>
            <linearGradient id="introRoute" x1="0" x2="1">
              <stop offset="0" stopColor="#39A1F4" />
              <stop offset="1" stopColor="#0567E1" />
            </linearGradient>
            <filter id="introGlow">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d="M10 150 C 60 140, 70 90, 120 95 S 190 40, 230 60 S 290 30, 310 12" fill="none" stroke="url(#introRoute)" strokeWidth="4" strokeLinecap="round" filter="url(#introGlow)" className="intro-route" />
          <circle cx="310" cy="12" r="6" fill="#ffffff" className="intro-dot" />
          {/* nhịp tim */}
          <path d="M0 150 L40 150 L50 130 L60 165 L70 120 L80 150 L320 150" fill="none" stroke="#39A1F4" strokeOpacity=".35" strokeWidth="1.5" className="intro-ecg" />
        </svg>
      </div>

      {/* 2. Vận động viên + chữ quét */}
      <p className="absolute left-0 right-0 top-[46%] text-center text-[64px] font-black tracking-[0.12em] font-display intro-word" aria-hidden>
        SYN<span className="intro-e">≡</span>SIS
      </p>
      <div className="absolute top-[33%] left-0 intro-runners" aria-hidden>
        <Runner className="h-52 w-32 opacity-75" delay={-0.23} />
        <Runner className="h-60 w-36 -ml-14" delay={0} />
      </div>
      <div className="absolute inset-x-0 top-[44%] h-24 intro-streaks" aria-hidden>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="intro-streak" style={{ top: `${i * 14}%`, animationDelay: `${1.15 + i * 0.07}s`, width: `${30 + ((i * 37) % 45)}%` }} />
        ))}
      </div>

      {/* 3. Hạt sáng + logo */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <div
        className="absolute inset-x-0 top-[calc(max(24px,env(safe-area-inset-top))+40px)] flex flex-col items-center intro-logo"
        onAnimationEnd={(e) => {
          // Kết thúc theo đúng nhịp hiển thị thực tế (logo hiện xong) thay vì đồng hồ cố định
          if (e.animationName === "intro-logo") setTimeout(finish, 500);
        }}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-[28px] bg-brand-sky/50 blur-2xl" />
          <img src="/logo-icon-584.png" alt="" className="relative h-24 w-24 rounded-[26px] shadow-2xl" />
        </div>
        <p className="mt-4 text-[28px] font-black tracking-[0.14em] font-display">SYN≡SIS</p>
      </div>

      <button onClick={finish} className="absolute top-[max(16px,env(safe-area-inset-top))] right-4 rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-[12.5px] font-semibold backdrop-blur">
        Bỏ qua
      </button>
    </div>
  );
}

/** Vận động viên cách điệu — tay chân đánh nhịp như đang chạy */
function Runner({ className, delay }: { className?: string; delay: number }) {
  const limb = (origin: string, anim: string, extra = 0): React.CSSProperties => ({
    transformOrigin: origin,
    animation: `${anim} 0.46s ease-in-out infinite alternate`,
    animationDelay: `${delay + extra}s`,
  });
  return (
    <svg viewBox="0 0 60 100" className={className} style={{ filter: "drop-shadow(0 0 10px rgba(57,161,244,.85))" }}>
      <defs>
        <linearGradient id="runnerFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#82C0F8" />
          <stop offset="1" stopColor="#0567E1" />
        </linearGradient>
      </defs>
      <g stroke="url(#runnerFill)" strokeWidth="7" strokeLinecap="round" fill="none">
        {/* chân sau */}
        <g style={limb("29px 52px", "intro-leg", -0.46)}>
          <line x1="29" y1="52" x2="25" y2="72" />
          <g style={limb("25px 72px", "intro-shin", -0.46)}>
            <line x1="25" y1="72" x2="21" y2="92" />
          </g>
        </g>
        {/* tay sau */}
        <g style={limb("33px 25px", "intro-arm")}>
          <line x1="33" y1="25" x2="27" y2="38" />
          <line x1="27" y1="38" x2="35" y2="45" />
        </g>
        {/* thân */}
        <line x1="34" y1="22" x2="29" y2="52" strokeWidth="9" />
        {/* chân trước */}
        <g style={limb("29px 52px", "intro-leg")}>
          <line x1="29" y1="52" x2="25" y2="72" />
          <g style={limb("25px 72px", "intro-shin")}>
            <line x1="25" y1="72" x2="21" y2="92" />
          </g>
        </g>
        {/* tay trước */}
        <g style={limb("33px 25px", "intro-arm", -0.46)}>
          <line x1="33" y1="25" x2="27" y2="38" />
          <line x1="27" y1="38" x2="35" y2="45" />
        </g>
      </g>
      <circle cx="37" cy="11" r="7" fill="url(#runnerFill)" />
    </svg>
  );
}
