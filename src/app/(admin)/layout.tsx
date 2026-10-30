import * as React from "react";
import { SidebarNav } from "@/components/shared/sidebar-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav role="platform_admin" userDisplayName="Quản trị viên" />
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
