export const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Chuyển đổi bất kỳ thời điểm nào thành chuỗi ISO UTC chuẩn để lưu vào DB.
 */
export function toUtcIso(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new RangeError("Thời gian đầu vào không hợp lệ");
  }
  return date.toISOString();
}

/**
 * Định dạng thời gian theo múi giờ Việt Nam (Asia/Ho_Chi_Minh).
 */
export function formatVietnamDateTime(
  dateInput: Date | string | number,
  options: {
    includeTime?: boolean;
    includeSeconds?: boolean;
    style?: "short" | "medium" | "full";
  } = {}
): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "Thời gian không hợp lệ";
  }

  const { includeTime = true, includeSeconds = false, style = "medium" } = options;

  if (style === "short") {
    const formatter = new Intl.DateTimeFormat("vi-VN", {
      timeZone: VIETNAM_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(includeTime && {
        hour: "2-digit",
        minute: "2-digit",
        second: includeSeconds ? "2-digit" : undefined,
        hour12: false,
      }),
    });
    return formatter.format(date);
  }

  const formatter = new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
    weekday: style === "full" ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      second: includeSeconds ? "2-digit" : undefined,
      hour12: false,
    }),
  });

  return formatter.format(date);
}

/**
 * Lấy chỉ giờ:phút theo giờ Việt Nam (vd: 05:30)
 */
export function formatVietnamTime(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "--:--";
  }
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date);
}

/**
 * Kiểm tra người dùng có đủ từ 18 tuổi trở lên hay không (tính theo ngày sinh).
 */
export function isAtLeast18YearsOld(birthDateInput: string | Date, nowInput?: Date): boolean {
  const birthDate = new Date(birthDateInput);
  if (isNaN(birthDate.getTime())) {
    return false;
  }

  const now = nowInput ? new Date(nowInput) : new Date();

  // Chuyển sang ngày theo múi giờ Việt Nam
  const birthYear = birthDate.getUTCFullYear();
  const birthMonth = birthDate.getUTCMonth();
  const birthDay = birthDate.getUTCDate();

  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const currentDay = now.getUTCDate();

  let age = currentYear - birthYear;
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }

  return age >= 18;
}

/**
 * Kiểm tra xem thời điểm hẹn có cách hiện tại tối thiểu `minHours` giờ không (mặc định 2 giờ theo quy tắc kèo P8).
 */
export function isAtLeastHoursInFuture(
  targetDateInput: Date | string,
  minHours: number = 2,
  nowInput?: Date
): boolean {
  const target = new Date(targetDateInput);
  const now = nowInput ? new Date(nowInput) : new Date();
  if (isNaN(target.getTime()) || isNaN(now.getTime())) {
    return false;
  }
  const diffMs = target.getTime() - now.getTime();
  const minMs = minHours * 60 * 60 * 1000;
  return diffMs >= minMs;
}
