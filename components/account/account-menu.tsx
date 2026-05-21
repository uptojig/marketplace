"use client";

/**
 * AccountMenu — the single auth-aware identity widget, shared by the public
 * MarketplaceHeader, its mobile drawer, and the OperatorShell topbar so the
 * "who am I / where can I go" affordance looks and behaves the same in every
 * chrome.
 *
 * Reads auth state reactively via `useSession()` (SessionProvider is mounted
 * app-wide in app/providers.tsx), which keeps marketing pages statically
 * rendered — only this small widget personalizes on the client. While the
 * session resolves we render a neutral skeleton (never wrong content) to
 * avoid a hydration mismatch.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown, ExternalLink, LayoutDashboard, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { workspaceHomeFor, workspaceLabelFor } from "@/lib/auth/workspace";

interface AccountMenuProps {
  /** "dropdown" for header/topbar (default); "inline" for the mobile drawer. */
  layout?: "dropdown" | "inline";
  /** Called when any link/action is chosen (e.g. to close the mobile drawer). */
  onNavigate?: () => void;
}

export function AccountMenu({ layout = "dropdown", onNavigate }: AccountMenuProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Loading → neutral skeleton sized like the trigger (no layout shift, no
  // hydration mismatch).
  if (status === "loading") {
    return (
      <div
        className={cn("animate-pulse rounded-xl bg-black/5", layout === "inline" ? "h-11 w-full" : "h-11 w-28")}
        aria-hidden
      />
    );
  }

  // Logged out → sign-in CTA (only ever renders on public pages).
  if (status !== "authenticated" || !session?.user) {
    if (layout === "inline") {
      return (
        <Link
          href="/signin"
          onClick={onNavigate}
          className="block w-full rounded-xl bg-mp-coral px-4 py-3 text-center text-[15px] font-semibold text-white transition-colors hover:bg-mp-coral-dark"
        >
          เข้าสู่ระบบ
        </Link>
      );
    }
    return (
      <Link
        href="/signin"
        className="inline-flex h-11 items-center justify-center rounded-xl bg-mp-coral px-6 text-[15px] font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-mp-coral-dark"
      >
        เข้าสู่ระบบ
      </Link>
    );
  }

  const user = session.user as { name?: string | null; email?: string | null; role?: string | null };
  const role = user.role ?? null;
  const displayName = user.name || user.email || "บัญชีของฉัน";
  const initial = (user.name || user.email || "U").slice(0, 1).toUpperCase();

  const items = (
    <>
      <Link
        href={workspaceHomeFor(role)}
        onClick={() => {
          setOpen(false);
          onNavigate?.();
        }}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100"
        role="menuitem"
      >
        <LayoutDashboard className="h-4 w-4 shrink-0 text-gray-500" />
        {workspaceLabelFor(role)}
      </Link>
      <Link
        href="/"
        onClick={() => {
          setOpen(false);
          onNavigate?.();
        }}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100"
        role="menuitem"
      >
        <ExternalLink className="h-4 w-4 shrink-0 text-gray-500" />
        ดูเว็บไซต์
      </Link>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          onNavigate?.();
          signOut({ callbackUrl: "/" });
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        role="menuitem"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        ออกจากระบบ
      </button>
    </>
  );

  // Inline (mobile drawer): identity header + stacked items, no dropdown.
  if (layout === "inline") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-mp-forest/10 text-sm font-bold text-mp-forest">{initial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-mp-ink">{displayName}</p>
            {role && <p className="text-[11px] uppercase tracking-wide text-mp-ink-muted">{role}</p>}
          </div>
        </div>
        <div className="space-y-0.5">{items}</div>
      </div>
    );
  }

  // Dropdown (desktop header / operator topbar).
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/70 pl-1.5 pr-2.5 text-sm font-semibold text-current transition-colors hover:bg-black/5"
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-mp-forest/10 text-xs font-bold text-mp-forest">{initial}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-[140px] truncate sm:block">{displayName}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-60 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          <div className="mb-1 border-b border-gray-100 px-3 py-2">
            <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
            {user.email && <p className="truncate text-xs text-gray-500">{user.email}</p>}
          </div>
          {items}
        </div>
      )}
    </div>
  );
}
