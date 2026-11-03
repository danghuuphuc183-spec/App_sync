"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, MessageCircle, Sparkles, LogOut, User, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export function PublicHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto flex h-14 items-center justify-between px-3 relative">
        {/* LEFT ZONE: 2 balanced action icons (Cân đối bên trái: 76px) */}
        <div className="flex items-center gap-1 z-10 w-[76px] justify-start">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-95"
            title="Lên kèo thể thao mới"
            aria-label="Lên kèo mới"
          >
            <Link href="/len-keo">
              <Plus className="h-5 w-5 stroke-[2.2]" />
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-amber-500 hover:text-amber-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-95"
            title="Khám phá chế độ tập luyện & Khảo sát AI"
            aria-label="Khảo sát AI"
          >
            <Link href="/onboarding">
              <Sparkles className="h-4.5 w-4.5 stroke-[2]" />
            </Link>
          </Button>
        </div>

        {/* CENTER ZONE: Logo chính giữa (Chính giữa tuyệt đối với absolute) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto z-10">
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none transition-transform active:scale-98 select-none"
            title="Trang chủ SYNC SPORT - SYNESIS"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <Image
                src="/logo-icon-128.png"
                alt="SYNESIS SYNC Logo"
                width={34}
                height={34}
                unoptimized
                className="h-[34px] w-[34px] rounded-xl shadow-xs ring-1 ring-black/5 dark:ring-white/10 object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[14.5px] font-black tracking-tight text-[#000f22] dark:text-white leading-none uppercase font-mono">
                SYNC SPORT
              </span>
              <span className="text-[8.5px] font-extrabold text-sky-600 dark:text-sky-400 tracking-[0.18em] uppercase leading-none mt-1">
                SYN≡SIS
              </span>
            </div>
          </Link>
        </div>

        {/* RIGHT ZONE: Balanced action & Auth Gateway (Cân đối bên phải: 76px) */}
        <div className="flex items-center gap-1.5 z-10 w-[76px] justify-end" ref={menuRef}>
          {isAuthenticated ? (
            <>
              {/* Direct Message Chat Icon */}
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl relative text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-95"
                aria-label="Tin nhắn đồng đội"
                title="Tin nhắn đồng đội"
              >
                <Link href="/chat">
                  <MessageCircle className="h-4.5 w-4.5 stroke-[1.9]" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                </Link>
              </Button>

              {/* User Avatar with Quick Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="h-8 w-8 rounded-full ring-2 ring-[#80aad3]/40 overflow-hidden relative focus:outline-none active:scale-95 transition-all shadow-xs"
                  title="Tài khoản VĐV"
                  aria-label="Tài khoản"
                >
                  <Image
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={user?.name || "VĐV"}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-border shadow-xl p-3 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/60">
                      <Image
                        src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                        alt={user?.name || "VĐV"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">{user?.name || "Minh Thư"}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{user?.email || user?.phone || "minhthu@runner.vn"}</div>
                        <div className="flex items-center gap-1 text-[9.5px] text-emerald-600 font-bold mt-0.5">
                          <ShieldCheck className="h-3 w-3" />
                          <span>TrustScore: {user?.trustScore || 98}/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="py-2 space-y-1 text-xs">
                      <Link
                        href="/ho-so"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-muted text-foreground transition-colors font-medium"
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Hồ sơ vận động viên</span>
                      </Link>

                      <Link
                        href="/onboarding"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-muted text-[#1b3554] dark:text-[#80aad3] transition-colors font-medium"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>Khảo sát cá nhân hóa AI</span>
                      </Link>

                      <Link
                        href="/ho-so"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-muted text-foreground transition-colors font-medium"
                      >
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Quyền riêng tư & Cảm biến</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-red-600 hover:bg-red-500/10 text-xs font-bold transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              className="h-8 px-2.5 rounded-xl bg-[#1b3554] hover:bg-[#122338] text-white text-[11px] font-bold shadow-xs active:scale-95"
            >
              <Link href="/dang-nhap">
                <span>Đăng nhập</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
