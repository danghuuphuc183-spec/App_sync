import * as React from "react";
import { PublicHeader } from "@/components/shared/public-header";
import { BottomNav } from "@/components/shared/bottom-nav";
import { MobileContainer } from "@/components/shared/mobile-container";
import { OnboardingGuard } from "@/components/shared/onboarding-guard";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileContainer>
      <OnboardingGuard />
      <PublicHeader />
      <main className="flex-1 w-full">{children}</main>
      <BottomNav />
    </MobileContainer>
  );
}
