"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, Loader2, MapPin, Shield, Smartphone, Users, Watch } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { DEMO_OTP, formatVnPhone, isKnownAccount, normalizeVnPhone, rememberAccount } from "@/features/auth/accounts";
import { BottomSheet } from "@/components/feed/bottom-sheet";

type Step = "welcome" | "phone" | "otp" | "name";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/**
 * Đăng nhập / tạo tài khoản: Google hoặc Số điện thoại (OTP).
 * Cùng một luồng cho cả người cũ và người mới: xác minh xong, nếu tài khoản đã tồn tại → vào app,
 * nếu chưa → tạo tài khoản và chuyển sang thiết lập cá nhân hoá (/bat-dau).
 */
export function AuthFlow() {
  const router = useRouter();
  const { loginWithPhone, loginWithSocial, register } = useAuth();
  const [step, setStep] = React.useState<Step>("welcome");
  const [phoneInput, setPhoneInput] = React.useState("");
  const [phone, setPhone] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState("");
  const [otpError, setOtpError] = React.useState("");
  const [resendIn, setResendIn] = React.useState(0);
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [googleOpen, setGoogleOpen] = React.useState(false);
  const [googleNew, setGoogleNew] = React.useState(false);
  const [gName, setGName] = React.useState("");
  const [gEmail, setGEmail] = React.useState("");
  const [guideOpen, setGuideOpen] = React.useState(false);
  const [welcomeBack, setWelcomeBack] = React.useState<string | null>(null);

  const normalized = normalizeVnPhone(phoneInput);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const goHome = (who: string) => {
    setWelcomeBack(who);
    setTimeout(() => router.push("/"), 900);
  };

  const sendOtp = async () => {
    if (!normalized) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setPhone(normalized);
    setOtp("");
    setOtpError("");
    setResendIn(60);
    setBusy(false);
    setStep("otp");
  };

  const verifyOtp = async (code: string) => {
    if (!phone || code.length !== 6) return;
    if (code !== DEMO_OTP) {
      setOtpError("Mã OTP không đúng. Vui lòng kiểm tra lại.");
      return;
    }
    setBusy(true);
    if (isKnownAccount({ phone })) {
      await loginWithPhone(formatVnPhone(phone), code);
      setBusy(false);
      goHome("Minh Thư");
    } else {
      setBusy(false);
      setStep("name");
    }
  };

  const createPhoneAccount = async () => {
    if (!phone || name.trim().length < 2) return;
    setBusy(true);
    await register({ name: name.trim(), phone: formatVnPhone(phone), provider: "phone" });
    rememberAccount({ phone });
    router.push("/bat-dau");
  };

  const googleExisting = async () => {
    setBusy(true);
    await loginWithSocial("google");
    setGoogleOpen(false);
    setBusy(false);
    goHome("Minh Thư");
  };

  const gEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gEmail.trim());
  const googleCreate = async () => {
    if (!gEmailValid || gName.trim().length < 2) return;
    if (isKnownAccount({ email: gEmail.trim() })) return googleExisting();
    setBusy(true);
    await register({ name: gName.trim(), email: gEmail.trim(), provider: "google" });
    rememberAccount({ email: gEmail.trim() });
    router.push("/bat-dau");
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#020611] text-white">
      <div className="absolute inset-0 intro-grid opacity-60" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-brand/30 blur-[120px]" />

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-8 pt-[max(24px,env(safe-area-inset-top))]">
        {step !== "welcome" && (
          <button
            onClick={() => setStep(step === "otp" ? "phone" : step === "name" ? "otp" : "welcome")}
            aria-label="Quay lại"
            className="h-10 w-10 -ml-2 rounded-full hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {/* ================= MÀN CHÀO ================= */}
        {step === "welcome" && (
          <div className="flex flex-1 flex-col animate-in fade-in duration-500">
            <div className="flex flex-col items-center pt-10">
              <div className="relative welcome-float">
                <div className="absolute inset-0 rounded-[26px] bg-brand-sky/40 blur-2xl" />
                <img src="/logo-icon-584.png" alt="SYNESIS" className="relative h-24 w-24 rounded-[26px]" />
              </div>
              <p className="mt-4 text-[28px] font-black tracking-[0.14em] font-display">SYN≡SIS</p>
              <h1 className="mt-5 text-center text-[24px] font-extrabold leading-tight font-display">
                Tìm bạn tập hợp nhịp,
                <br />
                <span className="bg-gradient-to-r from-brand-sky to-white bg-clip-text text-transparent">giữ kỷ luật cùng nhau</span>
              </h1>
            </div>

            <ul className="mt-7 space-y-2.5">
              {[
                [MapPin, "Ghép bạn tập trong bán kính 3 km, trùng giờ rảnh"],
                [Users, "Hợp loại buổi tập, tính cách (DISC) và vibe"],
                [Watch, "Đồng bộ Strava, Apple Health, Samsung Health, Hevy"],
                [Shield, "Điểm uy tín chống bùng kèo, tuỳ chọn chỉ ghép cùng giới"],
              ].map(([Icon, text], i) => {
                const I = Icon as typeof MapPin;
                return (
                  <li key={i} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 backdrop-blur animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 90}ms`, animationFillMode: "both" }}>
                    <span className="h-8 w-8 shrink-0 rounded-xl bg-brand/30 flex items-center justify-center">
                      <I className="h-4 w-4 text-brand-sky" />
                    </span>
                    <span className="text-[13px] text-white/90">{text as string}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto space-y-2.5 pt-8">
              <button
                onClick={() => setGoogleOpen(true)}
                className="w-full h-12 rounded-full bg-white text-black font-bold text-[15px] flex items-center justify-center gap-2.5 hover:bg-neutral-100 active:scale-[0.98] transition-all"
              >
                <GoogleIcon /> Tiếp tục với Google
              </button>
              <button
                onClick={() => setStep("phone")}
                className="w-full h-12 rounded-full bg-brand text-white font-bold text-[15px] flex items-center justify-center gap-2.5 hover:bg-brand-500 active:scale-[0.98] transition-all shadow-lg shadow-brand/30"
              >
                <Smartphone className="h-5 w-5" /> Tiếp tục bằng số điện thoại
              </button>
              <p className="text-center text-[12px] text-white/60 leading-relaxed">
                Chưa có tài khoản? Cứ chọn một cách ở trên — tài khoản sẽ được <b className="text-white/90">tạo tự động</b> sau khi xác minh.
              </p>
              <button onClick={() => setGuideOpen(true)} className="w-full text-center text-[13px] font-bold text-brand-sky">
                Người mới? Xem 4 bước bắt đầu
              </button>
              <p className="pt-1 text-center text-[10.5px] text-white/40">
                Tiếp tục nghĩa là bạn đồng ý Điều khoản sử dụng & Chính sách quyền riêng tư của SYNESIS.
              </p>
            </div>
          </div>
        )}

        {/* ================= SỐ ĐIỆN THOẠI ================= */}
        {step === "phone" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendOtp();
            }}
            className="flex flex-1 flex-col pt-4 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <h1 className="text-[26px] font-extrabold font-display">Số điện thoại của bạn</h1>
            <p className="mt-1 text-[13.5px] text-white/60">Chúng tôi sẽ gửi mã xác minh 6 số qua SMS. Dùng để đăng nhập và tạo tài khoản mới.</p>
            <label className="mt-6 flex items-center gap-2 rounded-2xl bg-white/[0.07] border border-white/15 px-4 h-14 focus-within:border-brand-sky">
              <span className="shrink-0 whitespace-nowrap text-[15px] font-semibold text-white/80">🇻🇳 +84</span>
              <span className="h-6 w-px bg-white/20" />
              <input
                autoFocus
                inputMode="tel"
                autoComplete="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0908 123 456"
                aria-label="Số điện thoại"
                className="flex-1 bg-transparent text-[17px] font-semibold tracking-wide outline-none placeholder:text-white/30"
              />
              {normalized && <Check className="h-5 w-5 text-brand-sky" />}
            </label>
            {phoneInput && !normalized && <p className="mt-2 text-[12px] text-amber-300">Số di động Việt Nam gồm 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09.</p>}
            <p className="mt-3 text-[11.5px] text-white/45">Mẹo thử nghiệm: 0908 123 456 là tài khoản đã có; số khác sẽ tạo tài khoản mới.</p>
            <button
              type="submit"
              disabled={!normalized || busy}
              className="mt-auto h-12 rounded-full bg-brand text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-brand-500 active:scale-[0.98] disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition-all"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Gửi mã OTP
            </button>
          </form>
        )}

        {/* ================= OTP ================= */}
        {step === "otp" && phone && (
          <div className="flex flex-1 flex-col pt-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h1 className="text-[26px] font-extrabold font-display">Nhập mã xác minh</h1>
            <p className="mt-1 text-[13.5px] text-white/60">
              Đã gửi mã 6 số tới <b className="text-white">{formatVnPhone(phone)}</b>
            </p>
            <OtpInput
              value={otp}
              onChange={(v) => {
                setOtp(v);
                setOtpError("");
                if (v.length === 6) void verifyOtp(v);
              }}
              error={!!otpError}
            />
            {otpError && <p className="mt-2 text-[12.5px] text-red-300">{otpError}</p>}
            <p className="mt-3 rounded-xl bg-brand/20 border border-brand-sky/30 px-3 py-2 text-[12px] text-brand-100">
              Bản thử nghiệm: mã OTP là <b className="tracking-widest">{DEMO_OTP}</b>
            </p>
            <button
              onClick={() => resendIn <= 0 && void sendOtp()}
              disabled={resendIn > 0}
              className="mt-4 self-start text-[13px] font-semibold text-brand-sky disabled:text-white/40"
            >
              {resendIn > 0 ? `Gửi lại mã sau ${resendIn}s` : "Gửi lại mã"}
            </button>
            <button
              onClick={() => void verifyOtp(otp)}
              disabled={otp.length !== 6 || busy}
              className="mt-auto h-12 rounded-full bg-brand text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-brand-500 disabled:bg-white/10 disabled:text-white/40"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Xác minh
            </button>
          </div>
        )}

        {/* ================= TÊN (TÀI KHOẢN MỚI) ================= */}
        {step === "name" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void createPhoneAccount();
            }}
            className="flex flex-1 flex-col pt-4 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <span className="self-start rounded-full bg-emerald-400/15 text-emerald-300 px-3 py-1 text-[11.5px] font-bold">✓ Đã xác minh · Tài khoản mới</span>
            <h1 className="mt-3 text-[26px] font-extrabold font-display">Bạn tên là gì?</h1>
            <p className="mt-1 text-[13.5px] text-white/60">Tên hiển thị với bạn tập. Có thể đổi sau trong hồ sơ.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Minh Thư"
              aria-label="Tên hiển thị"
              maxLength={40}
              className="mt-6 h-14 rounded-2xl bg-white/[0.07] border border-white/15 px-4 text-[17px] font-semibold outline-none focus:border-brand-sky placeholder:text-white/30"
            />
            <button
              type="submit"
              disabled={name.trim().length < 2 || busy}
              className="mt-auto h-12 rounded-full bg-brand text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-brand-500 disabled:bg-white/10 disabled:text-white/40"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Tạo tài khoản & thiết lập
            </button>
          </form>
        )}
      </div>

      {/* ================= CHỌN TÀI KHOẢN GOOGLE (mô phỏng) ================= */}
      <BottomSheet
        open={googleOpen}
        onClose={() => {
          setGoogleOpen(false);
          setGoogleNew(false);
        }}
        title="Đăng nhập bằng Google"
        bodyClassName="p-4 pb-7 space-y-3"
      >
        <p className="text-[12px] text-muted-foreground">Chọn tài khoản để tiếp tục tới SYNESIS. (Bản thử nghiệm — bản thật mở cửa sổ Google.)</p>
        {!googleNew ? (
          <>
            <button onClick={() => void googleExisting()} className="w-full flex items-center gap-3 rounded-2xl border border-border p-3 hover:bg-muted text-left">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="" className="h-10 w-10 rounded-full object-cover" />
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-bold text-foreground">Minh Thư</span>
                <span className="block text-[12px] text-muted-foreground">minhthu.run@gmail.com · đã có tài khoản</span>
              </span>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>
            <button onClick={() => setGoogleNew(true)} className="w-full flex items-center gap-3 rounded-2xl border border-dashed border-border p-3 hover:bg-muted text-left">
              <span className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-[18px]">+</span>
              <span className="text-[14px] font-semibold text-foreground">Dùng một tài khoản Google khác</span>
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void googleCreate();
            }}
            className="space-y-2.5"
          >
            <input value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Họ tên" aria-label="Họ tên" className="w-full h-12 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:ring-2 focus:ring-brand/30" />
            <input value={gEmail} onChange={(e) => setGEmail(e.target.value)} placeholder="email@gmail.com" inputMode="email" aria-label="Email Google" className="w-full h-12 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:ring-2 focus:ring-brand/30" />
            <button
              type="submit"
              disabled={!gEmailValid || gName.trim().length < 2 || busy}
              className="w-full h-12 rounded-full bg-brand text-white font-bold text-[14px] hover:bg-brand-700 disabled:bg-neutral-200 disabled:text-neutral-500"
            >
              Tạo tài khoản với Google
            </button>
          </form>
        )}
      </BottomSheet>

      {/* ================= HƯỚNG DẪN NGƯỜI MỚI ================= */}
      <BottomSheet open={guideOpen} onClose={() => setGuideOpen(false)} title="Bắt đầu với SYNESIS" bodyClassName="p-4 pb-7">
        <ol className="space-y-3">
          {[
            ["Chọn Google hoặc Số điện thoại", "Không cần mật khẩu. Tài khoản được tạo tự động ở lần đầu."],
            ["Xác minh", "Google: chọn tài khoản · Số điện thoại: nhập mã OTP 6 số qua SMS."],
            ["Trả lời vài câu hỏi (~2 phút)", "Mục tiêu, loại buổi tập, giờ rảnh, khu vực, tính cách DISC, vibe."],
            ["Cấp quyền & liên kết app", "GPS để ghép trong 3 km, máy ảnh để check-in, Strava/Apple Health/Samsung Health/Hevy để đọc chỉ số."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="h-8 w-8 shrink-0 rounded-full bg-brand text-white font-bold flex items-center justify-center">{i + 1}</span>
              <span>
                <span className="block text-[14px] font-bold text-foreground">{t}</span>
                <span className="block text-[12.5px] text-muted-foreground">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <button onClick={() => setGuideOpen(false)} className="mt-5 w-full h-11 rounded-full bg-brand text-white font-bold text-[14px]">
          Đã hiểu
        </button>
      </BottomSheet>

      {welcomeBack && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#020611]/90 backdrop-blur animate-in fade-in">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <Check className="h-7 w-7 text-emerald-300" />
            </div>
            <p className="mt-3 text-[20px] font-extrabold font-display">Chào mừng trở lại, {welcomeBack}!</p>
          </div>
        </div>
      )}
    </div>
  );
}

function OtpInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error: boolean }) {
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <div className="relative mt-6" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="Mã OTP 6 số"
        className="absolute inset-0 opacity-0"
      />
      <div className="grid grid-cols-6 gap-2" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-14 rounded-2xl border text-[22px] font-extrabold flex items-center justify-center transition-colors",
              error ? "border-red-400 bg-red-500/10" : i === value.length ? "border-brand-sky bg-white/10" : "border-white/15 bg-white/[0.06]"
            )}
          >
            {value[i] ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}
