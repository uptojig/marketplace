"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

/**
 * Mobile sidebar drawer wrapper. On md+ the sidebar is sticky and
 * always visible, so this is a pass-through. Below md it hides the
 * rail behind a burger button that toggles a slide-over drawer.
 *
 * Server-rendered Sidebar tree is passed as `children` so the auth +
 * store lookup stays on the server; this component only owns the
 * open/closed state. Closes on Escape, on backdrop click, and on
 * route change so the drawer never lingers after a nav tap.
 */
export function DashboardSidebarToggle({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on Escape — drawer is a modal-ish overlay and operators
  // expect Esc-to-dismiss on dialog surfaces.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while the drawer is open so the backdrop doesn't
  // scroll the page underneath when the user touches outside the rail.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close when navigation happens — the rail's nav items are <Link>s,
  // and without this the drawer stays open over the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile burger — only visible below md. Sits inside the
          dashboard chrome's top row but absolutely positioned so it
          doesn't shift the topbar's layout on desktop. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="เปิดเมนู"
        aria-expanded={open}
        className="fixed left-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Desktop: render the rail in normal flow */}
      <div className="hidden md:flex">{children}</div>

      {/* Mobile drawer — opens when `open === true` */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="เมนูร้าน"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          {/* Slide-over rail */}
          <div className="absolute inset-y-0 left-0 flex">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="ปิดเมนู"
              className="absolute right-0 top-3 inline-flex h-9 w-9 translate-x-full items-center justify-center rounded-r-md bg-background shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
