"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavForRole, type AppRole } from "@/features/rbac/nav";
import {
  Home,
  Flame,
  Calendar,
  Activity,
  Users,
  ShieldCheck,
  User,
  Award,
  CheckSquare,
  UserCheck,
  Settings,
  MapPin,
  PlusCircle,
  TrendingUp,
  Clock,
  AlertTriangle,
  BarChart,
  CheckCircle,
  Map,
  Shield,
  FileText,
  LogIn,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Flame,
  Calendar,
  Activity,
  Users,
  ShieldCheck,
  User,
  Award,
  CheckSquare,
  UserCheck,
  Settings,
  MapPin,
  PlusCircle,
  TrendingUp,
  Clock,
  AlertTriangle,
  BarChart,
  CheckCircle,
  Map,
  Shield,
  FileText,
  LogIn,
};

interface SidebarNavProps {
  role: AppRole;
  userDisplayName?: string;
  className?: string;
}

export function SidebarNav({ role, userDisplayName, className }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = getNavForRole(role);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-64 border-r border-border bg-card/60 min-h-screen p-4 justify-between",
        className
      )}
    >
      <div className="space-y-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Shield className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base leading-tight">Khế Ước Thể Thao</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Khu vực TP.HCM
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = ICON_MAP[item.iconName] || Activity;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors select-none",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-tier-gold text-tier-gold-foreground font-bold px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile brief footer */}
      {userDisplayName && (
        <div className="border-t border-border pt-4 px-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[140px] font-medium text-foreground">
            {userDisplayName}
          </span>
          <span className="text-[10px] uppercase font-bold text-primary">
            {role}
          </span>
        </div>
      )}
    </aside>
  );
}
