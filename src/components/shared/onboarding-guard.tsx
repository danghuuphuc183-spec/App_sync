"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

/**
 * Chặn vào app khi chưa sẵn sàng:
 *  - Chưa đăng nhập (bản production không tự đăng nhập tài khoản mẫu) → /dang-nhap để đăng ký / đăng nhập.
 *  - Tài khoản mới chưa thiết lập cá nhân hoá → /bat-dau.
 */
export function OnboardingGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  React.useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/dang-nhap");
      return;
    }
    if (!user.isSurveyCompleted && !pathname?.startsWith("/bat-dau")) router.replace("/bat-dau");
  }, [isLoading, user, pathname, router]);
  return null;
}
