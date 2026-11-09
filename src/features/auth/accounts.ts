/**
 * Nhận biết tài khoản ĐÃ CÓ hay MỚI khi đăng nhập bằng Google / số điện thoại.
 * Bản demo lưu danh sách trong localStorage; bản thật: Supabase Auth (Google OAuth + Phone OTP)
 * tự tạo user ở lần xác minh đầu tiên, app kiểm tra bảng profiles để biết đã onboarding chưa.
 */

export const DEMO_OTP = "123456";

/** Số di động VN: 0xxxxxxxxx hoặc +84xxxxxxxxx (đầu số 03, 05, 07, 08, 09) → dạng chuẩn 0xxxxxxxxx */
export function normalizeVnPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  let local = digits;
  if (local.startsWith("+84")) local = "0" + local.slice(3);
  else if (local.startsWith("84") && local.length === 11) local = "0" + local.slice(2);
  else if (!local.startsWith("0") && local.length === 9) local = "0" + local;
  return /^0(3|5|7|8|9)\d{8}$/.test(local) ? local : null;
}

export const formatVnPhone = (p: string) => p.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");

const KEY = "sync.accounts.v1";
const SEED = { phones: ["0908123456"], emails: ["minhthu.run@gmail.com"] };

function read(): { phones: string[]; emails: string[] } {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as typeof SEED) : SEED;
  } catch {
    return SEED;
  }
}

export function isKnownAccount(id: { phone?: string; email?: string }): boolean {
  const a = read();
  if (id.phone) return a.phones.includes(id.phone);
  if (id.email) return a.emails.includes(id.email.toLowerCase());
  return false;
}

export function rememberAccount(id: { phone?: string; email?: string }) {
  const a = read();
  if (id.phone && !a.phones.includes(id.phone)) a.phones.push(id.phone);
  if (id.email && !a.emails.includes(id.email.toLowerCase())) a.emails.push(id.email.toLowerCase());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* bỏ qua */
  }
}
