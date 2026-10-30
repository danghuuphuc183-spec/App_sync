import viMessages from "@/messages/vi.json";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type MessageKey = NestedKeyOf<typeof viMessages>;

/**
 * Trích xuất chuỗi theo đường dẫn dấu chấm 'a.b.c' từ file vi.json.
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Hàm dịch i18n chuẩn cho tiếng Việt.
 * Nếu thiếu khóa ở môi trường dev/test, sẽ ném lỗi để phát hiện sớm.
 */
export function t(key: MessageKey | (string & {}), params?: Record<string, string | number>): string {
  const value = getNestedValue(viMessages as unknown as Record<string, unknown>, key);

  if (typeof value !== "string") {
    const errorMsg = `[i18n] Thiếu khóa dịch hoặc giá trị không phải chuỗi: "${key}"`;
    if (process.env.NODE_ENV !== "production") {
      throw new Error(errorMsg);
    }
    return key;
  }

  if (!params) {
    return value;
  }

  return Object.entries(params).reduce<string>((acc, [paramKey, paramVal]) => {
    return acc.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal));
  }, value);
}

export { viMessages };
