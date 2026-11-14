"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    const finish = async () => {
      const supabase = getSupabaseBrowserClient();
      const callbackError = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errorDescription = callbackError.get("error_description") || new URLSearchParams(window.location.search).get("error_description") || "";
      if (errorDescription.includes("SYNESIS_DEMO_CAP_REACHED")) {
        throw new Error("Đợt thử nghiệm SYNESIS đã đủ 10 tài khoản. Tài khoản mới hiện chưa thể đăng ký.");
      }
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) console.warn("Code exchange warning:", exchangeError.message);
        } catch (e) {
          console.warn("exchangeCodeForSession catch:", e);
        }
      }
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const authUser = user || (await supabase.auth.getSession()).data.session?.user;
      if (authUser?.id) {
        try {
          const { data: profile } = await supabase.from("synesis_profiles")
            .select("onboarding_completed").eq("id", authUser.id).maybeSingle();
          if (!profile) {
            const provider = authUser.app_metadata.provider === "google" ? "google" : "email";
            const name = (authUser.user_metadata.full_name || authUser.user_metadata.name || authUser.email?.split("@")[0] || "Đặng Hữu Phúc").trim().slice(0, 40) || "Đặng Hữu Phúc";
            await supabase.from("synesis_profiles").upsert({
              id: authUser.id,
              display_name: name,
              email: authUser.email?.toLowerCase() ?? "danghuuphuc183@gmail.com",
              phone: authUser.phone ?? null,
              auth_provider: provider,
              name_completed: true,
              onboarding_completed: true,
            }, { onConflict: "id", ignoreDuplicates: true });
          }
        } catch (dbErr) {
          console.warn("Profile table upsert non-critical warning:", dbErr);
        }
      }
      if (active) router.replace("/ho-so");
    };
    void finish().catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Không thể hoàn tất đăng nhập Google.");
    });
    return () => { active = false; };
  }, [router]);

  return <main className="grid min-h-dvh place-items-center bg-[#020611] px-6 text-white">
    <div className="text-center">
      {error ? <><p role="alert" className="text-red-300">{error}</p><button onClick={() => router.replace("/dang-nhap")} className="mt-4 rounded-xl bg-white/10 px-4 py-2">Quay lại đăng nhập</button></> : <><Loader2 className="mx-auto h-8 w-8 animate-spin" /><p className="mt-3">Đang xác minh tài khoản Google…</p></>}
    </div>
  </main>;
}
