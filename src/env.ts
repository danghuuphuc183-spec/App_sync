import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Thiếu SUPABASE_SERVICE_ROLE_KEY trên server").optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL phải là URL hợp lệ").default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL phải là URL hợp lệ").default("http://127.0.0.1:54321"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, "NEXT_PUBLIC_SUPABASE_ANON_KEY không hợp lệ").default("placeholder_anon_key_for_dev_mode"),
  NEXT_PUBLIC_ENABLE_MOCK_PROVIDER: z
    .enum(["true", "false"])
    .default("true")
    .transform((val) => val === "true"),
});

const formatErrors = (errors: z.ZodError): string => {
  return Object.entries(errors.flatten().fieldErrors)
    .map(([key, val]) => ` - ${key}: ${val?.join(", ")}`)
    .join("\n");
};

const _serverEnv = serverSchema.safeParse(process.env);
const _clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_ENABLE_MOCK_PROVIDER: process.env.NEXT_PUBLIC_ENABLE_MOCK_PROVIDER,
});

if (!_serverEnv.success) {
  const errMsg = `[CẤU HÌNH LỖI] Biến môi trường Server không hợp lệ:\n${formatErrors(_serverEnv.error)}`;
  console.error(errMsg);
  if (process.env.NODE_ENV !== "test") {
    throw new Error(errMsg);
  }
}

if (!_clientEnv.success) {
  const errMsg = `[CẤU HÌNH LỖI] Biến môi trường Client không hợp lệ:\n${formatErrors(_clientEnv.error)}`;
  console.error(errMsg);
  if (process.env.NODE_ENV !== "test") {
    throw new Error(errMsg);
  }
}

export const env = {
  ...(_serverEnv.success ? _serverEnv.data : serverSchema.parse({})),
  ...(_clientEnv.success ? _clientEnv.data : clientSchema.parse({})),
};
