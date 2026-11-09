"use client";

import * as React from "react";
import { Check, MapPin, Minus, Plus, Shield, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { KEO_SPORTS, placesForSport } from "@/features/keo/keo.data";
import { distanceKm, isGroupFormValid, isPersonalFormValid, toMinutes } from "@/features/keo/keo.algo";
import type { GroupForm, LatLng, PersonalForm } from "@/features/keo/keo.types";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { TimeActivityPicker } from "./time-activity-picker";

export const DAYS = ["Hôm nay", "Ngày mai", "Thứ Bảy", "Chủ Nhật"];

export const SPORT_EMOJI: Record<string, string> = {
  running: "🏃",
  gym: "🏋️",
  pickleball: "🏓",
  badminton: "🏸",
  football: "⚽",
  basketball: "🏀",
  cycling: "🚴",
  table_tennis: "🏓",
};

export function emptyPersonalForm(): PersonalForm {
  return { sport: "running", place: null, time: { day: "Ngày mai", from: "05:00", to: "07:00" }, note: "", minTrust: 80 };
}

export function emptyGroupForm(): GroupForm {
  return { ...emptyPersonalForm(), sport: "pickleball", capacity: 4, present: 2 };
}

/**
 * Form "Set cá nhân" / "Set nhóm" theo workflow:
 * địa điểm · môn · khoảng thời gian · (số lượng · hiện diện) · note · điểm uy tín → Done
 */
export function KeoForm<T extends PersonalForm>({
  kind,
  value,
  onChange,
  onSubmit,
  viewerPosition,
  myTrust,
  saveAsDefault,
  onSaveAsDefaultChange,
  usingDefault,
  onClearDefault,
}: {
  kind: "personal" | "group";
  value: T;
  onChange: (v: T) => void;
  onSubmit: () => void;
  viewerPosition: LatLng;
  myTrust: number;
  saveAsDefault: boolean;
  onSaveAsDefaultChange: (v: boolean) => void;
  usingDefault: boolean;
  onClearDefault: () => void;
}) {
  const [showAllPlaces, setShowAllPlaces] = React.useState(false);
  const set = (patch: Partial<T>) => onChange({ ...value, ...patch });
  const group = kind === "group" ? (value as unknown as GroupForm) : null;

  const places = React.useMemo(
    () =>
      placesForSport(value.sport)
        .map((p) => ({ p, d: distanceKm(viewerPosition, p.position) }))
        .sort((a, b) => a.d - b.d),
    [value.sport, viewerPosition]
  );

  const valid = group ? isGroupFormValid(group) : isPersonalFormValid(value);
  const missing: string[] = [];
  if (!value.place) missing.push("địa điểm");
  if (toMinutes(value.time.to) <= toMinutes(value.time.from)) missing.push("giờ kết thúc phải sau giờ bắt đầu");
  if (group && group.present >= group.capacity) missing.push("số người đã có phải ít hơn số lượng");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit();
      }}
      className="space-y-5"
    >
      {usingDefault && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 px-3 py-2 text-[12.5px]">
          <Star className="h-4 w-4 text-brand fill-brand shrink-0" />
          <span className="flex-1 text-foreground">Đang dùng cài đặt mặc định của bạn</span>
          <button type="button" onClick={onClearDefault} className="font-bold text-brand dark:text-brand-sky">
            Xoá mặc định
          </button>
        </div>
      )}

      {/* Môn thể thao */}
      <Section title="Chọn môn thể thao">
        <div className="grid grid-cols-4 gap-2">
          {KEO_SPORTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set({ sport: s, place: null } as Partial<T>)}
              aria-pressed={value.sport === s}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border py-2.5 text-[11.5px] font-semibold transition-all active:scale-95",
                value.sport === s
                  ? "bg-brand border-brand text-white shadow-sm"
                  : "border-border text-foreground hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40"
              )}
            >
              <span className="text-xl leading-none">{SPORT_EMOJI[s]}</span>
              {SPORT_LABEL[s]}
            </button>
          ))}
        </div>
      </Section>

      {/* Địa điểm */}
      <Section title="Địa điểm" hint="Sắp xếp theo khoảng cách tới bạn">
        <ul className="space-y-1.5">
          {(showAllPlaces ? places : places.slice(0, 4)).map(({ p, d }) => {
            const selected = value.place?.id === p.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => set({ place: p } as Partial<T>)}
                  aria-pressed={selected}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    selected ? "border-brand bg-brand-50 dark:bg-brand-950/50" : "border-border hover:bg-muted"
                  )}
                >
                  <MapPin className={cn("h-4 w-4 shrink-0", selected ? "text-brand" : "text-muted-foreground")} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-semibold text-foreground truncate">{p.name}</span>
                    <span className="block text-[11.5px] text-muted-foreground">{p.area}</span>
                  </span>
                  <span className="text-[12px] font-semibold text-muted-foreground shrink-0">{d.toFixed(1)} km</span>
                  {selected && <Check className="h-4 w-4 text-brand shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
        {places.length > 4 && (
          <button type="button" onClick={() => setShowAllPlaces((v) => !v)} className="text-[12.5px] font-bold text-brand dark:text-brand-sky">
            {showAllPlaces ? "Thu gọn" : `Xem thêm ${places.length - 4} địa điểm`}
          </button>
        )}
      </Section>

      {/* Khoảng thời gian */}
      <Section title="Khoảng thời gian" hint="Cột cao = giờ nhiều người tập">
        <Chips options={DAYS} value={value.time.day} onChange={(day) => set({ time: { ...value.time, day } } as Partial<T>)} />
        <TimeActivityPicker
          sport={value.sport}
          day={value.time.day}
          from={value.time.from}
          to={value.time.to}
          onChange={(from, to) => set({ time: { ...value.time, from, to } } as Partial<T>)}
        />
      </Section>

      {/* Nhóm: số lượng & hiện diện */}
      {group && (
        <Section title="Quy mô nhóm">
          <div className="grid grid-cols-2 gap-2">
            <Stepper
              label="Số lượng"
              hint="tổng số người"
              value={group.capacity}
              min={2}
              max={22}
              onChange={(capacity) => set({ capacity, present: Math.min(group.present, capacity - 1) } as unknown as Partial<T>)}
            />
            <Stepper
              label="Hiện diện"
              hint="đã có, tính cả bạn"
              value={group.present}
              min={1}
              max={Math.max(1, group.capacity - 1)}
              onChange={(present) => set({ present } as unknown as Partial<T>)}
            />
          </div>
          <p className="text-[12px] text-muted-foreground">
            Nhóm đang thiếu <b className="text-foreground">{Math.max(0, group.capacity - group.present)} người</b>
          </p>
        </Section>
      )}

      {/* Note */}
      <Section title="Ghi chú">
        <textarea
          value={value.note}
          onChange={(e) => set({ note: e.target.value } as Partial<T>)}
          rows={2}
          maxLength={200}
          placeholder={kind === "group" ? "VD: Trình phong trào, chia tiền sân 60k/người" : "VD: Chạy pace 6:00, sau đó cà phê"}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[13.5px] outline-none focus:ring-2 focus:ring-brand/30"
        />
      </Section>

      {/* Điểm uy tín */}
      <Section title="Điểm uy tín tối thiểu" hint={`Bạn đang có ${myTrust} TS`}>
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-brand shrink-0" />
          <input
            type="range"
            min={0}
            max={150}
            step={10}
            value={value.minTrust}
            onChange={(e) => set({ minTrust: Number(e.target.value) } as Partial<T>)}
            aria-label="Điểm uy tín tối thiểu"
            className="flex-1 accent-brand"
          />
          <span className="w-16 text-right text-[14px] font-extrabold font-display text-foreground">{value.minTrust} TS</span>
        </div>
        <p className="text-[12px] text-muted-foreground">
          {kind === "group" ? "Chỉ hiện nhóm có chủ nhóm" : "Chỉ ghép với người"} đạt từ {value.minTrust} TS trở lên.
        </p>
      </Section>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={saveAsDefault}
          onChange={(e) => onSaveAsDefaultChange(e.target.checked)}
          className="h-5 w-5 accent-brand"
        />
        <span className="text-[13.5px] text-foreground">
          <b>Đặt làm mặc định</b> cho lần lên kèo sau
        </span>
      </label>

      <div className="sticky bottom-[72px] pt-2 pb-1 bg-gradient-to-t from-background via-background to-transparent">
        <button
          type="submit"
          disabled={!valid}
          className="w-full rounded-full py-3.5 text-[15px] font-bold transition-all bg-brand text-white hover:bg-brand-700 active:scale-[0.98] shadow-md shadow-brand/20 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none disabled:cursor-not-allowed dark:disabled:bg-neutral-800"
        >
          Done · {kind === "group" ? "Tìm nhóm" : "Tìm bạn tập"}
        </button>
        {!valid && missing.length > 0 && (
          <p className="mt-1.5 text-center text-[12px] text-muted-foreground">Còn thiếu: {missing.join(", ")}</p>
        )}
      </div>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="flex w-full items-baseline justify-between mb-2">
        <span className="text-[14px] font-bold text-foreground">{title}</span>
        {hint && <span className="text-[11.5px] text-muted-foreground">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
            value === o ? "bg-brand border-brand text-white" : "border-border text-foreground hover:bg-muted"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-2.5">
      <p className="text-[12.5px] font-semibold text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
      <div className="mt-1.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Giảm ${label}`}
          className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-brand-100 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-[18px] font-extrabold font-display text-foreground" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Tăng ${label}`}
          className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-brand-100 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
