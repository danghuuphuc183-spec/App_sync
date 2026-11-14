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
