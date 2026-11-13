"use client";

import { Bell } from "lucide-react";
import { formatReminderTime, reminderSchedule, sessionStart } from "@/features/keo/reminders";
import { normalizeKeoDay } from "@/features/keo/keo-date";

/** Lịch nhắc: kèo sáng → 20:00 tối hôm trước; kèo chiều/tối → trước 24 giờ; và trước 1 tiếng */
export function ReminderList({ day, from, who }: { day: string; from: string; who: string }) {
  const reminders = reminderSchedule(sessionStart(normalizeKeoDay(day), from));
  if (reminders.length === 0) return null;
  return (
    <div className="rounded-xl border border-border p-3 text-left text-[12.5px] space-y-1" data-testid="reminders">
      <p className="font-bold text-foreground flex items-center gap-1.5">
        <Bell className="h-4 w-4" /> {who} sẽ được nhắc
      </p>
      {reminders.map((r) => (
        <p key={r.kind} className="text-muted-foreground">
          • {r.labelVi}: <b className="text-foreground">{formatReminderTime(r.at)}</b>
        </p>
      ))}
    </div>
  );
}
