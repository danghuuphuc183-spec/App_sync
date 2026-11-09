"use client";

import * as React from "react";
import { Bell, Camera, Check, Loader2, MapPin, Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingProfile, PermState } from "@/features/onboarding/onboarding";
import { BottomSheet } from "@/components/feed/bottom-sheet";

type PermKey = keyof OnboardingProfile["permissions"];

/** Xin quyền thật của trình duyệt / thiết bị (nếu có) */
export async function requestPermission(key: PermKey): Promise<{ state: PermState; position?: [number, number] }> {
  try {
    if (key === "gps") {
      if (!navigator.geolocation) return { state: "unsupported" };
      return await new Promise((resolve) =>
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ state: "granted", position: [p.coords.latitude, p.coords.longitude] }),
          (e) => resolve({ state: e.code === e.PERMISSION_DENIED ? "denied" : "granted" }),
          { timeout: 8000 }
        )
      );
    }
    if (key === "camera") {
      if (!navigator.mediaDevices?.getUserMedia) return { state: "unsupported" };
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      return { state: "granted" };
    }
    if (key === "notifications") {
      if (!("Notification" in window)) return { state: "unsupported" };
      const r = await Notification.requestPermission();
      return { state: r === "granted" ? "granted" : r === "denied" ? "denied" : "unknown" };
    }
    // Chuyển động & thể lực (iOS 13+ cần xin quyền)
    const DM = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
    if (DM?.requestPermission) return { state: (await DM.requestPermission()) === "granted" ? "granted" : "denied" };
    return { state: "DeviceMotionEvent" in window ? "granted" : "unsupported" };
  } catch {
    return { state: "denied" };
  }
}

const PERMS: { key: PermKey; title: string; why: string; icon: typeof MapPin; required?: boolean }[] = [
  { key: "gps", title: "Vị trí (GPS)", why: "Ghép bạn tập trong 3 km, chỉ đường tới điểm hẹn và chống GPS giả.", icon: MapPin, required: true },
  { key: "camera", title: "Máy ảnh", why: "Quét QR check-in tại điểm hẹn, chụp ảnh buổi tập.", icon: Camera },
  { key: "notifications", title: "Thông báo", why: "Nhắc giờ kèo, lời mời ghép đội, cảnh báo mưa dông.", icon: Bell },
  { key: "motion", title: "Chuyển động & thể lực", why: "Đếm bước, nhận biết đang chạy để xác thực buổi tập.", icon: Smartphone },
];

const STATE_TEXT: Record<PermState, string> = { unknown: "Cho phép", granted: "Đã cho phép", denied: "Bị từ chối", unsupported: "Không hỗ trợ" };

export function PermissionsStep({
  value,
  onChange,
  onPosition,
}: {
  value: OnboardingProfile["permissions"];
  onChange: (v: OnboardingProfile["permissions"]) => void;
  onPosition: (p: [number, number]) => void;
}) {
  const [busy, setBusy] = React.useState<PermKey | null>(null);
  const ask = async (key: PermKey) => {
    setBusy(key);
    const r = await requestPermission(key);
    if (r.position) onPosition(r.position);
    onChange({ ...value, [key]: r.state });
    setBusy(null);
  };
  return (
    <div className="space-y-2.5">
      {PERMS.map((p) => {
        const st = value[p.key];
        return (
          <div key={p.key} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 p-3.5">
            <span className="h-11 w-11 shrink-0 rounded-xl bg-brand/30 flex items-center justify-center">
              <p.icon className="h-5 w-5 text-brand-sky" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold">
                {p.title} {p.required && <span className="ml-1 rounded bg-brand-sky/20 px-1.5 py-0.5 text-[10px] text-brand-sky">Cần thiết</span>}
              </p>
              <p className="text-[12px] text-white/60 leading-snug">{p.why}</p>
              {st === "denied" && <p className="mt-1 text-[11.5px] text-amber-300">Hãy bật lại trong Cài đặt trình duyệt / điện thoại.</p>}
            </div>
            <button
              onClick={() => void ask(p.key)}
              disabled={busy !== null || st === "granted" || st === "unsupported"}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-bold flex items-center gap-1 transition-colors",
                st === "granted" ? "bg-emerald-400/15 text-emerald-300" : st === "denied" ? "bg-white/10 text-white" : st === "unsupported" ? "bg-white/5 text-white/40" : "bg-brand text-white hover:bg-brand-500"
              )}
            >
              {busy === p.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : st === "granted" ? <Check className="h-3.5 w-3.5" /> : st === "denied" ? <X className="h-3.5 w-3.5" /> : null}
              {st === "denied" ? "Thử lại" : STATE_TEXT[st]}
            </button>
          </div>
        );
      })}
      <p className="text-[11.5px] text-white/50">Bạn có thể đổi quyền bất kỳ lúc nào trong Hồ sơ → Riêng tư. Vị trí chỉ chia sẻ khi bạn bật “Tập tại đây”.</p>
    </div>
  );
}

/* ====================================================================== */
/* Liên kết ứng dụng thể thao                                              */
/* ====================================================================== */
export interface SportApp {
  id: string;
  name: string;
  platform: string;
  color: string;
  short: string;
  scopes: string[];
  syncPreview: string;
  note?: string;
}

export const SPORT_APPS: SportApp[] = [
  { id: "appleHealth", name: "Apple Health", platform: "iPhone · Apple Watch", color: "#FF2D55", short: "♥", scopes: ["Bài tập", "Nhịp tim", "Bước chân & quãng đường", "Năng lượng tiêu hao"], syncPreview: "38 bài tập · nhịp tim nghỉ 58 bpm" },
  { id: "samsungHealth", name: "Samsung Health", platform: "Galaxy · Galaxy Watch", color: "#1428A0", short: "S", scopes: ["Bài tập", "Nhịp tim", "Giấc ngủ", "Bước chân"], syncPreview: "22 bài tập · 7.400 bước/ngày" },
  { id: "healthConnect", name: "Health Connect (Google Fit)", platform: "Android", color: "#34A853", short: "G", scopes: ["Phiên tập", "Nhịp tim", "Quãng đường"], syncPreview: "19 phiên tập · 42 km tháng này" },
  { id: "strava", name: "Strava", platform: "Chạy bộ · Đạp xe", color: "#FC4C02", short: "S", scopes: ["Đọc hoạt động (pace, cự ly, độ cao)", "Đọc hồ sơ vận động viên"], syncPreview: "Pace TB 6:05/km · 31 km/tuần" },
  {
    id: "hevy",
    name: "Hevy",
    platform: "Gym",
    color: "#1D4ED8",
    short: "H",
    scopes: ["Bản ghi buổi tập tạ", "Khối lượng & số hiệp"],
    syncPreview: "12 buổi tạ · khối lượng 10.200 kg/tuần",
    note: "Đọc trực tiếp bản ghi có nguồn từ ứng dụng Hevy (bundle ID com.hevyapp.hevy) qua Apple Health / Health Connect — không đọc dữ liệu app khác.",
  },
  { id: "garmin", name: "Garmin Connect", platform: "Đồng hồ Garmin", color: "#007CC3", short: "G", scopes: ["Hoạt động", "Nhịp tim", "VO2 max"], syncPreview: "VO2 max 46 · 27 hoạt động" },
  { id: "coros", name: "COROS", platform: "Đồng hồ COROS", color: "#111111", short: "C", scopes: ["Hoạt động", "Nhịp tim"], syncPreview: "14 hoạt động" },
  { id: "huaweiHealth", name: "Huawei Health", platform: "Huawei Watch", color: "#C7000B", short: "H", scopes: ["Bài tập", "Nhịp tim"], syncPreview: "9 bài tập" },
];

export function ConnectAppsStep({ connected, onChange }: { connected: string[]; onChange: (ids: string[]) => void }) {
  const [open, setOpen] = React.useState<SportApp | null>(null);
  const [linking, setLinking] = React.useState(false);

  const link = async () => {
    if (!open) return;
    setLinking(true);
    await new Promise((r) => setTimeout(r, 900));
    onChange([...new Set([...connected, open.id])]);
    setLinking(false);
    setOpen(null);
  };

  return (
    <>
      <div className="space-y-2">
        {SPORT_APPS.map((a) => {
          const on = connected.includes(a.id);
          return (
            <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 p-3">
              <span className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-[18px] font-black text-white" style={{ background: a.color }}>
                {a.short}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold">{a.name}</p>
                <p className="text-[11.5px] text-white/55 truncate">{on ? `✓ ${a.syncPreview}` : a.platform}</p>
              </div>
              {on ? (
                <button onClick={() => onChange(connected.filter((x) => x !== a.id))} className="shrink-0 rounded-full bg-emerald-400/15 text-emerald-300 px-3 py-1.5 text-[12px] font-bold">
                  Đã kết nối
                </button>
              ) : (
                <button onClick={() => setOpen(a)} className="shrink-0 rounded-full bg-white text-black px-3.5 py-1.5 text-[12px] font-bold hover:bg-neutral-200">
                  Kết nối
                </button>
              )}
            </div>
          );
        })}
      </div>

      <BottomSheet open={!!open} onClose={() => setOpen(null)} title={open ? `Kết nối ${open.name}` : ""} bodyClassName="p-4 pb-7 space-y-3">
        {open && (
          <>
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-xl flex items-center justify-center text-[20px] font-black text-white" style={{ background: open.color }}>
                {open.short}
              </span>
              <span className="text-[20px] text-muted-foreground">⇄</span>
              <img src="/logo-icon-128.png" alt="SYNESIS" className="h-12 w-12 rounded-xl" />
            </div>
            <p className="text-[13.5px] text-foreground">SYNESIS sẽ được phép <b>chỉ đọc</b>:</p>
            <ul className="space-y-1.5">
              {open.scopes.map((s) => (
                <li key={s} className="flex items-center gap-2 text-[13px] text-foreground">
                  <Check className="h-4 w-4 text-brand" /> {s}
                </li>
              ))}
            </ul>
            {open.note && <p className="rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 p-2.5 text-[12px] text-foreground">{open.note}</p>}
            <p className="text-[11.5px] text-muted-foreground">Không đăng bài, không sửa dữ liệu của bạn. Có thể ngắt kết nối bất kỳ lúc nào. (Bản thử nghiệm mô phỏng việc uỷ quyền.)</p>
            <button onClick={() => void link()} disabled={linking} className="w-full h-12 rounded-full bg-brand hover:bg-brand-700 text-white font-bold text-[14px] flex items-center justify-center gap-2">
              {linking && <Loader2 className="h-4 w-4 animate-spin" />} Cho phép & kết nối
            </button>
          </>
        )}
      </BottomSheet>
    </>
  );
}
