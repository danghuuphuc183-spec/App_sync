import * as React from "react";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { BottomNav } from "@/components/shared/bottom-nav";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav role="member" userDisplayName="Người tập" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full pb-20 md:pb-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
