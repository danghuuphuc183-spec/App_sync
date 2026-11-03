/**
 * Supabase client initialization wrapper
 * Provides type-safe database access with automatic fallback to mock data
 * when running locally without active Supabase Postgres containers.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isMock: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key";
  const isMock =
    process.env.NEXT_PUBLIC_ENABLE_MOCK_PROVIDER === "true" ||
    anonKey.includes("dummy") ||
    !url.startsWith("http");

  return { url, anonKey, isMock };
}
