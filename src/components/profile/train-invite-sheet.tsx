"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarCheck, MessageCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from "@/features/feed/feed.types";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { STRAVA_ROUTES } from "@/features/venues/routes.data";
import { SPORTS_VENUES_DATABASE } from "@/features/venues/venues.data";
import { BottomSheet } from "@/components/feed/bottom-sheet";

const DAYS = ["Hôm nay", "Ngày mai", "Thứ Bảy", "Chủ Nhật"];
const TIMES = ["05:15", "05:30", "06:00", "17:30", "18:30", "19:30"];

/** "Hẹn đi tập": chọn môn, ngày, giờ, địa điểm và gửi lời mời cho người kia. */
export function TrainInviteSheet({ open, onClose, person }: { open: boolean; onClose: () => void; person: Person }) {
  const sports = person.sports.length ? person.sports : ["running"];
  const [sport, setSport] = React.useState(sports[0]!);
  const [day, setDay] = React.useState(DAYS[1]!);
  const [time, setTime] = React.useState(TIMES[1]!);
  const [place, setPlace] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const placeOptions = React.useMemo(() => {
    const routes = STRAVA_ROUTES.filter((r) => r.sport === sport).map((r) => r.name);
    const venues = SPORTS_VENUES_DATABASE.filter((v) => v.sport === sport).map((v) => v.name);
    return [...routes, ...venues].slice(0, 6);
  }, [sport]);

  React.useEffect(() => {
    if (!open) return;
    setSent(false);
    setMessage(`Chào ${person.name}! Mình rủ bạn tập ${SPORT_LABEL[sports[0]!]?.toLowerCase() ?? ""} cùng nhé`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, person.id]);

  React.useEffect(() => setPlace(placeOptions[0] ?? ""), [placeOptions]);

  return (
    <BottomSheet open={open} onClose={onClose} title={sent ? "Đã gửi lời mời" : `Hẹn đi tập với ${person.name}`} bodyClassName="p-4 pb-6 space-y-4">
      {sent ? (
        <div className="text-center space-y-3 py-2">
          <CalendarCheck className="h-12 w-12 text-foreground mx-auto" />
          <p className="text-[14px] text-foreground">
            Đã gửi lời mời <b>{SPORT_LABEL[sport]}</b> lúc <b>{time} · {day}</b> tại <b>{place}</b> tới {person.name}.
          </p>
          <p className="text-[12.5px] text-muted-foreground">Bạn sẽ nhận thông báo khi {person.name} đồng ý.</p>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2.5 text-[13px] font-bold">
              Xong
            </button>
            <Link href="/chat" className="flex-1 rounded-lg bg-brand text-white py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5">
              <MessageCircle className="h-4 w-4" /> Nhắn tin
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (place.trim()) setSent(true);
          }}
          className="space-y-4"
        >
          <Field label="Môn tập">
            <Chips options={sports} value={sport} onChange={setSport} render={(s) => SPORT_LABEL[s] ?? s} />
          </Field>
          <Field label="Ngày">
            <Chips options={DAYS} value={day} onChange={setDay} />
          </Field>
          <Field label="Giờ">
            <Chips options={TIMES} value={time} onChange={setTime} />
          </Field>
          <Field label="Địa điểm">
            <input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              list="train-place-options"
              required
              placeholder="Nhập hoặc chọn địa điểm"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[13.5px] outline-none focus:ring-2 focus:ring-brand/30"
            />
            <datalist id="train-place-options">
              {placeOptions.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </Field>
          <Field label="Lời nhắn">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[13.5px] outline-none focus:ring-2 focus:ring-brand/30"
            />
          </Field>
          <div className="flex items-center gap-3 rounded-xl bg-muted border border-border p-3">
            <Shield className="h-5 w-5 text-foreground shrink-0" />
            <span className="flex-1 text-[12.5px] text-foreground">
              Sau khi hai bạn chốt kèo: huỷ sớm <b>−0,25 UT</b>, huỷ trong 30 phút <b>−0,5 UT</b>, vắng <b>−1 UT</b>.
            </span>
          </div>
          <button type="submit" className="w-full rounded-lg bg-brand hover:bg-brand-700 text-white font-bold py-3 text-[14px]">
            Gửi lời mời tập
          </button>
        </form>
      )}
    </BottomSheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[12px] font-semibold text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Chips({
  options,
  value,
  onChange,
  render = (s) => s,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  render?: (s: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold",
            value === o ? "bg-brand text-white border-brand" : "border-border text-foreground hover:bg-muted"
          )}
        >
          {render(o)}
        </button>
      ))}
    </div>
  );
}
