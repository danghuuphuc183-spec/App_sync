import * as React from "react";
import { PublicHeader } from "@/components/shared/public-header";
import { PublicFooter } from "@/components/shared/public-footer";
import { BottomNav } from "@/components/shared/bottom-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <PublicFooter />
      <BottomNav />
    </div>
  );
}
