/**
 * Quản lý định dạng số điện thoại và nhận biết tài khoản đã có hay mới
 * phục vụ luồng đăng nhập / đăng ký và khảo sát cá nhân hoá (/bat-dau).
 */

export const DEMO_OTP = "123456";

/** Chuẩn hoá số di động Việt Nam về dạng nội địa 0xxxxxxxxx. */
export function normalizeVnPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  let local = digits;
  if (local.startsWith("+84")) local = "0" + local.slice(3);
  else if (local.startsWith("84") && local.length === 11) local = "0" + local.slice(2);
  else if (!local.startsWith("0") && local.length === 9) local = "0" + local;
  return /^0(3|5|7|8|9)\d{8}$/.test(local) ? local : null;
}

export const formatVnPhone = (phone: string) => {
  const local = normalizeVnPhone(phone) ?? phone;
  return local.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");
};

const STORAGE_KEY = "sync.accounts.v1";
const DEFAULT_KNOWN = {
  phones: ["0908123456", "0908183183"],
  emails: ["danghuuphuc183@gmail.com", "minhthu.run@gmail.com"],
};

function readAccounts(): { phones: string[]; emails: string[] } {
  if (typeof window === "undefined") return DEFAULT_KNOWN;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_KNOWN;
    const parsed = JSON.parse(raw);
    return {
      phones: Array.isArray(parsed?.phones) ? [...new Set([...DEFAULT_KNOWN.phones, ...parsed.phones])] : DEFAULT_KNOWN.phones,
      emails: Array.isArray(parsed?.emails) ? [...new Set([...DEFAULT_KNOWN.emails, ...parsed.emails])] : DEFAULT_KNOWN.emails,
    };
  } catch {
    return DEFAULT_KNOWN;
  }
}

/** Kiểm tra xem số điện thoại hoặc email đã từng đăng ký và hoàn thành khảo sát chưa */
export function isKnownAccount(id: { phone?: string | null; email?: string | null }): boolean {
  const known = readAccounts();
  if (id.phone) {
    const norm = normalizeVnPhone(id.phone) || id.phone.replace(/\D/g, "");
    if (known.phones.some((p) => p === norm || norm.includes(p) || p.includes(norm))) return true;
  }
  if (id.email) {
    const clean = id.email.trim().toLowerCase();
    if (known.emails.includes(clean)) return true;
  }
  return false;
}

/** Lưu tài khoản đã hoàn thành onboarding vào danh sách tài khoản đã có */
export function rememberAccount(id: { phone?: string | null; email?: string | null }) {
  if (typeof window === "undefined") return;
  const known = readAccounts();
  let changed = false;
  if (id.phone) {
    const norm = normalizeVnPhone(id.phone) || id.phone.replace(/\D/g, "");
    if (!known.phones.includes(norm)) {
      known.phones.push(norm);
      changed = true;
    }
  }
  if (id.email) {
    const clean = id.email.trim().toLowerCase();
    if (!known.emails.includes(clean)) {
      known.emails.push(clean);
      changed = true;
    }
  }
  if (changed) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(known));
    } catch {
      /* ignore */
    }
  }
}
