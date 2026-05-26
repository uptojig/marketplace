"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  Package,
  ExternalLink,
  FlaskConical,
  Mail,
  Shield,
  ShieldCheck,
  LogOut,
  Server,
  Award,
  Tags,
  ShoppingBag,
  Settings,
  PlusSquare,
  Palette,
  Globe,
  Menu,
  X,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OperatorStatusBadge } from "@/components/operator/operator-primitives";
import { cn } from "@/lib/utils";
import { StorePicker } from "@/components/dashboard/store-picker";
import { AccountMenu } from "@/components/account/account-menu";
import { workspaceHomeFor } from "@/lib/auth/workspace";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  Package,
  ExternalLink,
  FlaskConical,
  Mail,
  Shield,
  ShieldCheck,
  LogOut,
  Server,
  Award,
  Tags,
  ShoppingBag,
  Settings,
  PlusSquare,
  Palette,
  Wallet,
};

export interface OperatorNavItem {
  href: string;
  label: string;
  icon: string;
  group: string;
  exact?: boolean;
  badge?: number;
  roles?: Array<"ADMIN" | "VENDOR" | "AGENT">;
}

export interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface OperatorShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "VENDOR" | "AGENT";
  };
  navigation: OperatorNavItem[];
  // Optional: only for VENDOR and ADMIN views
  storeContext?: {
    currentStore: StoreInfo;
    availableStores: StoreInfo[];
    isAdmin: boolean;
  };
  // Optional slot for right side of Topbar (e.g. PDF print, external store preview)
  topbarActions?: React.ReactNode;
  // Optional title shown next to brand
  brandTitle?: string;
  // Subtitle (e.g., "Marketplace Admin" or "Vendor Dashboard")
  brandSubtitle?: string;
}

export function OperatorShell({
  children,
  user,
  navigation,
  storeContext,
  topbarActions,
  brandTitle = "Basketplace",
  brandSubtitle,
}: OperatorShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  // Role badge → operator status tone (colours owned by primitives).
  const roleTone: Record<string, "danger" | "success" | "info"> = {
    ADMIN: "danger",
    VENDOR: "success",
    AGENT: "info",
  };

  const navGroups = navigation
    .filter((item) => !item.roles || item.roles.includes(user.role))
    .reduce<Record<string, OperatorNavItem[]>>((acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    }, {});

  const renderSidebarContent = () => (
    <aside
      className="flex h-full w-64 shrink-0 flex-col border-r"
      style={{
        background: "var(--color-sidebar, hsl(var(--sidebar-background, 0 0% 98%)))",
        color: "var(--color-sidebar-foreground, hsl(var(--sidebar-foreground, 240 5.3% 26.1%)))",
        borderColor: "var(--color-sidebar-border, hsl(var(--sidebar-border, 240 5.9% 90%)))",
      }}
    >
      {/* Brand & Subtitle */}
      <div className="flex h-14 items-center justify-between border-b px-4" style={{ borderColor: "var(--color-sidebar-border)" }}>
        <div className="min-w-0">
          <Link href={workspaceHomeFor(user.role)}>
            <span className="block truncate text-sm font-bold tracking-tight text-foreground font-sans">
              {brandTitle}
            </span>
          </Link>
          {brandSubtitle && (
            <span className="block truncate text-[10px] opacity-60">
              {brandSubtitle}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 text-sm space-y-4">
        {Object.entries(navGroups).map(([groupName, items]) => (
          <div key={groupName} className="space-y-1">
            <span className="px-2 text-[10px] font-semibold uppercase tracking-wider opacity-50 block mb-1">
              {groupName}
            </span>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const cleanHref = item.href.split("?")[0].split("#")[0];
                const cleanPathname = pathname.split("?")[0];
                const active = item.exact
                  ? cleanPathname === cleanHref
                  : cleanPathname === cleanHref || cleanPathname.startsWith(`${cleanHref}/`);

                const Icon = ICON_MAP[item.icon] || LayoutDashboard;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition font-medium",
                        active
                          ? "bg-[color:var(--color-sidebar-accent,hsl(var(--sidebar-accent)))] text-[color:var(--color-sidebar-accent-foreground,hsl(var(--sidebar-accent-foreground)))]"
                          : "text-[color:var(--color-sidebar-foreground)] hover:bg-[color:var(--color-sidebar-accent,hsl(var(--sidebar-accent)))]/50 hover:text-[color:var(--color-sidebar-accent-foreground)]"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-70")} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {typeof item.badge === "number" && item.badge > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-5 min-w-5 shrink-0 items-center justify-center rounded-full p-0 text-[10px] font-bold"
                          style={{
                            background: "var(--color-sidebar-primary, hsl(var(--sidebar-primary)))",
                            color: "var(--color-sidebar-primary-foreground, hsl(var(--sidebar-primary-foreground)))",
                          }}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Section (Identity & Sign-out) */}
      <div className="border-t p-3 space-y-2" style={{ borderColor: "var(--color-sidebar-border)" }}>
        {/* User Card */}
        <div
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2"
          style={{ background: "var(--color-sidebar-accent, hsl(var(--sidebar-accent)))" }}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground uppercase">
              {(user.name || user.email || "U").slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-xs">
            <p className="truncate font-semibold text-foreground">
              {user.name || user.email}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <OperatorStatusBadge
                tone={roleTone[user.role] ?? "neutral"}
                className="px-1 py-0 text-[9px] font-bold uppercase tracking-wider"
              >
                {user.role}
              </OperatorStatusBadge>
            </div>
          </div>
        </div>

        {/* Global links & Logout */}
        <div className="space-y-1">
          {/* Always-visible bridge back to the public marketplace */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <Globe className="h-3.5 w-3.5" />
            ดูเว็บไซต์
          </Link>
          {user.role === "ADMIN" && pathname.startsWith("/admin") && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Vendor Dashboard
            </Link>
          )}
          {user.role === "ADMIN" && !pathname.startsWith("/admin") && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Admin Console
            </Link>
          )}
          <Link
            href="/signout"
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            ออกจากระบบ
          </Link>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        {renderSidebarContent()}
      </div>

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background pl-14 pr-4 md:pl-6">
          {/* Mobile hamburger - absolute/fixed trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
            className="fixed left-3 top-2.5 z-50 inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background shadow-sm hover:bg-accent md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Left part: Store Picker or contextual info */}
          <div className="flex-1 min-w-0 flex items-center">
            {storeContext ? (
              <StorePicker
                currentStore={storeContext.currentStore}
                availableStores={storeContext.availableStores}
                isAdmin={storeContext.isAdmin}
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider md:hidden">
                {brandSubtitle || brandTitle}
              </span>
            )}
          </div>

          {/* Right part: Custom Actions + shared account menu (incl. "ดูเว็บไซต์" → /) */}
          <div className="flex items-center gap-2 shrink-0">
            {topbarActions}
            <AccountMenu />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer (Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />

          {/* Drawer Body */}
          <div className="relative flex flex-col h-full w-[80%] max-w-[280px] bg-background shadow-2xl animate-in slide-in-from-left duration-250">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="ปิดเมนู"
              className="absolute right-[-45px] top-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-background text-foreground shadow-md hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </div>
  );
}
