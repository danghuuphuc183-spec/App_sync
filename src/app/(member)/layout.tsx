import * as React from "react";
import { PublicHeader } from "@/components/shared/public-header";
import { BottomNav } from "@/components/shared/bottom-nav";
import { MobileContainer } from "@/components/shared/mobile-container";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileContainer>
      <PublicHeader />
      <main className="flex-1 w-full">{children}</main>
      <BottomNav />
    </MobileContainer>
  );
}
