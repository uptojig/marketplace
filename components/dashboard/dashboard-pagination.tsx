// Compact Prev/Next pagination for vendor dashboard list pages.
// Offset-based (page=N in the URL) — simpler than cursor for inbox-
// style screens where vendors rarely page past the first screen but
// occasionally need to scroll deeper.
//
// Renders nothing when the data fits on a single page so the spec
// "no pagination when not needed" is implicit. Returns a fragment-
// like layout that callers can drop under their table without extra
// container styling.

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  hrefFor,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  /** Builds the URL for a given page. Caller preserves tab/storeSlug/etc. */
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2 text-sm">
      <p className="text-xs text-muted-foreground tabular-nums">
        {start.toLocaleString()}–{end.toLocaleString()} จาก{" "}
        {totalItems.toLocaleString()} รายการ
      </p>
      <div className="flex items-center gap-1">
        {hasPrev ? (
          <Link
            href={hrefFor(currentPage - 1)}
            rel="prev"
            className={navLinkCls()}
            aria-label="หน้าก่อนหน้า"
          >
            <ChevronLeft className="h-4 w-4" />
            ก่อนหน้า
          </Link>
        ) : (
          <span className={navLinkCls(true)} aria-disabled="true">
            <ChevronLeft className="h-4 w-4" />
            ก่อนหน้า
          </span>
        )}
        <span className="px-2 text-xs text-muted-foreground tabular-nums">
          หน้า {currentPage} / {totalPages}
        </span>
        {hasNext ? (
          <Link
            href={hrefFor(currentPage + 1)}
            rel="next"
            className={navLinkCls()}
            aria-label="หน้าถัดไป"
          >
            ถัดไป
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className={navLinkCls(true)} aria-disabled="true">
            ถัดไป
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}

function navLinkCls(disabled = false): string {
  return cn(
    "inline-flex h-8 items-center gap-1 rounded-md border border-input px-2.5 text-xs font-medium transition",
    disabled
      ? "cursor-not-allowed opacity-40"
      : "bg-background hover:bg-accent",
  );
}

/**
 * Parse a `page` URL search param to a positive integer. Defaults to
 * 1 on missing/invalid input — never throws or returns NaN.
 */
export function parsePageParam(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(v ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
