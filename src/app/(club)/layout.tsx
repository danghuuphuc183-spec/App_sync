import * as React from "react";
import { SidebarNav } from "@/components/shared/sidebar-nav";

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav role="club_admin" userDisplayName="Chủ nhiệm CLB" />
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
