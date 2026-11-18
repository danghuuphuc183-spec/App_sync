"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowLeft, Check, Loader2, Mail, MapPin, Shield, Smartphone, Sparkles, UserPlus, Users, Watch } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { DEMO_OTP, formatVnPhone, normalizeVnPhone } from "@/features/auth/accounts";

type Step = "welcome" | "phone" | "otp" | "name" | "email" | "register_email" | "register_google";

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
 * Đăng nhập / Đăng ký tài khoản: Google, Số điện thoại (OTP) hoặc Email.
 * - Đăng nhập tài khoản cũ (hoặc tài khoản mẫu): vào thẳng ứng dụng (/).
 * - Đăng ký tài khoản mới: tạo tài khoản và chuyển sang bảng khảo sát cá nhân hoá 10 bước (/bat-dau).
 */
export function AuthFlow() {
  const router = useRouter();
  const { sendPhoneOtp, loginWithPhone, loginWithSocial, loginWithEmail, register } = useAuth();
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login");
  const [step, setStep] = React.useState<Step>("welcome");
  const [phoneInput, setPhoneInput] = React.useState("");
  const [emailInput, setEmailInput] = React.useState("danghuuphuc183@gmail.com");
  const [phone, setPhone] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState("");
  const [otpError, setOtpError] = React.useState("");
  const [resendIn, setResendIn] = React.useState(0);
  const [name, setName] = React.useState("");
  const [regName, setRegName] = React.useState("");
  const [regEmail, setRegEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [guideOpen, setGuideOpen] = React.useState(false);
  const [welcomeBack, setWelcomeBack] = React.useState<string | null>(null);
  const [authError, setAuthError] = React.useState("");
  const [captchaToken, setCaptchaToken] = React.useState("");
  const [captchaKey, setCaptchaKey] = React.useState(0);
  const captchaSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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
    setAuthError("");
    try {
      await sendPhoneOtp(`+84${normalized.slice(1)}`, captchaToken || undefined);
      setCaptchaToken("");
      setCaptchaKey((v) => v + 1);
      setPhone(normalized);
      setOtp("");
      setOtpError("");
      setResendIn(60);
      setStep("otp");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Không gửi được mã OTP. Vui lòng thử lại.");
    } finally {
      if (captchaSiteKey) { setCaptchaToken(""); setCaptchaKey((v) => v + 1); }
      setBusy(false);
    }
  };

  const verifyOtp = async (code: string) => {
    if (!phone || code.length !== 6) return;
    setBusy(true);
    setOtpError("");
    setAuthError("");
    try {
      const existing = await loginWithPhone(`+84${phone.slice(1)}`, code);
      if (existing) {
        goHome("bạn");
      } else {
        setStep("name");
      }
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Mã OTP không hợp lệ hoặc đã hết hạn.");
    } finally {
      setBusy(false);
    }
  };

  const createPhoneAccount = async () => {
    if (!phone || name.trim().length < 2) return;
    setBusy(true);
    setAuthError("");
    try {
      await register({ name: name.trim(), phone: formatVnPhone(phone), provider: "phone" });
      router.push("/bat-dau");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Không tạo được hồ sơ. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const continueWithGoogle = async () => {
    setBusy(true);
    setAuthError("");
    try {
      const ok = await loginWithSocial("google");
      if (ok) goHome("Đặng Hữu Phúc");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Không thể mở đăng nhập Google. Vui lòng thử lại.");
      setBusy(false);
    }
  };

  const handleQuickEmailLogin = async (emailToLogin: string) => {
    setBusy(true);
    setAuthError("");
    try {
      await loginWithEmail(emailToLogin);
      const isOwner = emailToLogin === "danghuuphuc183@gmail.com" || emailToLogin.includes("danghuuphuc");
      if (isOwner) {
        goHome("Đặng Hữu Phúc");
      } else {
        // Nếu là email mới chưa hoàn tất onboarding thì vào /bat-dau, ngược lại vào trang chủ
        goHome(emailToLogin.split("@")[0] || "bạn");
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Không thể đăng nhập bằng email.");
      setBusy(false);
    }
  };

  const createEmailAccount = async () => {
    if (!regName.trim() || !regEmail.includes("@")) return;
    setBusy(true);
    setAuthError("");
    try {
      await register({ name: regName.trim(), email: regEmail.trim(), provider: "email" });
      router.push("/bat-dau");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Không tạo được tài khoản. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const createGoogleAccount = async () => {
    if (!regName.trim() || !regEmail.includes("@")) return;
    setBusy(true);
    setAuthError("");
    try {
      await register({ name: regName.trim(), email: regEmail.trim(), provider: "google" });
      router.push("/bat-dau");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Không tạo được tài khoản Google. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-clip bg-[#020611] text-white">
      <div className="absolute inset-0 intro-grid opacity-60" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-brand/30 blur-[120px]" />

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-8 pt-[max(24px,env(safe-area-inset-top))]">
        {step !== "welcome" && (
          <button
            onClick={() => {
              if (step === "otp") setStep("phone");
              else if (step === "name") setStep("otp");
              else setStep("welcome");
            }}
            aria-label="Quay lại"
            className="h-10 w-10 -ml-2 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {/* ================= MÀN CHÀO & CHỌN PHƯƠNG THỨC ================= */}
        {step === "welcome" && (
          <div className="flex flex-1 flex-col animate-in fade-in duration-500">
            <div className="flex flex-col items-center pt-8">
              <div className="relative welcome-float">
                <div className="absolute inset-0 rounded-3xl bg-brand-sky/40 blur-2xl" />
                <img src="/logo-icon-584.png" alt="SYNESIS" className="relative h-20 w-20 rounded-3xl shadow-xl" />
              </div>
              <p className="mt-3 text-[26px] font-black tracking-[0.14em] font-display">SYN≡SIS</p>
              <h1 className="mt-2 text-center text-title">
                Tìm bạn tập hợp nhịp,
                <br />
                <span className="bg-gradient-to-r from-brand-sky to-white bg-clip-text text-transparent">giữ kỷ luật cùng nhau</span>
              </h1>
            </div>

            {/* Các tiện ích cốt lõi */}
            <ul className="mt-5 space-y-2">
              {[
                [MapPin, "Ghép bạn tập trong bán kính 3 km, trùng giờ rảnh"],
                [Users, "Hợp môn tập, cường độ, phong cách giao tiếp và vibe"],
                [Watch, "Đồng bộ Strava, Apple Health, Samsung Health, Hevy"],
                [Shield, "Điểm uy tín chống bùng kèo, tuỳ chọn chỉ ghép cùng giới"],
              ].map(([Icon, text], i) => {
                const I = Icon as typeof MapPin;
                return (
                  <li key={i} className="flex items-center gap-2.5 rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 backdrop-blur">
                    <span className="h-7 w-7 shrink-0 rounded-lg bg-brand/30 flex items-center justify-center">
                      <I className="h-3.5 w-3.5 text-brand-sky" />
                    </span>
                    <span className="text-xs text-white/90">{text as string}</span>
                  </li>
                );
              })}
            </ul>

            {/* Thanh chuyển đổi [ Đăng nhập ] / [ Đăng ký tài khoản mới ] */}
            <div className="mt-6 p-1 rounded-xl bg-white/[0.08] border border-white/10 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-label font-bold transition-all text-center flex items-center justify-center gap-1.5",
                  authMode === "login"
                    ? "bg-brand text-white shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-label font-bold transition-all text-center flex items-center justify-center gap-1.5",
                  authMode === "register"
                    ? "bg-gradient-to-r from-emerald-500 to-brand text-white shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Đăng ký mới</span>
              </button>
            </div>

            {/* Khối hành động tương ứng với tab */}
            <div className="mt-4 space-y-2.5 pt-1">
              {authMode === "login" ? (
                <>
                  {/* Nút xác nhận nhanh tài khoản Gmail danghuuphuc183@gmail.com */}
                  <button
                    type="button"
                    onClick={() => void handleQuickEmailLogin("danghuuphuc183@gmail.com")}
                    disabled={busy}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-brand-sky/20 to-brand/20 border border-emerald-400/40 text-white flex items-center justify-between text-left hover:border-emerald-400 active:scale-[0.98] transition-all shadow-md"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <div className="min-w-0">
                        <p className="text-caption font-bold text-emerald-300">Tài khoản Google mẫu</p>
                        <p className="text-label font-extrabold text-white truncate">danghuuphuc183@gmail.com</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-md bg-white/10 text-brand-sky">
                      Xác nhận vào →
                    </span>
                  </button>

                  <button
                    onClick={() => void continueWithGoogle()}
                    disabled={busy}
                    className="w-full h-11 rounded-lg bg-white text-black font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-neutral-100 active:scale-[0.98] transition-all"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />} Tiếp tục với Google
                  </button>

                  <button
                    onClick={() => setStep("phone")}
                    className="w-full h-11 rounded-lg bg-brand text-white font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-brand-500 active:scale-[0.98] transition-all shadow-lg shadow-brand/30"
                  >
                    <Smartphone className="h-4 w-4" /> Tiếp tục bằng số điện thoại
                  </button>

                  <button
                    onClick={() => setStep("email")}
                    className="w-full py-1 text-center text-xs font-semibold text-white/70 hover:text-white transition-colors"
                  >
                    Hoặc đăng nhập bằng Email khác
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className="text-xs text-white/75 hover:text-white"
                    >
                      Chưa có tài khoản? <span className="font-bold text-brand-sky underline underline-offset-2">Đăng ký mới tại đây</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-brand/20 border border-brand-sky/30 text-xs text-brand-100 leading-relaxed">
                    ✨ <b>Tài khoản mới:</b> Sau khi đăng ký, hệ thống sẽ mở bảng <b>khảo sát 10 câu hỏi (~2 phút)</b> để thiết lập môn tập, giờ rảnh và khu vực bạn muốn ghép.
                  </div>

                  <button
                    onClick={() => {
                      setRegName("");
                      setRegEmail("");
                      setStep("register_google");
                    }}
                    disabled={busy}
                    className="w-full h-11 rounded-lg bg-white text-black font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-neutral-100 active:scale-[0.98] transition-all"
                  >
                    <GoogleIcon /> Đăng ký với Google
                  </button>

                  <button
                    onClick={() => setStep("phone")}
                    className="w-full h-11 rounded-lg bg-brand text-white font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-brand-500 active:scale-[0.98] transition-all shadow-lg shadow-brand/30"
                  >
                    <Smartphone className="h-4 w-4" /> Đăng ký bằng số điện thoại
                  </button>

                  <button
                    onClick={() => {
                      setRegName("");
                      setRegEmail("");
                      setStep("register_email");
                    }}
                    className="w-full h-11 rounded-lg bg-white/[0.08] border border-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/15 active:scale-[0.98] transition-all"
                  >
                    <Mail className="h-4 w-4 text-emerald-400" /> Đăng ký bằng Email
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-xs text-white/75 hover:text-white"
                    >
                      Đã có tài khoản? <span className="font-bold text-brand-sky underline underline-offset-2">Đăng nhập tại đây</span>
                    </button>
                  </div>
                </>
              )}

              <button onClick={() => setGuideOpen(true)} className="w-full text-center text-xs font-bold text-brand-sky pt-1">
                Người mới? Xem 4 bước bắt đầu
              </button>
              <p className="text-center text-caption text-white/40">
                Tiếp tục nghĩa là bạn đồng ý Điều khoản sử dụng & Chính sách quyền riêng tư của SYNESIS.
              </p>
            </div>
            {authError && <p role="alert" className="mt-3 text-center text-xs text-red-300">{authError}</p>}
          </div>
        )}

        {/* ================= ĐĂNG KÝ MỚI VỚI GOOGLE ================= */}
        {step === "register_google" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void createGoogleAccount();
            }}
            className="flex flex-1 flex-col pt-4 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <Sparkles className="h-3.5 w-3.5" /> Tạo tài khoản mới & thiết lập hồ sơ
            </div>
            <h1 className="mt-3 text-title">Đăng ký với Google</h1>
            <p className="mt-1 text-label text-white/60">
              Nhập tên và địa chỉ Gmail để bắt đầu. Hệ thống sẽ chuyển tiếp đến bảng khảo sát 10 câu hỏi để cá nhân hoá bạn tập.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-white/70">Họ và tên hiển thị</span>
                <input
                  autoFocus
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  required
                  className="mt-1.5 w-full rounded-xl bg-white/[0.07] border border-white/15 px-4 h-12 text-body font-semibold outline-none focus:border-brand-sky placeholder:text-white/30"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-white/70">Địa chỉ Gmail</span>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tenbantam@gmail.com"
                  required
                  className="mt-1.5 w-full rounded-xl bg-white/[0.07] border border-white/15 px-4 h-12 text-body font-semibold outline-none focus:border-brand-sky placeholder:text-white/30"
                />
              </label>
            </div>

            {authError && <p role="alert" className="mt-3 text-xs text-red-300">{authError}</p>}

            <button
              type="submit"
              disabled={regName.trim().length < 2 || !regEmail.includes("@") || busy}
              className="mt-auto h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-brand text-white font-bold text-body flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition-all"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
              Tiếp tục đến khảo sát thiết lập (10 bước) →
            </button>
          </form>
        )}

        {/* ================= ĐĂNG KÝ MỚI VỚI EMAIL ================= */}
        {step === "register_email" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void createEmailAccount();
            }}
            className="flex flex-1 flex-col pt-4 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <UserPlus className="h-3.5 w-3.5" /> Tạo tài khoản mới & thiết lập hồ sơ
            </div>
            <h1 className="mt-3 text-title">Đăng ký bằng Email</h1>
            <p className="mt-1 text-label text-white/60">
              Nhập họ tên và địa chỉ email của bạn để thiết lập tài khoản mới và trả lời khảo sát bạn tập.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-white/70">Họ và tên</span>
                <input
                  autoFocus
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="VD: Hoàng Long"
                  required
                  className="mt-1.5 w-full rounded-xl bg-white/[0.07] border border-white/15 px-4 h-12 text-body font-semibold outline-none focus:border-brand-sky placeholder:text-white/30"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-white/70">Địa chỉ Email</span>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="hoanglong@example.com"
                  required
                  className="mt-1.5 w-full rounded-xl bg-white/[0.07] border border-white/15 px-4 h-12 text-body font-semibold outline-none focus:border-brand-sky placeholder:text-white/30"
                />
              </label>
            </div>

            {authError && <p role="alert" className="mt-3 text-xs text-red-300">{authError}</p>}

            <button
              type="submit"
              disabled={regName.trim().length < 2 || !regEmail.includes("@") || busy}
              className="mt-auto h-12 rounded-lg bg-brand text-white font-bold text-body flex items-center justify-center gap-2 hover:bg-brand-500 active:scale-[0.98] disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition-all"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
              Tiếp tục đến khảo sát thiết lập (10 bước) →
            </button>
          </form>
        )}

        {/* ================= ĐĂNG NHẬP EMAIL CŨ ================= */}
        {step === "email" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (emailInput.trim()) void handleQuickEmailLogin(emailInput.trim());
            }}
            className="flex flex-1 flex-col pt-4 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <h1 className="text-title">Email của bạn</h1>
            <p className="mt-1 text-label text-white/60">Nhập địa chỉ email / Gmail để nhận diện và xác nhận hồ sơ thể thao của bạn.</p>
            <label className="mt-6 flex items-center gap-2 rounded-2xl bg-white/[0.07] border border-white/15 px-4 h-14 focus-within:border-brand-sky">
              <input
                autoFocus
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="danghuuphuc183@gmail.com"
                aria-label="Địa chỉ email"
                className="flex-1 bg-transparent text-base font-semibold tracking-wide outline-none placeholder:text-white/30"
              />
              {emailInput.includes("@") && <Check className="h-5 w-5 text-emerald-400" />}
            </label>
            {authError && <p role="alert" className="mt-3 text-xs text-red-300">{authError}</p>}
            <button
              type="submit"
              disabled={!emailInput.includes("@") || busy}
              className="mt-auto h-12 rounded-lg bg-brand text-white font-bold text-body flex items-center justify-center gap-2 hover:bg-brand-500 active:scale-[0.98] disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition-all"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Xác nhận & Vào hồ sơ
            </button>
          </form>
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
            <h1 className="text-title">Số điện thoại của bạn</h1>
            <p className="mt-1 text-label text-white/60">Chúng tôi sẽ gửi mã xác minh 6 số qua SMS. Dùng để đăng nhập và tạo tài khoản mới.</p>
            <label className="mt-6 flex items-center gap-2 rounded-2xl bg-white/[0.07] border border-white/15 px-4 h-14 focus-within:border-brand-sky">
              <span className="shrink-0 whitespace-nowrap text-body font-semibold text-white/80">🇻🇳 +84</span>
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
              {normalized && <Check className="h-5 w-5 text-white" />}
            </label>
            {phoneInput && !normalized && <p className="mt-2 text-xs text-amber-300">Số di động Việt Nam gồm 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09.</p>}
            <p className="mt-3 text-caption text-white/45">Bản thử nghiệm: 0908 123 456 là tài khoản đã có; số khác sẽ tạo tài khoản mới.</p>
            {captchaSiteKey && <div className="mt-4"><Turnstile key={captchaKey} siteKey={captchaSiteKey} onSuccess={setCaptchaToken} onExpire={() => setCaptchaToken("")} onError={() => { setCaptchaToken(""); setAuthError("Không xác minh được bảo mật. Vui lòng tải lại trang."); }} /></div>}
            {authError && <p role="alert" className="mt-3 text-xs text-red-300">{authError}</p>}
            <button
              type="submit"
              disabled={!normalized || busy}
              className="mt-auto h-12 rounded-lg bg-brand text-white font-bold text-body flex items-center justify-center gap-2 hover:bg-brand-500 active:scale-[0.98] disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition-all"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Gửi mã OTP
            </button>
          </form>
        )}

        {/* ================= OTP ================= */}
        {step === "otp" && phone && (
          <div className="flex flex-1 flex-col pt-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h1 className="text-title">Nhập mã xác minh</h1>
            <p className="mt-1 text-label text-white/60">
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
            {otpError && <p className="mt-2 text-xs text-red-300">{otpError}</p>}
            <p className="mt-3 rounded-xl bg-brand/20 border border-brand-sky/30 px-3 py-2 text-xs text-brand-100">
              Bản thử nghiệm: mã OTP là <b className="tracking-widest">{DEMO_OTP}</b>
            </p>
            {authError && <p role="alert" className="mt-3 text-xs text-red-300">{authError}</p>}
            <button
              onClick={() => resendIn <= 0 && void sendOtp()}
              disabled={resendIn > 0}
              className="mt-4 self-start text-label font-semibold text-brand-sky disabled:text-white/40"
            >
              {resendIn > 0 ? `Gửi lại mã sau ${resendIn}s` : "Gửi lại mã"}
            </button>
            <button
              onClick={() => void verifyOtp(otp)}
              disabled={otp.length !== 6 || busy}
              className="mt-auto h-12 rounded-lg bg-brand text-white font-bold text-body flex items-center justify-center gap-2 hover:bg-brand-500 disabled:bg-white/10 disabled:text-white/40"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Xác minh
            </button>
          </div>
        )}

        {/* ================= TÊN (TÀI KHOẢN MỚI TỪ SỐ ĐIỆN THOẠI) ================= */}
        {step === "name" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void createPhoneAccount();
            }}
            className="flex flex-1 flex-col pt-4 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <span className="self-start rounded-lg bg-emerald-400/15 text-emerald-300 px-3 py-1 text-caption font-bold">✓ Đã xác minh · Tài khoản mới</span>
            <h1 className="mt-3 text-title">Bạn tên là gì?</h1>
            <p className="mt-1 text-label text-white/60">Tên hiển thị với bạn tập. Hệ thống sẽ dẫn bạn đến bảng khảo sát 10 câu hỏi để tìm bạn tập phù hợp.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Minh Thư"
              aria-label="Tên hiển thị"
              maxLength={40}
              className="mt-6 h-14 rounded-2xl bg-white/[0.07] border border-white/15 px-4 text-[17px] font-semibold outline-none focus:border-brand-sky placeholder:text-white/30"
            />
            {authError && <p role="alert" className="mt-3 text-xs text-red-300">{authError}</p>}
            <button
              type="submit"
              disabled={name.trim().length < 2 || busy}
              className="mt-auto h-12 rounded-lg bg-brand text-white font-bold text-body flex items-center justify-center gap-2 hover:bg-brand-500 disabled:bg-white/10 disabled:text-white/40"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Tạo tài khoản & thiết lập (10 bước) →
            </button>
          </form>
        )}
      </div>

      {/* ================= HƯỚNG DẪN NGƯỜI MỚI ================= */}
      {guideOpen && (
        <div role="dialog" aria-label="Bắt đầu với SYNESIS" className="fixed inset-0 z-[1200] flex items-end bg-black/70 p-4" onClick={() => setGuideOpen(false)}>
          <div className="w-full rounded-3xl bg-white p-5 text-black" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[17px] font-extrabold mb-4 font-display">4 bước bắt đầu với SYNESIS</h3>
            <ol className="space-y-3">
              {[
                ["Chọn Google, Số điện thoại hoặc Email", "Đăng nhập nhanh nếu đã có tài khoản, hoặc chọn Đăng ký mới."],
                ["Xác minh tài khoản", "Google/Email: chọn hoặc xác nhận email · Số điện thoại: nhận mã OTP 6 số."],
                ["Trả lời khảo sát cá nhân hoá (10 bước ~2 phút)", "Mục tiêu, môn tập, loại bài tập, cường độ, lịch rảnh, khu vực, cách giao tiếp và vibe."],
                ["Nhận gợi ý bạn tập chuẩn nhịp", "Hệ thống ghép đôi chính xác trong bán kính 3 km, cùng môn, hợp giờ rảnh."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="h-8 w-8 shrink-0 rounded-full bg-brand text-white font-bold flex items-center justify-center text-sm">{i + 1}</span>
                  <span>
                    <span className="block text-sm font-bold text-foreground">{t}</span>
                    <span className="block text-xs text-muted-foreground">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <button onClick={() => setGuideOpen(false)} className="mt-5 w-full h-11 rounded-lg bg-brand text-white font-bold text-sm">
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {welcomeBack && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#020611]/90 backdrop-blur animate-in fade-in">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-white/10 flex items-center justify-center">
              <Check className="h-7 w-7 text-white" />
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
