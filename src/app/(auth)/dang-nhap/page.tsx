"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowRight,
  Fingerprint,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Activity,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithPhone, loginWithSocial, register } = useAuth();

  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [authType, setAuthType] = React.useState<"password" | "otp">("password");

  // Form states
  const [accountInput, setAccountInput] = React.useState(""); // Số di động hoặc email (Facebook style)
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [otpCode, setOtpCode] = React.useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Determine if accountInput is phone or email
  const isPhoneNumber = /^[0-9+ ]+$/.test(accountInput.trim());

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`fb-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSendOtp = () => {
    if (!accountInput.trim()) {
      setErrorMsg("Vui lòng nhập số di động hoặc email");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsOtpSent(true);
      setAuthType("otp");
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!accountInput.trim()) {
      setErrorMsg("Vui lòng nhập số di động hoặc email");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        if (isPhoneNumber) {
          await loginWithPhone(accountInput, otpCode.join(""));
        } else {
          await loginWithEmail(accountInput, password);
        }
        router.push("/");
      } else {
        // Đăng ký mới -> chuyển tiếp tới Onboarding thể thao (như Strava)
        await register({
          name: fullName || "Vận Động Viên",
          email: !isPhoneNumber ? accountInput : undefined,
          phone: isPhoneNumber ? accountInput : undefined,
          provider: isPhoneNumber ? "phone" : "email",
        });
        router.push("/onboarding");
      }
    } catch {
      setErrorMsg("Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "facebook" | "google" | "apple" | "strava") => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      await loginWithSocial(provider);
      if (mode === "register") {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    } catch {
      setErrorMsg("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-center min-h-[90vh] py-6 px-3">
      {/* BRAND HEADER */}
      <div className="flex flex-col items-center text-center mb-5">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2 group">
          <Image
            src="/logo-icon-128.png"
            alt="SYNESIS Logo"
            width={44}
            height={44}
            unoptimized
            className="h-11 w-11 rounded-2xl shadow-sm object-contain group-hover:scale-105 transition-transform"
            priority
          />
          <div className="flex flex-col text-left">
            <span className="text-base font-black tracking-tight text-[#000f22] dark:text-white font-mono leading-none">
              SYNC SPORT
            </span>
            <span className="text-[9.5px] font-extrabold text-sky-600 dark:text-sky-400 tracking-[0.2em] leading-none mt-1">
              SYN≡SIS
            </span>
          </div>
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">
          {mode === "login"
            ? "Đăng nhập để kết nối bạn tập và đồng bộ dữ liệu"
            : "Tạo tài khoản để cá nhân hóa lộ trình tập luyện"}
        </p>
      </div>

      {/* MAIN AUTH CARD (Facebook-style minimalism & clean edges) */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-md p-5 space-y-4">
        {/* Error notification */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full name input for registration */}
          {mode === "register" && (
            <div>
              <Input
                type="text"
                placeholder="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl text-xs bg-background border-border/80 focus:border-[#1b3554] font-medium"
                required
              />
            </div>
          )}

          {/* Facebook-style universal account input */}
          <div>
            <Input
              type="text"
              placeholder="Số di động hoặc email"
              value={accountInput}
              onChange={(e) => setAccountInput(e.target.value)}
              className="h-11 rounded-xl text-xs bg-background border-border/80 focus:border-[#1b3554] font-medium"
              required
            />
          </div>

          {/* Password or OTP Input */}
          {authType === "password" ? (
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-10 rounded-xl text-xs bg-background border-border/80 focus:border-[#1b3554]"
                required={mode === "register" || !isOtpSent}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-foreground">Mã xác nhận (OTP)</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Thử: 123456</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`fb-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-full h-10 text-center font-mono font-bold text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-[#1b3554] focus:outline-hidden"
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                <button
                  type="button"
                  onClick={() => setAuthType("password")}
                  className="text-primary hover:underline"
                >
                  Dùng mật khẩu
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-primary hover:underline font-semibold"
                >
                  Gửi lại mã
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-bold text-xs bg-[#1b3554] dark:bg-[#c0e6fd] text-white dark:text-[#000f22] hover:opacity-90 transition-all shadow-sm active:scale-98"
          >
            {isLoading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản mới"}
          </Button>

          {/* Secondary helper links */}
          {mode === "login" && (
            <div className="flex items-center justify-between pt-0.5 text-[11.5px]">
              <button
                type="button"
                onClick={() => {
                  if (authType === "password") {
                    handleSendOtp();
                  } else {
                    setAuthType("password");
                  }
                }}
                className="text-muted-foreground hover:text-foreground text-[11px]"
              >
                {authType === "password" ? "Đăng nhập bằng mã OTP" : "Đăng nhập bằng mật khẩu"}
              </button>
              <Link href="#" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>
          )}
        </form>

        {/* FACEBOOK STYLE DIVIDER */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-[11px] text-muted-foreground">
            <span className="bg-card px-3">hoặc</span>
          </div>
        </div>

        {/* SOCIAL & FITNESS INTEGRATIONS (Facebook, Apple, Google, Strava) */}
        <div className="space-y-2">
          {/* 1. Facebook Login Button (Official Facebook Blue) */}
          <button
            type="button"
            onClick={() => handleSocialAuth("facebook")}
            disabled={isLoading}
            className="w-full h-10 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-98"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Tiếp tục với Facebook</span>
          </button>

          {/* 2. Apple Sign-In & Apple Health */}
          <button
            type="button"
            onClick={() => handleSocialAuth("apple")}
            disabled={isLoading}
            className="w-full h-10 px-3 rounded-xl bg-black hover:bg-neutral-900 text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-98"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.59-7.7-11.72-13.98-5.34-8.08-9.61-17.38-12.82-27.91-3.21-10.53-4.83-20.91-4.83-31.14 0-13.46 3.46-24.89 10.37-34.28 6.91-9.39 15.66-14.21 26.25-14.46 4.7 0 9.87 1.25 15.5 3.75 5.63 2.5 9.4 3.86 11.31 4.08 1.52-.33 5.48-1.79 11.87-4.38 6.39-2.59 11.96-3.72 16.71-3.39 12.39.87 22.37 5.76 29.93 14.67-10.87 6.53-16.19 15.66-15.96 27.4.22 9.14 3.79 16.86 10.71 23.16 6.92 6.3 15.12 10.02 24.6 11.16-2.17 6.31-4.78 12.83-7.83 19.57zM119.22 31.84c0-7.18 2.61-13.92 7.83-20.22 5.22-6.3 11.63-10.44 19.24-12.42.43 2.18.65 4.14.65 5.88 0 7.29-2.72 14.14-8.16 20.56-5.44 6.42-12.07 10.44-19.89 12.08-.22-1.96-.33-3.92-.33-5.88z" />
            </svg>
            <span>Đăng nhập bằng Apple</span>
          </button>

          {/* 3. Strava Connection Button (Official Strava Orange) */}
          <button
            type="button"
            onClick={() => handleSocialAuth("strava")}
            disabled={isLoading}
            className="w-full h-10 px-3 rounded-xl bg-[#FC4C02] hover:bg-[#e04300] text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-98"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.92 15.602h4.172" />
            </svg>
            <span>Kết nối tài khoản Strava</span>
          </button>

          {/* 4. Google Sign-In */}
          <button
            type="button"
            onClick={() => handleSocialAuth("google")}
            disabled={isLoading}
            className="w-full h-10 px-3 rounded-xl border border-border/80 hover:bg-muted/60 text-foreground text-xs font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-98"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>
        </div>

        {/* FACEBOOK STYLE BOTTOM SWITCH (Create New Account Button) */}
        <div className="pt-2">
          {mode === "login" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode("register");
                setErrorMsg("");
              }}
              className="w-full h-11 rounded-xl font-bold text-xs border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-98"
            >
              Tạo tài khoản mới
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
              }}
              className="w-full h-11 rounded-xl font-bold text-xs border-border hover:bg-muted transition-all active:scale-98"
            >
              Bạn đã có tài khoản? Đăng nhập
            </Button>
          )}
        </div>
      </div>

      {/* FOOTER & PRIVACY */}
      <div className="mt-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Mã hóa bảo mật 256-bit • Tiêu chuẩn PDP 2026</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-[10.5px] text-muted-foreground/80">
          <Link href="/" className="hover:underline">
            Xem với tư cách Khách
          </Link>
          <span>•</span>
          <Link href="#" className="hover:underline">
            Quyền riêng tư
          </Link>
          <span>•</span>
          <Link href="#" className="hover:underline">
            Điều khoản
          </Link>
        </div>
      </div>
    </div>
  );
}
