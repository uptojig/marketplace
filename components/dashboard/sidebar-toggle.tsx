"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * Mobile sidebar drawer wrapper. On md+ the sidebar is sticky and
 * always visible, so this is a pass-through. Below md it hides the
 * rail behind a burger button that toggles a slide-over drawer.
 *
 * Server-rendered Sidebar tree is passed as `children` so the auth +
 * store lookup stays on the server; this component only owns the
 * open/closed state.
 */
export function DashboardSidebarToggle({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile burger — only visible below md. Sits inside the
          dashboard chrome's top row but absolutely positioned so it
          doesn't shift the topbar's layout on desktop. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="เปิดเมนู"
        className="fixed left-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background shadow-sm md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Desktop: render the rail in normal flow */}
      <div className="hidden md:flex">{children}</div>

      {/* Mobile drawer — opens when `open === true` */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog">
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
              className="absolute right-0 top-3 inline-flex h-9 w-9 translate-x-full items-center justify-center rounded-r-md bg-background shadow"
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
