"use client";

import * as React from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  MapPin,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  Smile,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KEO_SPORTS, placesForSport } from "@/features/keo/keo.data";
import { distanceKm, isGroupFormValid, isPersonalFormValid, toMinutes } from "@/features/keo/keo.algo";
import type { GroupForm, KeoPlace, LatLng, PersonalForm } from "@/features/keo/keo.types";
import { searchPlaces } from "@/features/keo/place-search";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { TimeActivityPicker } from "./time-activity-picker";
import { SportIcon } from "@/components/shared/sport-icon";
import { DayCalendar } from "./day-calendar";
import { addDays, toIsoDay } from "@/features/keo/keo-date";
import { defaultDetails, fieldsForSport, isDetailsComplete, toggleDetail } from "@/features/keo/session-details";
import type {
  MusicPreference,
  PostWorkoutPreference,
  TalkLevel,
  VibeMode,
} from "@/features/match/partner-match";

export function emptyPersonalForm(): PersonalForm {
  return {
    sport: "running",
    place: null,
    time: { day: toIsoDay(addDays(new Date(), 1)), from: "05:00", to: "07:00" },
    note: "",
    minTrust: 0,
    details: defaultDetails("running"),
    vibe: "friendly",
    vibePreferences: {
      mode: "friendly",
      talkLevel: "moderate",
      feedbackStyle: "encouraging",
      musicPreference: "own_music",
      postWorkout: "coffee_social",
      photoCheckin: "flexible",
      mustHaveVibe: false,
    },
    mustHaveVibe: false,
    sameGenderOnly: false,
  };
}

export function emptyGroupForm(): GroupForm {
  return { ...emptyPersonalForm(), sport: "running", details: defaultDetails("running"), capacity: 4, present: 2 };
}

const VIBE_MODES = [
  {
    id: "performance" as const,
    label: "Performance",
    tagline: "Tập trung cao độ",
    icon: Flame,
  },
  {
    id: "friendly" as const,
    label: "Thân thiện",
    tagline: "Cởi mở, kết nối",
    icon: Smile,
  },
  {
    id: "flexible" as const,
    label: "Linh hoạt",
    tagline: "Tự do, thích nghi",
    icon: SlidersHorizontal,
  },
];

const VIBE_INFO: Record<VibeMode, { title: string; desc: string }> = {
  performance: {
    title: "Performance Mode",
    desc: "Tập trung hoàn thành buổi, ít xã giao (Talk low; feedback ngắn gọn; hạn chế tối đa gián đoạn bài tập).",
  },
  friendly: {
    title: "Friendly Companion",
    desc: "Cởi mở, trao đổi và khích lệ lẫn nhau (Talk medium/high; trò chuyện thân thiện & giao lưu cafe sau tập).",
  },
  flexible: {
    title: "Flexible (Linh hoạt)",
    desc: "Không yêu cầu khắt khe, thoải mái hòa nhịp và sẵn sàng thích nghi theo phong cách của bạn tập.",
  },
};

export type KeoFormKind = "solo" | "personal" | "group";

const SUBMIT_LABEL: Record<KeoFormKind, string> = {
  solo: "Lưu kế hoạch tự tập",
  personal: "Done · Tìm bạn tập",
  group: "Done · Tìm nhóm",
};

/**
 * Form "Set cá nhân" / "Set nhóm" theo workflow:
 * môn · chi tiết buổi tập · địa điểm · khoảng thời gian · (số lượng · hiện diện) · note → Done
 * Không còn ô "điểm uy tín tối thiểu" (D31).
 */
export function KeoForm<T extends PersonalForm>({
  kind,
  value,
  onChange,
  onSubmit,
  viewerPosition,
  saveAsDefault,
  onSaveAsDefaultChange,
  usingDefault,
  onClearDefault,
}: {
  kind: KeoFormKind;
  value: T;
  onChange: (v: T) => void;
  onSubmit: () => void;
  viewerPosition: LatLng;
  saveAsDefault?: boolean;
  onSaveAsDefaultChange?: (v: boolean) => void;
  usingDefault?: boolean;
  onClearDefault?: () => void;
}) {
  const [showAllPlaces, setShowAllPlaces] = React.useState(false);
  const [showVibeDetails, setShowVibeDetails] = React.useState(false);
  const [placeQuery, setPlaceQuery] = React.useState("");
  // đổi môn → danh sách địa điểm khác → xoá từ khoá cũ
  React.useEffect(() => setPlaceQuery(""), [value.sport]);
  const hits = React.useMemo(() => searchPlaces(value.sport, placeQuery, viewerPosition), [value.sport, placeQuery, viewerPosition]);
  const set = (patch: Partial<T>) => onChange({ ...value, ...patch });
  const group = kind === "group" ? (value as unknown as GroupForm) : null;

  const places = React.useMemo(
    () =>
      placesForSport(value.sport)
        .map((p) => ({ p, d: distanceKm(viewerPosition, p.position) }))
        .sort((a, b) => a.d - b.d),
    [value.sport, viewerPosition]
  );

  const detailsOk = isDetailsComplete(value.sport, value.details);
  const valid = (group ? isGroupFormValid(group) : isPersonalFormValid(value)) && detailsOk;
  const missing: string[] = [];
  if (!detailsOk) missing.push("chi tiết buổi tập");
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
          <Star className="h-4 w-4 text-foreground fill-foreground shrink-0" />
          <span className="flex-1 text-foreground">Đang dùng cài đặt mặc định của bạn</span>
          <button type="button" onClick={() => onClearDefault?.()} className="font-bold text-brand dark:text-brand-sky">
            Xoá mặc định
          </button>
        </div>
      )}

      {/* Môn thể thao (Giai đoạn 1: 3 môn chính) */}
      <Section title="Chọn môn thể thao (Giai đoạn 1)">
        <div className="grid grid-cols-3 gap-2">
          {KEO_SPORTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set({ sport: s, place: null, details: defaultDetails(s) } as Partial<T>)}
              aria-pressed={value.sport === s}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs font-bold transition-all active:scale-95 shadow-2xs",
                value.sport === s
                  ? "bg-brand border-brand text-white shadow-xs"
                  : "border-border text-foreground hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40"
              )}
            >
              <SportIcon sport={s} className="h-6 w-6" />
              <span>{SPORT_LABEL[s]}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Chi tiết buổi tập theo môn */}
      {fieldsForSport(value.sport).length > 0 && (
        <Section title="Chi tiết buổi tập">
          <div className="space-y-3 rounded-2xl border border-border p-3">
            {fieldsForSport(value.sport).map((f) => (
              <div key={f.id} role="group" aria-label={f.label}>
                <p className="mb-1.5 text-[12.5px] font-semibold text-foreground">
                  {f.label}
                  {f.multi && <span className="font-normal text-muted-foreground"> · chọn được nhiều</span>}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {f.options.map((o) => {
                    const on = value.details?.[f.id]?.includes(o) ?? false;
                    return (
                      <button
                        key={o}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set({ details: toggleDetail(value.details ?? {}, f, o) } as Partial<T>)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                          on ? "bg-foreground border-foreground text-background" : "border-border text-foreground hover:bg-muted"
                        )}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* VIBE & Phong cách tập (Master Spec Section 2.3 & 4.4) */}
      <Section title="Vibe & Phong cách tập" hint="Đồng điệu tính cách để tập bền bỉ">
        <div className="grid grid-cols-3 gap-2">
          {VIBE_MODES.map((vm) => {
            const active = (value.vibe ?? "friendly") === vm.id;
            const Icon = vm.icon;
            return (
              <button
                key={vm.id}
                type="button"
                onClick={() => {
                  const currentPref = value.vibePreferences ?? {
                    mode: vm.id,
                    talkLevel: vm.id === "performance" ? "quiet" : vm.id === "friendly" ? "social" : "moderate",
                    postWorkout: vm.id === "performance" ? "leave_immediately" : vm.id === "friendly" ? "coffee_social" : "flexible",
                    musicPreference: "own_music",
                    mustHaveVibe: value.mustHaveVibe ?? false,
                  };
                  set({
                    vibe: vm.id,
                    vibePreferences: { ...currentPref, mode: vm.id },
                  } as Partial<T>);
                }}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-center text-center rounded-2xl border p-2.5 transition-all active:scale-[0.98] shadow-2xs relative",
                  active
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "border-border text-foreground hover:border-brand-300 hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center mb-1.5",
                    active ? "bg-background/20 text-background" : "bg-muted text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 stroke-[2]" />
                </div>
                <span className="text-[12.5px] font-bold leading-tight">{vm.label}</span>
                <span className={cn("text-[10px] mt-0.5 line-clamp-1", active ? "text-background/80" : "text-muted-foreground")}>
                  {vm.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mô tả ngắn gọn về VIBE đã chọn */}
        <div className="rounded-xl bg-muted/60 border border-border/80 px-3 py-2 text-[11.5px] text-muted-foreground leading-snug">
          <b className="text-foreground">{VIBE_INFO[value.vibe ?? "friendly"].title}: </b>
          {VIBE_INFO[value.vibe ?? "friendly"].desc}
        </div>

        {/* Mở rộng tuỳ chỉnh chi tiết Vibe & Ranh giới */}
        <div className="rounded-2xl border border-border p-3 space-y-3 bg-card/50">
          <button
            type="button"
            onClick={() => setShowVibeDetails((v) => !v)}
            className="w-full flex items-center justify-between text-left text-[12.5px] font-bold text-foreground"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-foreground stroke-[2]" />
              Tuỳ chỉnh chi tiết VIBE & Ranh giới
            </span>
            {showVibeDetails ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showVibeDetails && (
            <div className="space-y-3 pt-1 border-t border-border/60">
              {/* Mức độ trò chuyện */}
              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold text-foreground">Mức độ trò chuyện (Talk level)</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "quiet", label: "Ít nói / Yên tĩnh" },
                    { id: "moderate", label: "Vừa phải" },
                    { id: "social", label: "Cởi mở, nhiều" },
                  ].map((t) => {
                    const on = (value.vibePreferences?.talkLevel ?? "moderate") === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          set({
                            vibePreferences: {
                              ...(value.vibePreferences ?? { mode: value.vibe ?? "friendly" }),
                              talkLevel: t.id as TalkLevel,
                            },
                          } as Partial<T>)
                        }
                        className={cn(
                          "rounded-lg border px-2 py-1.5 text-[11.5px] font-semibold text-center transition-colors",
                          on ? "bg-foreground border-foreground text-background" : "border-border text-foreground hover:bg-muted"
                        )}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sau buổi tập */}
              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold text-foreground">Sau buổi tập (Post-workout)</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "coffee_social", label: "Giao lưu / Cafe" },
                    { id: "leave_immediately", label: "Tập xong về ngay" },
                    { id: "flexible", label: "Tùy hứng" },
                  ].map((p) => {
                    const on = (value.vibePreferences?.postWorkout ?? "coffee_social") === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          set({
                            vibePreferences: {
                              ...(value.vibePreferences ?? { mode: value.vibe ?? "friendly" }),
                              postWorkout: p.id as PostWorkoutPreference,
                            },
                          } as Partial<T>)
                        }
                        className={cn(
                          "rounded-lg border px-2 py-1.5 text-[11.5px] font-semibold text-center transition-colors",
                          on ? "bg-foreground border-foreground text-background" : "border-border text-foreground hover:bg-muted"
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Âm nhạc */}
              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold text-foreground">Âm nhạc khi tập</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "own_music", label: "Tai nghe riêng" },
                    { id: "shared", label: "Bật loa chung" },
                    { id: "ambient", label: "Tự nhiên" },
                  ].map((m) => {
                    const on = (value.vibePreferences?.musicPreference ?? "own_music") === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          set({
                            vibePreferences: {
                              ...(value.vibePreferences ?? { mode: value.vibe ?? "friendly" }),
                              musicPreference: m.id as MusicPreference,
                            },
                          } as Partial<T>)
                        }
                        className={cn(
                          "rounded-lg border px-2 py-1.5 text-[11.5px] font-semibold text-center transition-colors",
                          on ? "bg-foreground border-foreground text-background" : "border-border text-foreground hover:bg-muted"
                        )}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bộ lọc cứng VIBE & Giới tính */}
              <div className="pt-1.5 space-y-2 border-t border-border/60">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!value.mustHaveVibe}
                    onChange={(e) =>
                      set({
                        mustHaveVibe: e.target.checked,
                        vibePreferences: {
                          ...(value.vibePreferences ?? { mode: value.vibe ?? "friendly" }),
                          mustHaveVibe: e.target.checked,
                        },
                      } as Partial<T>)
                    }
                    className="mt-0.5 h-4 w-4 rounded accent-brand"
                  />
                  <div className="text-left">
                    <span className="block text-[12px] font-bold text-foreground">Bắt buộc khớp VIBE (Must-have)</span>
                    <span className="block text-[11px] text-muted-foreground">Bộ lọc cứng: chỉ gợi ý bạn tập có cùng phong cách VIBE đã chọn</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!value.sameGenderOnly}
                    onChange={(e) => set({ sameGenderOnly: e.target.checked } as Partial<T>)}
                    className="mt-0.5 h-4 w-4 rounded accent-brand"
                  />
                  <div className="text-left">
                    <span className="block text-[12px] font-bold text-foreground">Ưu tiên bạn cùng giới tính</span>
                    <span className="block text-[11px] text-muted-foreground">Ranh giới an toàn: chỉ kết nối với người tập cùng giới tính</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Địa điểm: ô tìm kiếm + gợi ý gần bạn */}
      <Section title="Địa điểm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={placeQuery}
            onChange={(e) => setPlaceQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            aria-label="Tìm địa điểm"
            placeholder={value.sport === "running" || value.sport === "cycling" ? "Tìm cung đường, khu vực (vd: Thảo Điền, Quận 7)" : "Tìm sân, phòng tập, khu vực (vd: Quận 7)"}
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-9 text-[13.5px] outline-none focus:ring-2 focus:ring-brand/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {placeQuery && (
            <button
              type="button"
              onClick={() => setPlaceQuery("")}
              aria-label="Xoá tìm kiếm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {placeQuery.trim() && (
          <div className="space-y-1.5" aria-label="Kết quả tìm kiếm">
            <p className="text-[12px] font-bold text-muted-foreground">
              {hits.length ? `Kết quả cho “${placeQuery.trim()}” · ${hits.length}` : `Không tìm thấy “${placeQuery.trim()}”`}
            </p>
            {hits.length === 0 ? (
              <p className="rounded-xl bg-muted px-3 py-2.5 text-[12.5px] text-muted-foreground">
                Thử gõ tên khác, tên quận hoặc chọn một địa điểm gợi ý bên dưới.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {hits.map(({ place: p, distanceKm: d }) => (
                  <PlaceRow key={p.id} place={p} km={d} selected={value.place?.id === p.id} onSelect={() => set({ place: p } as Partial<T>)} />
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="space-y-1.5" aria-label="Địa điểm gợi ý">
          <p className="flex items-baseline justify-between text-[12px] font-bold text-muted-foreground">
            <span>Gợi ý gần bạn</span>
            <span className="font-normal text-[11.5px]">Sắp xếp theo khoảng cách</span>
          </p>
          <ul className="space-y-1.5">
            {(showAllPlaces ? places : places.slice(0, 4)).map(({ p, d }) => (
              <PlaceRow key={p.id} place={p} km={d} selected={value.place?.id === p.id} onSelect={() => set({ place: p } as Partial<T>)} />
            ))}
          </ul>
          {places.length > 4 && (
            <button type="button" onClick={() => setShowAllPlaces((v) => !v)} className="text-[12.5px] font-bold text-brand dark:text-brand-sky">
              {showAllPlaces ? "Thu gọn" : `Xem thêm ${places.length - 4} địa điểm`}
            </button>
          )}
        </div>
      </Section>

      {/* Khoảng thời gian */}
      <Section title="Ngày & giờ tập" hint="Cột cao = giờ nhiều người tập">
        <DayCalendar value={value.time.day} onChange={(day) => set({ time: { ...value.time, day } } as Partial<T>)} />
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
          placeholder={
            kind === "group" ? "VD: Chia tiền sân 60k/người" : kind === "solo" ? "VD: Mục tiêu tuần này, bài tập phụ" : "VD: Sau buổi tập đi cà phê"
          }
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[13.5px] outline-none focus:ring-2 focus:ring-brand/30"
        />
      </Section>

      {onSaveAsDefaultChange && (
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!saveAsDefault}
            onChange={(e) => onSaveAsDefaultChange(e.target.checked)}
            className="h-5 w-5 accent-brand"
          />
          <span className="text-[13.5px] text-foreground">
            <b>Đặt làm mặc định</b> cho lần lên kèo sau
          </span>
        </label>
      )}

      <div className="sticky bottom-[72px] pt-2 pb-1 bg-gradient-to-t from-background via-background to-transparent">
        <button
          type="submit"
          disabled={!valid}
          className="w-full rounded-lg py-3.5 text-[15px] font-bold transition-all bg-brand text-white hover:bg-brand-700 active:scale-[0.98] shadow-md shadow-brand/20 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none disabled:cursor-not-allowed dark:disabled:bg-neutral-800"
        >
          {SUBMIT_LABEL[kind]}
        </button>
        {!valid && missing.length > 0 && (
          <p className="mt-1.5 text-center text-[12px] text-muted-foreground">Còn thiếu: {missing.join(", ")}</p>
        )}
      </div>
    </form>
  );
}

function PlaceRow({ place: p, km, selected, onSelect }: { place: KeoPlace; km: number; selected: boolean; onSelect: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
          selected ? "border-brand bg-brand-50 dark:bg-brand-950/50" : "border-border hover:bg-muted"
        )}
      >
        <MapPin className={cn("h-4 w-4 shrink-0", selected ? "text-foreground" : "text-muted-foreground")} />
        <span className="flex-1 min-w-0">
          <span className="block text-[13.5px] font-semibold text-foreground truncate">{p.name}</span>
          <span className="block text-[11.5px] text-muted-foreground">{p.area}</span>
        </span>
        <span className="text-[12px] font-semibold text-muted-foreground shrink-0">{km.toFixed(1)} km</span>
        {selected && <Check className="h-4 w-4 text-foreground shrink-0" />}
      </button>
    </li>
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
