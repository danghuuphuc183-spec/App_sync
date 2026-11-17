"use client";

import * as React from "react";
import {
  X,
  Gift,
  Award,
  Sparkles,
  Ticket,
  Package,
  Check,
  Copy,
  ChevronRight,
  Info,
  ShieldCheck,
  Flame,
  Truck,
  ExternalLink,
  Zap,
} from "lucide-react";
import {
  RewardItem,
  RedeemedItem,
  REWARDS_CATALOG,
  getStoredUserExp,
  setStoredUserExp,
  getStoredRedeemedItems,
  setStoredRedeemedItems,
  generateVoucherCode,
  ShippingInfo,
} from "@/features/rewards/rewards.data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRankTitle?: string;
}

export function RewardsModal({
  isOpen,
  onClose,
  userRankTitle = "Cấp 2 · Runner",
}: RewardsModalProps) {
  const [activeTab, setActiveTab] = React.useState<"all" | "voucher" | "physical" | "my-rewards">("all");
  const [userExp, setUserExp] = React.useState<number>(1240);
  const [redeemedList, setRedeemedList] = React.useState<RedeemedItem[]>([]);
  const [selectedReward, setSelectedReward] = React.useState<RewardItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);
  const [lastRedeemedItem, setLastRedeemedItem] = React.useState<RedeemedItem | null>(null);
  const [isRulesSheetOpen, setIsRulesSheetOpen] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  // Shipping Form State
  const [shippingForm, setShippingForm] = React.useState<ShippingInfo>({
    recipientName: "Minh Thư",
    phone: "0908 123 456",
    address: "Bờ kè Thanh Đa, P.27, Q. Bình Thạnh, TP.HCM",
    size: "M",
    note: "Giao giờ hành chính",
  });

  // Load from local storage
  React.useEffect(() => {
    if (isOpen) {
      setUserExp(getStoredUserExp());
      setRedeemedList(getStoredRedeemedItems());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter rewards
  const filteredRewards = REWARDS_CATALOG.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "voucher") return item.category === "voucher";
    if (activeTab === "physical") return item.category === "physical";
    return true;
  });

  const handleStartRedeem = (item: RewardItem) => {
    if (userExp < item.expCost) return;
    setSelectedReward(item);
    setIsConfirmOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward || userExp < selectedReward.expCost) return;

    const newExp = userExp - selectedReward.expCost;
    setUserExp(newExp);
    setStoredUserExp(newExp);

    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
    const expDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expDateStr = `${expDate.getDate().toString().padStart(2, "0")}/${(expDate.getMonth() + 1).toString().padStart(2, "0")}/${expDate.getFullYear()}`;

    const newItem: RedeemedItem = {
      id: `red-${Date.now()}`,
      rewardId: selectedReward.id,
      rewardTitle: selectedReward.title,
      partnerName: selectedReward.partnerName,
      category: selectedReward.category,
      expCost: selectedReward.expCost,
      redeemedAt: dateStr,
      code: selectedReward.category === "voucher" ? generateVoucherCode() : undefined,
      expiresAt: selectedReward.category === "voucher" ? expDateStr : undefined,
      status: selectedReward.category === "voucher" ? "active" : "shipping",
      shippingInfo: selectedReward.category === "physical" ? { ...shippingForm } : undefined,
    };

    const updatedList = [newItem, ...redeemedList];
    setRedeemedList(updatedList);
    setStoredRedeemedItems(updatedList);

    setLastRedeemedItem(newItem);
    setIsConfirmOpen(false);
    setIsSuccessOpen(true);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. MODAL HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-border/80 shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-sky flex items-center justify-center shrink-0">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground tracking-tight">Đổi Thưởng EXP & Hiện Vật</h2>
              <p className="text-[11px] text-muted-foreground">Voucher đối tác dinh dưỡng & Quà vật chất Synesis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. USER BALANCE BANNER */}
        <div className="p-4 bg-linear-to-r from-brand/10 via-brand/5 to-transparent border-b border-border/60 shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">EXP Khả Dụng Đổi Quà</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand dark:text-brand-sky tracking-tight">
                  {userExp.toLocaleString("vi-VN")} EXP
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand dark:text-brand-sky border border-brand/20">
                  {userRankTitle}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRulesSheetOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-background border border-border/80 hover:border-brand/40 text-[11px] font-semibold text-foreground shadow-2xs hover:shadow-xs transition-all"
            >
              <Info className="h-3.5 w-3.5 text-brand" />
              <span>Cách kiếm EXP</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-background/80 rounded-xl px-2.5 py-1.5 border border-border/60">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <p className="leading-tight">
              Đổi quà chỉ trừ vào EXP khả dụng. <strong className="text-foreground">Cấp Hạng trọn đời không bao giờ bị giảm</strong>.
            </p>
          </div>
        </div>

        {/* 3. TABS FILTER */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border/60 shrink-0 bg-background overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
              activeTab === "all" ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:bg-muted"
            )}
          >
            Tất cả quà
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("voucher")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeTab === "voucher" ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>Voucher đối tác (100–500)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("physical")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeTab === "physical" ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Package className="h-3.5 w-3.5" />
            <span>Hiện vật Synesis (1.000+)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("my-rewards")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ml-auto",
              activeTab === "my-rewards" ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Quà của tôi ({redeemedList.length})</span>
          </button>
        </div>

        {/* 4. MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === "my-rewards" ? (
            /* MY REDEEMED REWARDS VIEW */
            redeemedList.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Ticket className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Bạn chưa đổi phần thưởng nào</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Tập luyện đều đặn hằng tuần để tích lũy EXP và đổi các voucher hoặc hiện vật Synesis giá trị!
                </p>
                <Button
                  onClick={() => setActiveTab("all")}
                  variant="outline"
                  className="rounded-xl text-xs font-bold mt-2"
                >
                  Khám phá kho quà
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-medium">Danh sách các phần thưởng bạn đã đổi thành công:</p>
                {redeemedList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand dark:text-brand-sky">
                          {item.partnerName} · Đã trừ -{item.expCost} EXP
                        </span>
                        <h4 className="text-xs font-bold text-foreground leading-snug">{item.rewardTitle}</h4>
                        <p className="text-[10.5px] text-muted-foreground">Ngày đổi: {item.redeemedAt}</p>
                      </div>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                          item.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : item.status === "shipping"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.status === "active"
                          ? "Khả dụng"
                          : item.status === "shipping"
                          ? "Đang đóng gói"
                          : "Đã sử dụng"}
                      </span>
                    </div>

                    {item.code && (
                      <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Mã Voucher (Hạn dùng: {item.expiresAt}):</p>
                          <p className="text-xs font-mono font-bold text-foreground">{item.code}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(item.code!)}
                          className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 text-brand hover:text-brand"
                        >
                          {copiedCode === item.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedCode === item.code ? "Đã chép" : "Sao chép"}</span>
                        </Button>
                      </div>
                    )}

                    {item.shippingInfo && (
                      <div className="p-2.5 rounded-xl bg-background border border-border space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Truck className="h-3.5 w-3.5 text-brand" />
                          <span>Thông tin gửi hiện vật tận nhà (Miễn phí):</span>
                        </div>
                        <p className="text-muted-foreground">
                          Người nhận: <strong className="text-foreground">{item.shippingInfo.recipientName}</strong> ({item.shippingInfo.phone})
                        </p>
                        <p className="text-muted-foreground truncate">
                          Địa chỉ: <strong className="text-foreground">{item.shippingInfo.address}</strong>
                        </p>
                        {item.shippingInfo.size && (
                          <p className="text-muted-foreground">
                            Size áo: <strong className="text-foreground">{item.shippingInfo.size}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* REWARDS CATALOG VIEW */
            <div className="space-y-2.5">
              {filteredRewards.map((item) => {
                const canAfford = userExp >= item.expCost;
                const isPhysical = item.category === "physical";

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all space-y-2.5",
                      canAfford
                        ? "bg-card border-border hover:border-brand/40 shadow-xs"
                        : "bg-muted/30 border-border/50 opacity-80"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      {/* Left: Tag + Title + Partner */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                              isPhysical
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-brand/10 text-brand dark:text-brand-sky border-brand/20"
                            )}
                          >
                            {item.tag}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate">· {item.partnerName}</span>
                        </div>

                        <h3 className="text-xs font-bold text-foreground tracking-tight leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Right: EXP Cost Badge */}
                      <div className="text-right shrink-0">
                        <span className="inline-block text-xs font-extrabold text-foreground px-2.5 py-1 rounded-xl bg-muted border border-border/60">
                          {item.expCost} EXP
                        </span>
                        <p className="text-[10px] text-muted-foreground pt-0.5">{item.valueText}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
                        {isPhysical ? (
                          <>
                            <Truck className="h-3 w-3 text-amber-500" />
                            <span>Giao tận nhà miễn phí</span>
                          </>
                        ) : (
                          <>
                            <Ticket className="h-3 w-3 text-brand" />
                            <span>Mã e-Voucher dùng ngay</span>
                          </>
                        )}
                      </div>

                      <Button
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => handleStartRedeem(item)}
                        className={cn(
                          "rounded-xl text-xs font-bold h-8 px-3.5 transition-all shadow-xs",
                          canAfford
                            ? isPhysical
                              ? "bg-amber-600 hover:bg-amber-700 text-white"
                              : "bg-brand hover:bg-brand-600 text-white"
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {canAfford ? "Đổi ngay" : `Cần thêm ${item.expCost - userExp} EXP`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. FOOTER */}
        <div className="p-3 bg-muted/20 border-t border-border/80 flex items-center justify-between text-xs shrink-0">
          <span className="text-muted-foreground text-[11px]">
            Hệ thống quà được tài trợ bởi các đối tác Synesis
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl font-bold text-xs h-8">
            Đóng
          </Button>
        </div>

      </div>

      {/* CONFIRMATION MODAL */}
      {isConfirmOpen && selectedReward && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsConfirmOpen(false)}
              aria-label="Đóng bảng xác nhận"
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1 text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand dark:text-brand-sky flex items-center justify-center mx-auto">
                {selectedReward.category === "physical" ? <Package className="h-6 w-6" /> : <Ticket className="h-6 w-6" />}
              </div>
              <h3 className="text-base font-extrabold text-foreground">Xác Nhận Đổi Phần Thưởng</h3>
              <p className="text-xs text-muted-foreground">
                Bạn sắp dùng <strong className="text-brand dark:text-brand-sky">{selectedReward.expCost} EXP</strong> để đổi phần quà này.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Món quà:</span>
                <span className="font-bold text-foreground text-right">{selectedReward.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đối tác / Thương hiệu:</span>
                <span className="font-semibold text-foreground">{selectedReward.partnerName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/40">
                <span className="text-muted-foreground">Số dư EXP sau đổi:</span>
                <span className="font-bold text-brand">{userExp - selectedReward.expCost} EXP</span>
              </div>
            </div>

            {/* If physical merchandise, show shipping input form */}
            {selectedReward.category === "physical" && (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-foreground flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-brand" />
                  <span>Địa chỉ nhận hiện vật (Miễn phí toàn quốc):</span>
                </p>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={shippingForm.recipientName}
                    onChange={(e) => setShippingForm({ ...shippingForm, recipientName: e.target.value })}
                    placeholder="Họ và tên người nhận"
                    className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs outline-none focus:border-brand"
                  />
                  <input
                    type="text"
                    value={shippingForm.phone}
                    onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                    placeholder="Số điện thoại nhận hàng"
                    className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs outline-none focus:border-brand"
                  />
                  <textarea
                    rows={2}
                    value={shippingForm.address}
                    onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                    placeholder="Địa chỉ giao hàng chi tiết..."
                    className="w-full p-2.5 rounded-xl bg-muted/60 border border-border text-foreground text-xs outline-none focus:border-brand resize-none"
                  />

                  {/* Size selector if it's the Performance Tee */}
                  {selectedReward.id === "r-synesis-tee" && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-muted-foreground">Chọn size áo:</span>
                      {(["S", "M", "L", "XL", "XXL"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setShippingForm({ ...shippingForm, size: s })}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all",
                            shippingForm.size === s
                              ? "bg-brand text-white border-brand"
                              : "bg-muted text-muted-foreground border-border hover:border-brand/40"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 rounded-xl text-xs font-bold h-10"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmRedeem}
                className={cn(
                  "flex-1 rounded-xl text-xs font-bold text-white h-10",
                  selectedReward.category === "physical" ? "bg-amber-600 hover:bg-amber-700" : "bg-brand hover:bg-brand-600"
                )}
              >
                Xác nhận đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {isSuccessOpen && lastRedeemedItem && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Đổi Quà Thành Công!</h3>
              <p className="text-xs text-muted-foreground">
                Cảm ơn bạn đã luôn kỷ luật và nỗ lực rèn luyện cùng cộng đồng Synesis.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand">{lastRedeemedItem.partnerName}</p>
              <h4 className="text-xs font-bold text-foreground">{lastRedeemedItem.rewardTitle}</h4>

              {lastRedeemedItem.code && (
                <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground">Mã Voucher của bạn:</span>
                    <p className="text-xs font-mono font-bold text-foreground">{lastRedeemedItem.code}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(lastRedeemedItem.code!)}
                    className="h-8 px-2.5 text-xs font-bold gap-1 text-brand"
                  >
                    {copiedCode === lastRedeemedItem.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode === lastRedeemedItem.code ? "Đã chép" : "Sao chép"}</span>
                  </Button>
                </div>
              )}

              {lastRedeemedItem.shippingInfo && (
                <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <p className="flex items-center gap-1 font-semibold text-foreground">
                    <Truck className="h-3.5 w-3.5 text-brand" />
                    <span>Đang đóng gói và gửi về:</span>
                  </p>
                  <p className="text-foreground font-medium">{lastRedeemedItem.shippingInfo.recipientName} ({lastRedeemedItem.shippingInfo.phone})</p>
                  <p className="truncate">{lastRedeemedItem.shippingInfo.address}</p>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                setIsSuccessOpen(false);
                setActiveTab("my-rewards");
              }}
              className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10"
            >
              Xem trong &quot;Quà Của Tôi&quot;
            </Button>
          </div>
        </div>
      )}

      {/* EXP RULES INFO SHEET / MODAL */}
      {isRulesSheetOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsRulesSheetOpen(false)}
              aria-label="Đóng bảng quy tắc"
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand">
                <Flame className="h-4 w-4" />
                <span>QUY CHUẨN TÍCH LŨY EXP SYNESIS</span>
              </div>
              <h3 className="text-base font-extrabold text-foreground">Lộ Trình Tích Lũy Từ Dễ Tới Khó</h3>
              <p className="text-xs text-muted-foreground">
                Tích lũy từ thói quen tập luyện thực tế có xác thực GPS và mã QR 2 chiều tại Spot.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Giai đoạn 1 */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  1. Giai đoạn Khởi Động (0 – 150 EXP · Cực Dễ)
                </p>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  <li>• Hoàn tất hồ sơ cá nhân: <strong>+20 EXP</strong></li>
                  <li>• Xác thực CCCD / eKYC: <strong>+20 EXP</strong></li>
                  <li>• Kết nối 1 bạn tập Duo đầu tiên: <strong>+20 EXP</strong></li>
                  <li>• Buổi tập đầu tiên hoàn thành (quét QR): <strong>+40 EXP</strong></li>
                  <li className="text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                    Mục tiêu: Đạt ngay mốc 100 EXP trong tuần đầu để đổi Voucher giảm giá!
                  </li>
                </ul>
              </div>

              {/* Giai đoạn 2 */}
              <div className="p-3 rounded-2xl bg-brand/10 border border-brand/20 space-y-1.5">
                <p className="font-bold text-brand dark:text-brand-sky">
                  2. Giai đoạn Giữ Nhịp (150 – 500 EXP · Vừa Sức)
                </p>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  <li>• Buổi tập cá nhân (GPS $\ge$ 15 phút): <strong>+5 EXP</strong> / buổi</li>
                  <li>• Buổi tập chung Duo: <strong>+10 EXP</strong> / buổi (tối đa 2 buổi/tuần)</li>
                  <li>• Nhóm nhỏ đạt $\ge 75\%$ thành viên: <strong>+15 EXP</strong> / tuần</li>
                  <li>• Thưởng mốc chuỗi Duo 4 tuần: <strong>+60 EXP</strong></li>
                  <li className="text-brand dark:text-brand-sky font-semibold pt-0.5">
                    Mục tiêu: Đạt mốc 200 – 300 EXP sau 2–3 tuần tập đều để đổi quà giá trị cao hơn.
                  </li>
                </ul>
              </div>

              {/* Giai đoạn 3 */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <p className="font-bold text-amber-600 dark:text-amber-400">
                  3. Giai đoạn Kỷ Luật (500 – 1.000+ EXP · Thử Thách)
                </p>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  <li>• Thưởng chuỗi tuần Duo 8 tuần: <strong>+120 EXP</strong></li>
                  <li>• Thưởng chuỗi tuần Duo 12 tuần: <strong>+200 EXP</strong></li>
                  <li>• Thưởng chuỗi tuần Duo 26 tuần (nửa năm): <strong>+500 EXP</strong></li>
                  <li>• Host 10 kèo nhóm hoàn thành 100%: <strong>+100 EXP</strong></li>
                  <li className="text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
                    Mục tiêu: Vượt 1.000 EXP để nhận Bình nước, Áo tập hoặc Balo Synesis in logo!
                  </li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => setIsRulesSheetOpen(false)}
              className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10"
            >
              Tôi Đã Hiểu
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
