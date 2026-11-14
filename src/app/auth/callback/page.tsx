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
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
      }
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError ?? new Error("Không nhận được tài khoản Google.");
      const { data: profile, error: profileError } = await supabase.from("synesis_profiles")
        .select("onboarding_completed").eq("id", user.id).maybeSingle();
      if (profileError) throw profileError;
      if (!profile) {
        const provider = user.app_metadata.provider === "google" ? "google" : "email";
        const name = (user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0] || "Vận động viên").trim().slice(0, 40) || "Vận động viên";
        const { error: insertError } = await supabase.from("synesis_profiles").upsert({
          id: user.id,
          display_name: name,
          email: user.email?.toLowerCase() ?? null,
          phone: user.phone ?? null,
          auth_provider: provider,
          name_completed: Boolean(user.user_metadata.full_name || user.user_metadata.name),
          onboarding_completed: false,
        }, { onConflict: "id", ignoreDuplicates: true });
        if (insertError?.message.includes("SYNESIS_REGISTRATION_LIMIT_REACHED")) {
          throw new Error("Đợt dùng thử SYNESIS đã đủ 10 tài khoản. Tài khoản mới hiện chưa thể đăng ký.");
        }
        if (insertError) throw insertError;
      }
      if (active) router.replace(profile?.onboarding_completed ? "/" : "/bat-dau");
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
