"use client";

import * as React from "react";
import {
  X,
  ShieldCheck,
  Star,
  Users,
  User,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  Heart,
  Dumbbell,
  TrendingUp,
} from "lucide-react";
import { Coach } from "@/features/coaching/coaching.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoachDetailModalProps {
  coach: Coach | null;
  isOpen: boolean;
  onClose: () => void;
  onBookSession: (coach: Coach, mode: "1:1" | "group") => void;
}

export function CoachDetailModal({
  coach,
  isOpen,
  onClose,
  onBookSession,
}: CoachDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "history" | "reviews" | "pricing">("overview");

  if (!isOpen || !coach) return null;

  const formatVnd = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-background border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Cover & Header */}
        <div className="relative h-28 bg-brand overflow-hidden shrink-0">
          {coach.coverImage && (
            <img
              src={coach.coverImage}
              alt="Cover"
              className="w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 transition-all z-10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Card Floating Over Cover */}
        <div className="px-4 -mt-12 shrink-0 space-y-2">
          <div className="flex items-end justify-between">
            <div className="relative">
              <img
                src={coach.avatar}
                alt={coach.name}
                className="w-20 h-20 rounded-3xl object-cover border-4 border-background shadow-md"
              />
              {coach.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black p-0.5 rounded-full shadow-xs">
                  <ShieldCheck className="h-5 w-5 text-brand dark:text-brand-sky fill-brand-100 dark:fill-brand" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pb-1">
              <Badge className="bg-brand text-white text-[11px] font-bold px-2.5 py-1">
                {coach.trustScore} TS Uy Tín
              </Badge>
              <Badge variant="outline" className="text-[11px] font-semibold border-border">
                {coach.tier.toUpperCase()} TIER
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-foreground">{coach.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100/50 text-brand dark:bg-brand/50 dark:text-brand-sky font-bold">
                {coach.sportCategory}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{coach.title}</p>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 mx-4 mt-2 rounded-2xl bg-muted/60 border border-border/70 shrink-0">
          {[
            { id: "overview", label: "Thể hình & Gu" },
            { id: "history", label: "Lịch sử & Bằng" },
            { id: "reviews", label: `Đánh giá (${coach.reviewCount})` },
            { id: "pricing", label: "Bảng giá" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as "overview" | "history" | "reviews" | "pricing")}
              className={cn(
                "py-1.5 rounded-xl text-[11px] font-bold text-center transition-all",
                activeTab === t.id
                  ? "bg-brand text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* TAB 1: THỂ HÌNH & GU SỞ THÍCH */}
          {activeTab === "overview" && (
            <div className="space-y-3">
              {/* Chỉ số thể hình */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-brand dark:text-brand-sky" />
                  <span>Số đo & Thể hình thực tế của HLV</span>
                </div>
                <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-muted/50 text-center">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-semibold">Chiều cao</div>
                    <div className="text-sm font-black text-foreground">{coach.bodyStats.heightCm} cm</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-semibold">Cân nặng</div>
                    <div className="text-sm font-black text-foreground">{coach.bodyStats.weightKg} kg</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-semibold">Tỷ lệ mỡ</div>
                    <div className="text-sm font-black text-brand dark:text-brand-sky">
                      {coach.bodyStats.bodyFatPercent ? `${coach.bodyStats.bodyFatPercent}%` : "Chuẩn"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-semibold">Kinh nghiệm</div>
                    <div className="text-sm font-black text-foreground">{coach.bodyStats.experienceYears} năm</div>
                  </div>
                </div>
              </div>

              {/* Tiểu sử & Triết lý */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Triết lý & Tiểu sử nghề nghiệp
                </div>
                <div className="p-3 rounded-2xl bg-card border border-border text-xs leading-relaxed space-y-1.5">
                  <p className="text-foreground">{coach.bio}</p>
                  {coach.quote && (
                    <p className="italic text-muted-foreground border-l-2 border-brand pl-2 text-[11px]">
                      &ldquo;{coach.quote}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Sở thích & Phong cách */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-rose-500" />
                  <span>Sở thích cá nhân & Gu tập luyện</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {coach.hobbies.map((hobby, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border font-medium text-foreground"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>

              {/* Địa điểm & Phòng tập hỗ trợ */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand dark:text-brand-sky" />
                  <span>Phòng tập đối tác & Khu vực hoạt động</span>
                </div>
                <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs space-y-1">
                  <div className="font-semibold text-foreground">
                    Khu vực: {coach.locations.join(" • ")}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Hỗ trợ: {coach.supportedGyms.join(", ")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LỊCH SỬ & CHỨNG CHỈ */}
          {activeTab === "history" && (
            <div className="space-y-3.5">
              {/* Bằng cấp & Chứng chỉ quốc tế */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-brand dark:text-brand-sky" />
                  <span>Chứng chỉ nghề nghiệp & Bằng cấp</span>
                </div>
                <div className="space-y-1.5">
                  {coach.certifications.map((cert, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-2xl bg-card border border-border flex items-start gap-2 text-xs"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-semibold text-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline lịch sử sự nghiệp */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brand dark:text-brand-sky" />
                  <span>Quá trình công tác & Thành tích</span>
                </div>
                <div className="space-y-2 border-l-2 border-brand/30 ml-2 pl-3">
                  {coach.history.map((h, i) => (
                    <div key={i} className="space-y-0.5 relative">
                      <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand" />
                      <div className="text-[10px] font-bold text-brand dark:text-brand-sky">
                        {h.period}
                      </div>
                      <div className="text-xs font-black text-foreground">{h.role}</div>
                      <div className="text-[11px] text-muted-foreground font-semibold">{h.organization}</div>
                      <div className="text-[11px] text-foreground/80 leading-relaxed">{h.highlight}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chuyên môn kỹ thuật sâu */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Chuyên môn kỹ thuật sâu
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {coach.specialties.map((spec, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-muted/60 text-[11px] font-semibold text-foreground flex items-center gap-1.5"
                    >
                      <Dumbbell className="h-3 w-3 text-brand dark:text-brand-sky shrink-0" />
                      <span className="truncate">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ĐÁNH GIÁ TỪ HỌC VIÊN TRƯỚC */}
          {activeTab === "reviews" && (
            <div className="space-y-3">
              {/* Overall Rating Header */}
              <div className="p-3 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-foreground flex items-center gap-1.5">
                    {coach.rating}
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    Dựa trên {coach.reviewCount} lượt đánh giá thực tế có bảo chứng
                  </div>
                </div>
                <Badge className="bg-emerald-600/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  100% Học viên thật
                </Badge>
              </div>

              {/* Review list */}
              <div className="space-y-2.5">
                {coach.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-2xl bg-card border border-border space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.traineeAvatar}
                          alt={rev.traineeName}
                          className="w-8 h-8 rounded-full object-cover border border-border"
                        />
                        <div>
                          <div className="text-xs font-bold text-foreground flex items-center gap-1">
                            {rev.traineeName}
                            {rev.verifiedTrainee && (
                              <CheckCircle2 className="h-3 w-3 text-brand dark:text-brand-sky" />
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {rev.dateVi} • {rev.trainingType === "1:1" ? "Gói 1:1 cá nhân" : "Gói Nhóm Squad"}
                          </div>
                        </div>
                      </div>

                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    {rev.achievementBadge && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-brand dark:text-brand-sky bg-brand-100/30 dark:bg-brand/30 px-2.5 py-1 rounded-full w-fit">
                        <span>🏆 Kết quả: {rev.achievementBadge}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BẢNG GIÁ & ĐẶT LỊCH */}
          {activeTab === "pricing" && (
            <div className="space-y-3">
              {/* Option 1: Gói 1:1 Kèm Riêng */}
              <div className="p-3.5 rounded-3xl bg-card border-2 border-brand/40 dark:border-brand-sky/40 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                    <User className="h-4 w-4 text-brand dark:text-brand-sky" />
                    <span>GÓI COACHING 1:1 CÁ NHÂN</span>
                  </div>
                  <Badge className="bg-brand text-white text-[10px] font-bold">Kèm Riêng 100%</Badge>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-foreground">
                    {formatVnd(coach.pricing.single1on1.pricePerSession)}
                  </span>
                  <span className="text-xs text-muted-foreground">/buổi ({coach.pricing.single1on1.durationMin} phút)</span>
                </div>

                {coach.pricing.single1on1.trialPrice && (
                  <div className="p-2 rounded-xl bg-brand-100/30 text-xs font-bold text-brand dark:text-brand-sky">
                    🎉 Buổi đầu trải nghiệm & Đo Inbody: {formatVnd(coach.pricing.single1on1.trialPrice)}
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground">{coach.pricing.single1on1.notes}</p>

                <Button
                  onClick={() => onBookSession(coach, "1:1")}
                  size="sm"
                  className="w-full rounded-full bg-brand hover:bg-brand-700 text-white font-bold text-xs h-8"
                >
                  Đặt Lịch Kèm 1:1 Với HLV
                </Button>
              </div>

              {/* Option 2: Gói Nhóm (Squad 2-4 bạn) */}
              <div className="p-3.5 rounded-3xl bg-gradient-to-b from-brand-50 to-card dark:from-brand/20 dark:to-card border-2 border-emerald-500/40 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                    <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>GÓI NHÓM SQUAD ({coach.pricing.groupCoaching.minMembers}-{coach.pricing.groupCoaching.maxMembers} NGƯỜI)</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                    Tiết Kiệm -{coach.pricing.groupCoaching.savingsPercent}%
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatVnd(coach.pricing.groupCoaching.pricePerPersonPerSession)}
                  </span>
                  <span className="text-xs text-muted-foreground">/người/buổi ({coach.pricing.groupCoaching.durationMin} phút)</span>
                </div>

                <div className="space-y-1 text-xs">
                  {coach.pricing.groupCoaching.groupBenefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => onBookSession(coach, "group")}
                  size="sm"
                  className="w-full rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-8 shadow-xs"
                >
                  Rủ Squad Cùng Đặt Lịch (Chia Tiền)
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Quick Action */}
        <div className="p-3 border-t border-border bg-card flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs">
            <span className="text-muted-foreground text-[10px] block">Từ mức phí:</span>
            <span className="font-black text-foreground">
              {formatVnd(coach.pricing.groupCoaching.pricePerPersonPerSession)}
            </span>
            <span className="text-[10px] text-muted-foreground"> (tập nhóm)</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onBookSession(coach, "group")}
              variant="outline"
              size="sm"
              className="rounded-full text-xs h-8 font-bold border-brand/30 text-brand dark:text-brand-sky"
            >
              Rủ Nhóm Tập
            </Button>
            <Button
              onClick={() => onBookSession(coach, "1:1")}
              size="sm"
              className="rounded-full bg-brand hover:bg-brand-700 text-white text-xs font-bold h-8 px-4"
            >
              Đặt Kèm 1:1
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
