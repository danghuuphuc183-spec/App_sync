import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isMock: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const anonKey = getPublicSupabaseKey() || "dummy_key";
  return {
    url,
    anonKey,
    isMock: process.env.NEXT_PUBLIC_ENABLE_MOCK_PROVIDER === "true" || anonKey.includes("dummy") || !url.startsWith("http"),
  };
}

export function isSupabaseConfigured() {
  if (process.env.NODE_ENV === "test") return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = getPublicSupabaseKey();
  return Boolean(
    url &&
    anonKey &&
    /^https?:\/\//i.test(url) &&
    !/dummy|replace[-_ ]?with|your[-_ ]?(supabase|anon)/i.test(anonKey),
  );
}

function getPublicSupabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Ứng dụng chưa được cấu hình Supabase. Vui lòng thử lại sau.");
  }
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      getPublicSupabaseKey()!,
      {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
          flowType: "pkce",
          persistSession: true,
        },
      },
    );
  }
  return browserClient;
}
