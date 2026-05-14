// Shared filter-tab strip for vendor dashboard list pages (orders,
// messages, etc.). Each page used to inline its own copy of the same
// chip layout — same border style, same active-state colors, same
// count-in-parens treatment — and they were drifting apart in subtle
// ways. Lifting it here gives every dashboard list the same look and
// future cross-cutting tweaks (e.g. visual active indicator) land in
// one place.
//
// Server component on purpose: every caller renders inside an async
// page.tsx and just needs hrefs + counts. No client interactivity.

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DashboardTab<K extends string> {
  key: K;
  label: string;
  /** Optional count shown after the label as "(N)". Hidden when 0. */
  count?: number;
  /** Full href (with all query params preserved) the tab links to. */
  href: string;
  /** Highlighted with primary background when true. */
  active: boolean;
}

export function DashboardTabs<K extends string>({
  tabs,
  ariaLabel = "กรองตามสถานะ",
}: {
  tabs: ReadonlyArray<DashboardTab<K>>;
  ariaLabel?: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2 border-b pb-px"
    >
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-md border px-3 py-1.5 text-sm transition",
            t.active
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background hover:bg-accent",
          )}
        >
          {t.label}
          {typeof t.count === "number" && t.count > 0 && (
            <span
              className={cn(
                "ml-1.5 text-xs",
                t.active ? "opacity-80" : "text-muted-foreground",
              )}
            >
              ({t.count.toLocaleString()})
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
