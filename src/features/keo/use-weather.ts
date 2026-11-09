"use client";

import * as React from "react";
import type { HourlyWeather } from "@/features/match/partner-match";

/**
 * Dự báo theo giờ từ Open-Meteo (miễn phí, không cần khoá API) cho điểm tập & ngày hẹn.
 * Lỗi mạng hoặc ngày ngoài phạm vi dự báo → trả null (ứng dụng coi như không có cảnh báo).
 */
export function useHourlyWeather(position: [number, number] | null, date: Date | null) {
  const [hourly, setHourly] = React.useState<HourlyWeather[] | null>(null);
  const key = position && date ? `${position[0].toFixed(2)},${position[1].toFixed(2)},${date.toDateString()}` : "";

  React.useEffect(() => {
    if (!position || !date) return;
    const d = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${position[0]}&longitude=${position[1]}&hourly=precipitation_probability,weather_code&timezone=Asia%2FBangkok&start_date=${d}&end_date=${d}`;
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { hourly?: { time: string[]; precipitation_probability: number[]; weather_code: number[] } } | null) => {
        if (!j?.hourly) return setHourly(null);
        setHourly(
          j.hourly.time.map((t, i) => ({
            hour: Number(t.slice(11, 13)),
            precipProb: j.hourly!.precipitation_probability[i] ?? 0,
            code: j.hourly!.weather_code[i] ?? 0,
          }))
        );
      })
      .catch(() => setHourly(null));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return hourly;
}
