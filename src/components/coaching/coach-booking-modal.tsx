"use client";

import * as React from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Coach, CoachingMode } from "@/features/coaching/coaching.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CoachBookingModalProps {
  coach: Coach | null;
  initialMode: CoachingMode;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingDetails: {
    coachName: string;
    mode: CoachingMode;
    date: string;
    time: string;
    location: string;
    totalPrice: number;
  }) => void;
}

export function CoachBookingModal({
  coach,
  initialMode,
  isOpen,
  onClose,
  onSuccess,
}: CoachBookingModalProps) {
  const [mode, setMode] = React.useState<CoachingMode>(initialMode);
  const [selectedDate, setSelectedDate] = React.useState("Thứ Tư, 04/11");
  const [selectedTime, setSelectedTime] = React.useState("17:45 - 19:00 (Sau giờ làm)");
  const [selectedLocation, setSelectedLocation] = React.useState("");
  const [squadNames, setSquadNames] = React.useState("Minh Anh, Tuấn Khang");
  const [notes, setNotes] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  React.useEffect(() => {
    setMode(initialMode);
    if (coach && coach.locations.length > 0) {
      setSelectedLocation(coach.supportedGyms[0] || coach.locations[0] || "Phòng gym đối tác");
    }
  }, [initialMode, coach]);

  if (!isOpen || !coach) return null;

  const formatVnd = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const pricePerSession =
    mode === "1:1"
      ? coach.pricing.single1on1.pricePerSession
      : coach.pricing.groupCoaching.pricePerPersonPerSession;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onSuccess({
        coachName: coach.name,
        mode,
        date: selectedDate,
        time: selectedTime,
        location: selectedLocation || coach.locations[0] || "Phòng gym đối tác",
        totalPrice: pricePerSession,
      });
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-background border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-muted/60 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src={coach.avatar}
              alt={coach.name}
              className="w-10 h-10 rounded-2xl object-cover border border-border"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-foreground">Đặt Lịch Coaching</h3>
                <ShieldCheck className="h-3.5 w-3.5 text-[#1b3554] dark:text-[#80aad3]" />
              </div>
              <p className="text-[11px] text-muted-foreground">HLV {coach.name} • {coach.sportCategory}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleConfirm} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {/* Mode Selector (1:1 vs Nhóm) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Chọn hình thức coaching:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("1:1")}
                className={cn(
                  "p-2.5 rounded-2xl border text-left transition-all space-y-1",
                  mode === "1:1"
                    ? "bg-[#1b3554] text-white border-[#1b3554] shadow-xs"
                    : "bg-card border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1 text-xs">
                    <User className="h-3.5 w-3.5" />
                    Kèm 1:1 Riêng
                  </span>
                  <Badge className={mode === "1:1" ? "bg-white/20 text-white text-[9px]" : "bg-muted text-foreground text-[9px]"}>
                    Tối ưu tiến độ
                  </Badge>
                </div>
                <div className={cn("text-xs font-black", mode === "1:1" ? "text-white" : "text-foreground")}>
                  {formatVnd(coach.pricing.single1on1.pricePerSession)}/buổi
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode("group")}
                className={cn(
                  "p-2.5 rounded-2xl border text-left transition-all space-y-1",
                  mode === "group"
                    ? "bg-[#1b3554] text-white border-[#1b3554] shadow-xs"
                    : "bg-card border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1 text-xs">
                    <Users className="h-3.5 w-3.5" />
                    Nhóm Squad (2-4 bạn)
                  </span>
                  <Badge className="bg-emerald-500 text-white text-[9px] font-bold">
                    -{coach.pricing.groupCoaching.savingsPercent}%
                  </Badge>
                </div>
                <div className={cn("text-xs font-black", mode === "group" ? "text-white" : "text-emerald-600 dark:text-emerald-400")}>
                  {formatVnd(coach.pricing.groupCoaching.pricePerPersonPerSession)}/bạn
                </div>
              </button>
            </div>
          </div>

          {/* If Squad: invite friend names */}
          {mode === "group" && (
            <div className="p-2.5 rounded-2xl bg-[#c0e6fd]/30 dark:bg-[#1b3554]/30 border border-[#80aad3]/40 space-y-1.5 animate-in fade-in">
              <label className="text-[10px] font-bold text-foreground flex items-center gap-1">
                <Users className="h-3 w-3 text-[#1b3554] dark:text-[#c0e6fd]" />
                Thành viên trong Micro-Squad cùng tham gia:
              </label>
              <input
                type="text"
                value={squadNames}
                onChange={(e) => setSquadNames(e.target.value)}
                placeholder="Nhập tên bạn tập hoặc mã Squad (VD: Minh Anh, Tuấn Khang)..."
                className="w-full h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
              />
              <p className="text-[10px] text-muted-foreground">
                Mỗi bạn trong nhóm sẽ tự động nhận link xác nhận và chia tiền sòng phẳng trên app.
              </p>
            </div>
          )}

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-[#1b3554] dark:text-[#80aad3]" />
              Chọn ngày tập:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {["Hôm nay, 01/11", "Thứ Tư, 04/11", "Thứ Bảy, 07/11"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={cn(
                    "h-8 rounded-xl text-[11px] font-bold border transition-all truncate px-1",
                    selectedDate === d
                      ? "bg-[#1b3554] text-white border-[#1b3554]"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time slot */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#1b3554] dark:text-[#80aad3]" />
              Khung giờ tập luyện:
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground font-medium focus:outline-hidden"
            >
              <option value="06:00 - 07:15 (Buổi sáng bình minh)">06:00 - 07:15 (Buổi sáng bình minh)</option>
              <option value="11:45 - 13:00 (Nghỉ trưa văn phòng)">11:45 - 13:00 (Nghỉ trưa văn phòng)</option>
              <option value="17:45 - 19:00 (Sau giờ làm)">17:45 - 19:00 (Sau giờ làm tan sở)</option>
              <option value="19:30 - 20:45 (Buổi tối phục hồi)">19:30 - 20:45 (Buổi tối phục hồi)</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#1b3554] dark:text-[#80aad3]" />
              Địa điểm tập:
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground font-medium focus:outline-hidden"
            >
              {coach.supportedGyms.map((gym, i) => (
                <option key={i} value={gym}>
                  {gym}
                </option>
              ))}
              <option value="Tập ngoài trời Landmark 81 / Bờ Kè">Tập ngoài trời Landmark 81 / Bờ Kè</option>
              <option value="Tại nhà học viên (Nội thành TP.HCM)">Tại nhà học viên (Nội thành TP.HCM)</option>
            </select>
          </div>

          {/* Trainee notes / injuries */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Ghi chú thể trạng / chấn thương (nếu có):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Mình bị đau cổ vai gáy do ngồi máy tính nhiều, muốn test inbody và sửa form bài tạ..."
              className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground focus:outline-hidden"
            />
          </div>

          {/* Pricing summary */}
          <div className="p-3 rounded-2xl bg-muted/60 border border-border flex items-center justify-between">
            <div>
              <div className="text-[10px] text-muted-foreground font-semibold">
                Chi phí cho buổi tập ({mode === "1:1" ? "Kèm riêng 1:1" : "Mỗi bạn trong Squad"}):
              </div>
              <div className="text-base font-black text-[#1b3554] dark:text-[#80aad3]">
                {formatVnd(pricePerSession)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                +10 TS thưởng kỷ luật
              </span>
              <span className="text-[9px] text-muted-foreground">Có mặt đúng giờ</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitted}
            className="w-full rounded-full bg-[#1b3554] hover:bg-[#000f22] text-white font-bold text-xs h-9 shadow-xs"
          >
            {isSubmitted ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 animate-spin" />
                Đang giữ lịch và thông báo tới HLV...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span>Xác Nhận Giữ Lịch Tập</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
