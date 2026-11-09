"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

/** Tài khoản mới chưa thiết lập cá nhân hoá → chuyển tới /bat-dau trước khi dùng app */
export function OnboardingGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  React.useEffect(() => {
    if (!isLoading && user && !user.isSurveyCompleted && !pathname?.startsWith("/bat-dau")) router.replace("/bat-dau");
  }, [isLoading, user, pathname, router]);
  return null;
}
