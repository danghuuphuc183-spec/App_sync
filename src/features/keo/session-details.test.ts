import { describe, it, expect } from "vitest";
import { KEO_SPORTS } from "./keo.data";
import { SESSION_FIELDS, defaultDetails, isDetailsComplete, summarizeDetails, toggleDetail } from "./session-details";
import { formatReminderTime, reminderSchedule, sessionStart } from "./reminders";

describe("Chi tiết buổi tập theo môn", () => {
  it("môn nào trong Lên kèo cũng có 2–3 trường, và mặc định đã đủ", () => {
    for (const s of KEO_SPORTS) {
      const fields = SESSION_FIELDS[s];
      expect(fields, s).toBeDefined();
      expect(fields!.length).toBeGreaterThanOrEqual(2);
      expect(fields!.length).toBeLessThanOrEqual(3);
      expect(isDetailsComplete(s, defaultDetails(s))).toBe(true);
    }
  });

  it("gym: chọn nhiều nhóm cơ, không bỏ được lựa chọn cuối cùng", () => {
    const muscle = SESSION_FIELDS.gym![0]!;
    let d = defaultDetails("gym");
    d = toggleDetail(d, muscle, "Tay");
    expect(d.muscle).toEqual(["Ngực", "Tay"]);
    d = toggleDetail(toggleDetail(d, muscle, "Ngực"), muscle, "Tay");
    expect(d.muscle).toEqual(["Tay"]);
  });

  it("chạy bộ: tóm tắt cự ly, pace, kiểu chạy", () => {
    const pace = SESSION_FIELDS.running![1]!;
    const d = toggleDetail(defaultDetails("running"), pace, "5:00–6:00");
    expect(summarizeDetails("running", d)).toBe("5 km · Pace 5:00–6:00/km · Chạy nhẹ");
  });
});

describe("Lịch nhắc kèo", () => {
  const created = new Date(2026, 10, 10, 9, 0);

  it("kèo 5:00 sáng → nhắc 20:00 tối hôm trước và 4:00", () => {
    const r = reminderSchedule(sessionStart("2026-11-14", "05:00"), created);
    expect(r.map((x) => formatReminderTime(x.at))).toEqual(["20:00 tối 13/11", "04:00 sáng 14/11"]);
  });

  it("kèo 18:00 → nhắc trước 24 giờ và trước 1 tiếng", () => {
    const r = reminderSchedule(sessionStart("2026-11-14", "18:00"), created);
    expect(r.map((x) => formatReminderTime(x.at))).toEqual(["18:00 tối 13/11", "17:00 chiều 14/11"]);
  });

  it("kèo tạo sát giờ → bỏ lời nhắc đã qua", () => {
    const r = reminderSchedule(sessionStart("2026-11-10", "11:00"), created);
    expect(r.map((x) => x.kind)).toEqual(["hour_before"]);
  });
});
