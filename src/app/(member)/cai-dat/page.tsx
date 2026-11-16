"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Phone,
  UserX,
  Users,
  Activity,
  Heart,
  Eye,
  Wallet,
  HelpCircle,
  AlertTriangle,
  FileText,
  LogOut,
  Trash2,
  X,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Switch toggles state
  const [shareLocationOnArrival, setShareLocationOnArrival] = React.useState(true);
  const [connectAppleHealth, setConnectAppleHealth] = React.useState(false);
  const [remindBefore31Min, setRemindBefore31Min] = React.useState(true);
  const [notifyNewKeoMatch, setNotifyNewKeoMatch] = React.useState(true);
  const [notifyStreakAndCoinsExpiring, setNotifyStreakAndCoinsExpiring] = React.useState(false);

  // Modals state
  const [activeModal, setActiveModal] = React.useState<string | null>(null);

  // Editable settings
  const [phoneNumber, setPhoneNumber] = React.useState("0908 123 321");
  const [selectedSportBand, setSelectedSportBand] = React.useState("Chạy R2 · Gym S1");
  const [defaultVibe, setDefaultVibe] = React.useState("Friendly");
  const [genderPref, setGenderPref] = React.useState("Riêng tư");
  const [radiusKm, setRadiusKm] = React.useState(3);
  const [freeHours, setFreeHours] = React.useState("Sáng · Chiều");
  const [profileVisibility, setProfileVisibility] = React.useState("Sau khi chấp nhận kèo");

  // Blocked users sample
  const [blockedList, setBlockedList] = React.useState([
    { id: "b1", name: "Trần Hùng (Spam kèo)", date: "12/10/2026" },
    { id: "b2", name: "Nguyễn Vũ (Hủy phút chót)", date: "02/11/2026" },
  ]);

  const userName = user?.name || "Minh Thư";
  const userInitials = userName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(-2)
    .join("")
    .toUpperCase() || "MT";

  const closeModal = () => setActiveModal(null);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background pb-24 max-w-md mx-auto text-foreground selection:bg-brand/20">
      {/* 1. TOP HEADER: < Cài đặt */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50 px-3 py-3 flex items-center justify-between">
        <Link
          href="/ho-so"
          className="inline-flex items-center gap-1.5 text-foreground hover:text-brand font-semibold text-base transition-colors group active:scale-95"
        >
          <ChevronLeft className="h-5 w-5 text-foreground group-hover:-translate-x-0.5 transition-transform" />
          <span>Cài đặt</span>
        </Link>
        <span className="text-xs font-mono text-muted-foreground">SYNESIS v0.2</span>
      </div>

      <div className="p-3.5 space-y-4">
        {/* 2. PROFILE BANNER ITEM */}
        <button
          type="button"
          onClick={() => router.push("/ho-so")}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-brand/40 active:scale-[0.99] transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand/10 dark:bg-brand/25 text-brand dark:text-brand-sky font-black text-sm flex items-center justify-center shrink-0 border border-brand/20">
              {user?.avatar ? (
                <img src={user.avatar} alt={userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-foreground truncate">{userName}</h2>
              <p className="text-xs text-muted-foreground">Tài khoản đã xác thực · 18+</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>

        {/* SECTION 1: TÀI KHOẢN & AN TOÀN */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-muted-foreground px-1">Tài khoản & an toàn</h3>
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-xs">
            {/* Số điện thoại */}
            <button
              type="button"
              onClick={() => setActiveModal("phone")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Số điện thoại</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <span>09•• ••• 321</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </button>

            {/* Xác thực danh tính */}
            <button
              type="button"
              onClick={() => setActiveModal("kyc")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Xác thực danh tính</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Khi cần</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </button>

            {/* Người liên hệ tin cậy */}
            <button
              type="button"
              onClick={() => setActiveModal("emergency")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Người liên hệ tin cậy</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <span className="px-1.5 py-0.5 rounded-full bg-brand/10 text-brand font-bold text-[11px]">1</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </button>

            {/* Danh sách chặn */}
            <button
              type="button"
              onClick={() => setActiveModal("blocked")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Danh sách chặn</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold text-[11px]">
                  {blockedList.length}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 2: TẬP LUYỆN */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-muted-foreground px-1">Tập luyện</h3>
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-xs">
            {/* Môn & band */}
            <button
              type="button"
              onClick={() => setActiveModal("sportBand")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Môn & band</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/90">{selectedSportBand}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </button>

            {/* VIBE mặc định */}
            <button
              type="button"
              onClick={() => setActiveModal("vibe")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">VIBE mặc định</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-brand dark:text-brand-sky">{defaultVibe}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </button>

            {/* Ưu tiên giới tính */}
            <button
              type="button"
              onClick={() => setActiveModal("gender")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Ưu tiên giới tính</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{genderPref}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </button>

            {/* Spot & bán kính */}
            <button
              type="button"
              onClick={() => setActiveModal("radius")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Spot & bán kính</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{radiusKm} km</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </button>

            {/* Giờ rảnh */}
            <button
              type="button"
              onClick={() => setActiveModal("freeHours")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Giờ rảnh</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{freeHours}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 3: QUYỀN RIÊNG TƯ & DỮ LIỆU */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-muted-foreground px-1">Quyền riêng tư & dữ liệu</h3>
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-xs">
            {/* Ai xem được hồ sơ */}
            <button
              type="button"
              onClick={() => setActiveModal("privacyVisibility")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Ai xem được hồ sơ</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="truncate max-w-[140px]">{profileVisibility}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              </div>
            </button>

            {/* Chia sẻ vị trí khi đến Spot (Toggle) */}
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="pr-2">
                <span className="text-xs font-medium text-foreground block">Chia sẻ vị trí khi đến Spot</span>
                <span className="text-[10px] text-muted-foreground">Tự động kích hoạt trong bán kính 300m</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={shareLocationOnArrival}
                onClick={() => setShareLocationOnArrival(!shareLocationOnArrival)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  shareLocationOnArrival ? "bg-brand" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    shareLocationOnArrival ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Kết nối Apple Health / Health Connect (Toggle) */}
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="pr-2">
                <span className="text-xs font-medium text-foreground block">Kết nối Apple Health / Health Connect</span>
                <span className="text-[10px] text-muted-foreground">Đồng bộ bước chân và nhịp tim</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={connectAppleHealth}
                onClick={() => {
                  setConnectAppleHealth(!connectAppleHealth);
                  if (!connectAppleHealth) {
                    alert("Đã kết nối Apple Health / Health Connect thành công. Dữ liệu tập luyện sẽ tự động đồng bộ.");
                  }
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  connectAppleHealth ? "bg-brand" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    connectAppleHealth ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Quản lý sự đồng ý */}
            <button
              type="button"
              onClick={() => setActiveModal("consent")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Quản lý sự đồng ý</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </button>

            {/* Tải xuống dữ liệu của tôi */}
            <button
              type="button"
              onClick={() => setActiveModal("exportData")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Tải xuống dữ liệu của tôi</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </button>
          </div>
        </div>

        {/* SECTION 4: THÔNG BÁO */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-muted-foreground px-1">Thông báo</h3>
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-xs">
            {/* Nhắc xác nhận trước 31 phút */}
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="pr-2">
                <span className="text-xs font-medium text-foreground block">Nhắc xác nhận trước 31 phút</span>
                <span className="text-[10px] text-muted-foreground">Theo quy chuẩn cọc 0đ của SYNESIS</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={remindBefore31Min}
                onClick={() => setRemindBefore31Min(!remindBefore31Min)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  remindBefore31Min ? "bg-brand" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    remindBefore31Min ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Kèo mới phù hợp */}
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="pr-2">
                <span className="text-xs font-medium text-foreground block">Kèo mới phù hợp</span>
                <span className="text-[10px] text-muted-foreground">Thông báo khi có bạn tập cùng band ở gần</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifyNewKeoMatch}
                onClick={() => setNotifyNewKeoMatch(!notifyNewKeoMatch)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  notifyNewKeoMatch ? "bg-brand" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    notifyNewKeoMatch ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Chuỗi & Xu sắp hết hạn */}
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="pr-2">
                <span className="text-xs font-medium text-foreground block">Chuỗi & Xu sắp hết hạn</span>
                <span className="text-[10px] text-muted-foreground">Cảnh báo đứt chuỗi tuần và mất xu thưởng</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifyStreakAndCoinsExpiring}
                onClick={() => setNotifyStreakAndCoinsExpiring(!notifyStreakAndCoinsExpiring)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  notifyStreakAndCoinsExpiring ? "bg-brand" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    notifyStreakAndCoinsExpiring ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: XU & THANH TOÁN */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-muted-foreground px-1">Xu & thanh toán</h3>
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-xs">
            {/* Phương thức thanh toán */}
            <button
              type="button"
              onClick={() => setActiveModal("paymentMethod")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Phương thức thanh toán</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-brand dark:text-brand-sky">VietQR</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </button>

            {/* Lịch sử giao dịch */}
            <button
              type="button"
              onClick={() => setActiveModal("transactions")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Lịch sử giao dịch</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </button>
          </div>
        </div>

        {/* SECTION 6: HỖ TRỢ */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-muted-foreground px-1">Hỗ trợ</h3>
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-xs">
            {/* Trung tâm trợ giúp */}
            <button
              type="button"
              onClick={() => setActiveModal("helpCenter")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Trung tâm trợ giúp</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </button>

            {/* Báo cáo sự cố an toàn */}
            <button
              type="button"
              onClick={() => setActiveModal("safetyReport")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Báo cáo sự cố an toàn</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </button>

            {/* Điều khoản & quyền riêng tư */}
            <button
              type="button"
              onClick={() => setActiveModal("terms")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Điều khoản & quyền riêng tư</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </button>
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="pt-2 space-y-3 text-center">
          <button
            type="button"
            onClick={() => setActiveModal("logout")}
            className="w-full py-3 rounded-2xl bg-card border border-border/80 font-bold text-xs text-foreground hover:bg-muted/60 transition-all active:scale-[0.99] shadow-xs"
          >
            Đăng xuất
          </button>

          <button
            type="button"
            onClick={() => setActiveModal("deleteAccount")}
            className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
          >
            Xóa tài khoản
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* INTERACTIVE MODALS FOR SETTINGS */}
      {/* =================================================================== */}

      {/* MODAL: SỐ ĐIỆN THOẠI */}
      {activeModal === "phone" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-brand" />
                <span>Số Điện Thoại Đăng Ký</span>
              </h3>
              <p className="text-xs text-muted-foreground">Số điện thoại dùng để nhận mã OTP và liên hệ khẩn cấp.</p>
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">Số điện thoại:</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-semibold outline-none focus:border-brand"
              />
            </div>
            <Button
              onClick={() => {
                alert("Đã cập nhật số điện thoại thành công!");
                closeModal();
              }}
              className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10"
            >
              Lưu Số Điện Thoại
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: XÁC THỰC DANH TÍNH (eKYC) */}
      {activeModal === "kyc" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Xác Thực Danh Tính 18+</h3>
              <p className="text-xs text-muted-foreground">
                Tài khoản của bạn đã được đối soát qua Google & số điện thoại. Hệ thống chỉ yêu cầu CCCD/eKYC khi bạn tạo các giải đấu lớn hoặc nhận tiền thanh toán đối tác.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-muted/50 text-left space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground">Trạng thái:</span>
                <span className="text-emerald-600 dark:text-emerald-400">Đã kích hoạt</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground">Cấp độ an toàn:</span>
                <span className="text-foreground">Cấp 2 (Tiêu chuẩn)</span>
              </div>
            </div>
            <Button onClick={closeModal} className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10">
              Đã Hiểu
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: NGƯỜI LIÊN HỆ TIN CẬY */}
      {activeModal === "emergency" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand" />
                <span>Người Liên Hệ Tin Cậy (SOS)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Người này sẽ nhận được vị trí của bạn nếu bạn bấm nút khẩn cấp trong buổi tập hoặc quá 45 phút chưa check-out.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Người thân / Bạn tập chính</p>
                <p className="text-xs text-muted-foreground font-mono">0912 ••• 888</p>
              </div>
              <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md">Mặc định</span>
            </div>
            <Button onClick={closeModal} className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10">
              Xong
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: DANH SÁCH CHẶN */}
      {activeModal === "blocked" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <UserX className="h-4 w-4 text-red-500" />
                <span>Danh Sách Đã Chặn</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Những người dùng này sẽ không thấy kèo của bạn và không thể gửi yêu cầu ghép cặp.
              </p>
            </div>
            {blockedList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Chưa chặn người dùng nào.</p>
            ) : (
              <div className="space-y-2">
                {blockedList.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">Chặn ngày {item.date}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBlockedList((prev) => prev.filter((x) => x.id !== item.id))}
                      className="text-xs font-bold text-brand hover:underline px-2 py-1"
                    >
                      Bỏ chặn
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={closeModal} className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10">
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: MÔN & BAND */}
      {activeModal === "sportBand" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-brand" />
                <span>Chọn Môn & Band Tập Luyện</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Hệ thống ghép bạn tập cùng trình độ để buổi tập diễn ra cân sức và an toàn.
              </p>
            </div>
            <div className="space-y-2">
              {[
                { label: "Chạy R2 · Gym S1", desc: "Pace 5:30 - 6:30/km · Gym Thể lực cơ bản" },
                { label: "Chạy R3 · Gym S2", desc: "Pace 4:45 - 5:30/km · Kháng lực nâng cao" },
                { label: "Chạy R1 · Yoga Recovery", desc: "Pace > 6:30/km · Chạy phục hồi & giãn cơ" },
                { label: "Cầu lông B2 · Chạy R2", desc: "Phong trào khá · Chạy sức bền" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setSelectedSportBand(opt.label);
                    closeModal();
                  }}
                  className={cn(
                    "w-full p-3 rounded-2xl border text-left transition-all",
                    selectedSportBand === opt.label
                      ? "border-brand bg-brand/5 dark:bg-brand/20 font-bold"
                      : "border-border hover:border-brand/40"
                  )}
                >
                  <p className="text-xs font-bold text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIBE MẶC ĐỊNH */}
      {activeModal === "vibe" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-brand" />
                <span>VIBE Tập Luyện Mặc Định</span>
              </h3>
              <p className="text-xs text-muted-foreground">Phong thái buổi tập bạn mong muốn khi ghép đôi.</p>
            </div>
            <div className="space-y-2">
              {[
                { vibe: "Friendly", desc: "Vui vẻ, hòa đồng, trò chuyện giao lưu chia sẻ năng lượng" },
                { vibe: "Focus", desc: "Tập trung 100% giáo án, ít trò chuyện trong lúc chạy/tập" },
                { vibe: "Push Hard", desc: "Đẩy hết sức, thử thách PR kỷ lục cá nhân" },
                { vibe: "Chữa lành", desc: "Nhẹ nhàng, thư giãn, không áp lực tốc độ" },
              ].map((item) => (
                <button
                  key={item.vibe}
                  type="button"
                  onClick={() => {
                    setDefaultVibe(item.vibe);
                    closeModal();
                  }}
                  className={cn(
                    "w-full p-3 rounded-2xl border text-left transition-all",
                    defaultVibe === item.vibe
                      ? "border-brand bg-brand/5 dark:bg-brand/20 font-bold"
                      : "border-border hover:border-brand/40"
                  )}
                >
                  <p className="text-xs font-bold text-foreground">{item.vibe}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BÁN KÍNH GPS */}
      {activeModal === "radius" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand" />
                <span>Bán Kính Tìm Kèo (GPS)</span>
              </h3>
              <p className="text-xs text-muted-foreground">Khoảng cách tối đa từ vị trí hiện tại hoặc Spot quen thuộc.</p>
            </div>
            <div className="space-y-2">
              {[1, 3, 5, 10].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => {
                    setRadiusKm(km);
                    closeModal();
                  }}
                  className={cn(
                    "w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between",
                    radiusKm === km
                      ? "border-brand bg-brand/5 dark:bg-brand/20 font-bold"
                      : "border-border hover:border-brand/40"
                  )}
                >
                  <span className="text-xs font-bold text-foreground">{km} km</span>
                  <span className="text-[11px] text-muted-foreground">
                    {km === 3 ? "Chuẩn SYNESIS (Khuyên dùng)" : km < 3 ? "Gần sát nhà" : "Phạm vi toàn thành phố"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ƯU TIÊN GIỚI TÍNH */}
      {activeModal === "gender" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Ưu Tiên Giới Tính Ghép Cặp</h3>
              <p className="text-xs text-muted-foreground">Bộ lọc tự động nhằm tăng sự thoải mái và an toàn khi tập luyện.</p>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: "Riêng tư", desc: "Chỉ hiển thị cho người dùng cùng giới tính hoặc đã kết bạn" },
                { label: "Chỉ bạn nữ / cùng giới", desc: "Ưu tiên tuyệt đối bạn tập cùng giới" },
                { label: "Tất cả", desc: "Mở rộng tìm kiếm bạn tập mọi giới tính" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setGenderPref(opt.label);
                    closeModal();
                  }}
                  className={cn(
                    "w-full p-3 rounded-2xl border text-left transition-all",
                    genderPref === opt.label ? "border-brand bg-brand/5 font-bold" : "border-border hover:border-brand/40"
                  )}
                >
                  <p className="font-bold text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GIỜ RẢNH */}
      {activeModal === "freeHours" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Khung Giờ Rảnh Tập Luyện</h3>
              <p className="text-xs text-muted-foreground">Thời gian gợi ý kèo phù hợp nhất trong ngày.</p>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: "Sáng · Chiều", desc: "Sáng 5:30 - 7:00 & Chiều 17:30 - 19:00" },
                { label: "Chỉ Sáng Sớm", desc: "Trước giờ làm việc (5:00 - 6:45)" },
                { label: "Chỉ Chiều Tối", desc: "Sau giờ làm (18:00 - 20:30)" },
                { label: "Cuối Tuần", desc: "Thứ 7 & Chủ Nhật (Long Run)" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setFreeHours(opt.label);
                    closeModal();
                  }}
                  className={cn(
                    "w-full p-3 rounded-2xl border text-left transition-all",
                    freeHours === opt.label ? "border-brand bg-brand/5 font-bold" : "border-border hover:border-brand/40"
                  )}
                >
                  <p className="font-bold text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QUẢN LÝ SỰ ĐỒNG Ý */}
      {activeModal === "consent" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Quản Lý Quyền & Sự Đồng Ý</h3>
              <p className="text-xs text-muted-foreground">Tuân thủ nghiêm ngặt PDP 2026 về dữ liệu người dùng.</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex justify-between items-center">
                <span>Vị trí GPS trong phiên tập</span>
                <span className="text-emerald-600 font-bold">Đã cấp quyền</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex justify-between items-center">
                <span>Camera quét mã QR điểm hẹn</span>
                <span className="text-emerald-600 font-bold">Đã cấp quyền</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex justify-between items-center">
                <span>Dữ liệu nhịp tim & bước chân</span>
                <span className="text-muted-foreground font-semibold">Tùy chọn</span>
              </div>
            </div>
            <Button onClick={closeModal} className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10">
              Đã Rõ
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: TẢI XUỐNG DỮ LIỆU */}
      {activeModal === "exportData" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Tải Dữ Liệu Của Tôi</h3>
              <p className="text-xs text-muted-foreground">
                Xuất file lưu trữ toàn bộ lịch sử 38 buổi tập, Điểm Uy Tín và chỉ số cá nhân định dạng JSON/CSV.
              </p>
            </div>
            <Button
              onClick={() => {
                alert("Đang chuẩn bị gói dữ liệu. File tải về sẽ sẵn sàng trong vài giây!");
                closeModal();
              }}
              className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10"
            >
              Tải Xuống Gói Dữ Liệu
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: AI XEM ĐƯỢC HỒ SƠ */}
      {activeModal === "privacyVisibility" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-brand" />
                <span>Quyền Xem Hồ Sơ</span>
              </h3>
              <p className="text-xs text-muted-foreground">Quyết định ai có thể xem chi tiết chỉ số và lịch tập của bạn.</p>
            </div>
            <div className="space-y-2">
              {[
                { label: "Sau khi chấp nhận kèo", desc: "Chỉ bạn tập cùng kèo mới xem được chỉ số chi tiết" },
                { label: "Bạn bè & CLB", desc: "Mọi thành viên trong cùng CLB và danh sách bạn bè" },
                { label: "Công khai toàn mạng", desc: "Hiển thị cho tất cả vận động viên trên SYNESIS" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setProfileVisibility(item.label);
                    closeModal();
                  }}
                  className={cn(
                    "w-full p-3 rounded-2xl border text-left transition-all",
                    profileVisibility === item.label
                      ? "border-brand bg-brand/5 dark:bg-brand/20 font-bold"
                      : "border-border hover:border-brand/40"
                  )}
                >
                  <p className="text-xs font-bold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PHƯƠNG THỨC THANH TOÁN (VIETQR) */}
      {activeModal === "paymentMethod" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-brand" />
                <span>Phương Thức Thanh Toán</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Tích hợp PayOS VietQR chuẩn NAPAS. Cơ chế cọc 0đ bảo đảm bởi Điểm Uy Tín (UT).
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-brand/5 border border-brand/30 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-foreground">Cổng thanh toán:</span>
                <span className="text-brand font-black">VietQR (PayOS)</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Khi thuê sân hoặc tham gia kèo chia tiền (85% Host · 15% Nền tảng), tiền sẽ được chuyển thẳng về tài khoản ngân hàng liên kết sau khi quét QR check-in thành công.
              </p>
            </div>
            <Button onClick={closeModal} className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10">
              Đã Kết Nối VietQR
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: LỊCH SỬ GIAO DỊCH */}
      {activeModal === "transactions" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Lịch Sử Giao Dịch</h3>
              <p className="text-xs text-muted-foreground">Các khoản chia tiền sân và hoàn cọc gần nhất.</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">Kèo Chạy Bờ Kè Thanh Đa</p>
                  <p className="text-[10px] text-muted-foreground">16/11/2026 · Quét QR đúng giờ</p>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+0.5 UT</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">Chia tiền sân Cầu Lông Đào Duy Anh</p>
                  <p className="text-[10px] text-muted-foreground">12/11/2026 · VietQR PayOS</p>
                </div>
                <span className="font-bold text-foreground">-45.000đ</span>
              </div>
            </div>
            <Button onClick={closeModal} className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10">
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: TRUNG TÂM TRỢ GIÚP */}
      {activeModal === "helpCenter" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-brand" />
                <span>Trung Tâm Trợ Giúp</span>
              </h3>
              <p className="text-xs text-muted-foreground">Câu hỏi thường gặp và hướng dẫn sử dụng SYNESIS.</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/50 border border-border space-y-1">
                <p className="font-bold text-foreground">Điểm Uy Tín (UT) hoạt động như thế nào?</p>
                <p className="text-[11px] text-muted-foreground">
                  Mỗi tài khoản khởi điểm 7.0 UT. Điểm trên 8.0 được hưởng miễn cọc 0đ khi ghép kèo.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/50 border border-border space-y-1">
                <p className="font-bold text-foreground">Quy định hủy kèo phút chót?</p>
                <p className="text-[11px] text-muted-foreground">
                  Hủy trong vòng 30 phút trước giờ hẹn sẽ bị trừ 1.5 UT và khóa ghép kèo 24 giờ.
                </p>
              </div>
            </div>
            <Button onClick={closeModal} className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10">
              Tôi Đã Hiểu
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: BÁO CÁO SỰ CỐ AN TOÀN */}
      {activeModal === "safetyReport" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Báo Cáo Sự Cố An Toàn</span>
              </h3>
              <p className="text-xs text-muted-foreground">Bảo vệ bạn và cộng đồng vận động viên văn minh.</p>
            </div>
            <div className="space-y-2 text-xs">
              {["Bạn tập vắng mặt không lý do (No-show)", "Hành vi không phù hợp / Quấy rối", "Gian lận thành tích / GPS ảo", "Khác"].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    alert(`Đã ghi nhận báo cáo: "${reason}". Ban Quản Trị SYNESIS sẽ xem xét trong vòng 2 giờ.`);
                    closeModal();
                  }}
                  className="w-full p-2.5 rounded-xl border border-border hover:border-red-400 text-left font-semibold text-foreground"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ĐIỀU KHOẢN & QUYỀN RIÊNG TƯ */}
      {activeModal === "terms" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-brand" />
                <span>Điều Khoản & Quyền Riêng Tư</span>
              </h3>
              <p className="text-xs text-muted-foreground">Tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân.</p>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 text-xs text-muted-foreground leading-relaxed pr-1">
              <p>1. SYNESIS chỉ lưu trữ vị trí GPS trong phiên tập nhằm mục đích điểm danh 2 chiều tại Spot.</p>
              <p>2. Không bán dữ liệu sức khỏe hay lịch trình cho bất kỳ bên thứ ba nào.</p>
              <p>3. Người dùng có quyền tải về hoặc yêu cầu xóa vĩnh viễn toàn bộ dữ liệu bất kỳ lúc nào.</p>
            </div>
            <Button onClick={closeModal} className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10">
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: ĐĂNG XUẤT */}
      {activeModal === "logout" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-foreground">
              <LogOut className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Đăng Xuất Khỏi SYNESIS?</h3>
              <p className="text-xs text-muted-foreground">
                Dữ liệu kèo tập và Điểm Uy Tín ({user?.trustScore || "8.5"} UT) của bạn vẫn được lưu trữ an toàn.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeModal} className="flex-1 rounded-xl text-xs font-semibold h-10">
                Ở lại
              </Button>
              <Button
                onClick={() => {
                  closeModal();
                  logout();
                  router.push("/dang-nhap");
                }}
                className="flex-1 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white h-10"
              >
                Đăng Xuất
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XÓA TÀI KHOẢN */}
      {activeModal === "deleteAccount" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-red-600">Xóa Vĩnh Viễn Tài Khoản?</h3>
              <p className="text-xs text-muted-foreground">
                Hành động này không thể hoàn tác. Mọi lịch sử chạy bộ, thành tích huy hiệu và Điểm Uy Tín sẽ bị xóa theo quy định PDP 2026.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeModal} className="flex-1 rounded-xl text-xs font-semibold h-10">
                Hủy bỏ
              </Button>
              <Button
                onClick={() => {
                  alert("Yêu cầu xóa tài khoản đã được ghi nhận. Dữ liệu sẽ được dọn sạch hoàn toàn sau 7 ngày.");
                  closeModal();
                  logout();
                  router.push("/dang-nhap");
                }}
                className="flex-1 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white h-10"
              >
                Xác Nhận Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
