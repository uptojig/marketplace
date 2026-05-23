"use client";

/**
 * Live-debounced search box for /admin/stores.
 *
 * - Keeps the surrounding <form> so the box still works without JS
 *   (submit fires a normal GET that the page reads via searchParams).
 * - With JS, typing triggers `router.replace` after a 300ms debounce so
 *   the URL (and therefore the SSR list) updates without a page jump.
 * - `?status=` is preserved as a hidden field so search submits don't
 *   drop the active tab filter, mirroring the previous form.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";

type Props = {
  initialQuery?: string;
  statusFilter?: string | null;
  clearHref: string;
};

function useDebouncedCallback<A extends unknown[]>(
  cb: (...args: A) => void,
  delay: number,
) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return (...args: A) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => cbRef.current(...args), delay);
  };
}

export function StoresSearchInput({
  initialQuery,
  statusFilter,
  clearHref,
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery ?? "");

  const pushQuery = useDebouncedCallback((next: string) => {
    const sp = new URLSearchParams();
    const trimmed = next.trim();
    if (trimmed) sp.set("q", trimmed);
    if (statusFilter) sp.set("status", statusFilter);
    const qs = sp.toString();
    router.replace(qs ? `/admin/stores?${qs}` : "/admin/stores");
  }, 300);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    pushQuery(e.target.value);
  }

  return (
    <form className="relative flex gap-2" role="search">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mp-ink-muted" />
        <input
          name="q"
          value={value}
          onChange={onChange}
          placeholder="ค้นหาชื่อร้าน, slug, หรืออีเมลเจ้าของ..."
          className="w-full rounded-xl border border-mp-border bg-mp-surface text-mp-ink py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-mp-coral/20 placeholder-mp-ink-muted"
          aria-label="ค้นหาร้าน"
        />
        {value && (
          <Link
            href={clearHref}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-mp-ink-muted hover:bg-mp-cream-alt hover:text-mp-ink transition"
            aria-label="ล้างคำค้น"
            prefetch={false}
            onClick={() => setValue("")}
          >
            <X className="h-4 w-4" />
          </Link>
        )}
      </div>
      {/* Preserve status filter across search submits (no-JS fallback) */}
      {statusFilter && (
        <input type="hidden" name="status" value={statusFilter} />
      )}
      <button
        type="submit"
        className="rounded-xl border border-mp-border bg-mp-surface px-4 py-2 text-sm font-semibold text-mp-ink hover:bg-mp-cream-alt transition"
      >
        ค้นหา
      </button>
    </form>
  );
}
