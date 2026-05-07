"use client";

/**
 * Recently Viewed — track + render the last 12 products the visitor
 * opened on this store. Pure localStorage; no auth, no DB.
 *
 * Two pieces:
 *   1. <RecentlyViewedTracker productId={...} /> — invisible component
 *      mounted on PDP. Pushes the current product to the recent list.
 *   2. <RecentlyViewedRail storeSlug={...} excludeId={...} /> — visible
 *      carousel of recent products, fetched from /api/stores/<slug>/products?ids=...
 *      Skips the current product (excludeId) so the rail isn't redundant
 *      on the PDP itself.
 *
 * Storage key: `shop-recent-viewed-<slug>` — keyed per-store so visiting
 * caselnw doesn't pollute sock's recent list.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatTHB } from "@/lib/utils";

const KEY = (slug: string) => `shop-recent-viewed-${slug}`;
const MAX = 12;

interface RecentItem {
  id: string;
  title: string;
  priceTHB: number;
  imageUrl: string | null;
  viewedAt: number;
}

/**
 * Read & write the recent list from localStorage. Returns the list
 * sorted newest-first.
 */
function readRecent(slug: string): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.viewedAt - a.viewedAt);
  } catch {
    return [];
  }
}

function writeRecent(slug: string, list: RecentItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY(slug), JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* quota exceeded — ignore */
  }
}

/* ──────────────────────────────────────────────────────────────
 * Tracker — invisible, mounted on PDP. Pushes the current
 * product to the recent list on mount.
 * ────────────────────────────────────────────────────────────── */
export function RecentlyViewedTracker({
  storeSlug,
  product,
}: {
  storeSlug: string;
  product: {
    id: string;
    title: string;
    priceTHB: number;
    imageUrl: string | null;
  };
}) {
  useEffect(() => {
    const existing = readRecent(storeSlug);
    const next: RecentItem[] = [
      { ...product, viewedAt: Date.now() },
      ...existing.filter((p) => p.id !== product.id),
    ].slice(0, MAX);
    writeRecent(storeSlug, next);
  }, [storeSlug, product.id, product.title, product.priceTHB, product.imageUrl, product]);

  return null;
}

/* ──────────────────────────────────────────────────────────────
 * Rail — render up to 8 recent items as a horizontal scroll
 * carousel. Skips items in `excludeIds` so the rail isn't
 * redundant on a PDP showing one of those items.
 * ────────────────────────────────────────────────────────────── */
export function RecentlyViewedRail({
  storeSlug,
  excludeIds = [],
  title = "ดูล่าสุด",
}: {
  storeSlug: string;
  excludeIds?: string[];
  title?: string;
}) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    const recent = readRecent(storeSlug).filter(
      (p) => !excludeIds.includes(p.id),
    );
    setItems(recent.slice(0, 8));
  }, [storeSlug, excludeIds]);

  if (items.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex items-end justify-between mb-4">
        <h3
          className="text-xl md:text-2xl font-bold tracking-tight"
          style={{ color: "var(--shop-ink)" }}
        >
          {title}
        </h3>
        <button
          type="button"
          onClick={() => {
            writeRecent(storeSlug, []);
            setItems([]);
          }}
          className="text-xs hover:underline"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          ล้าง
        </button>
      </div>

      <ul className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {items.map((p) => (
          <li
            key={p.id}
            className="snap-start shrink-0 w-36 sm:w-44"
          >
            <Link href={`/stores/${storeSlug}/products/${p.id}`} className="group block">
              <div
                className="aspect-square rounded-md overflow-hidden"
                style={{ background: "var(--shop-bg)" }}
              >
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.title}
                    width={176}
                    height={176}
                    unoptimized
                    className="h-full w-full object-cover group-hover:opacity-75 transition-opacity"
                  />
                ) : null}
              </div>
              <div
                className="mt-2 text-sm line-clamp-2 group-hover:underline"
                style={{ color: "var(--shop-ink)" }}
              >
                {p.title}
              </div>
              <div
                className="mt-1 text-sm font-medium"
                style={{ color: "var(--shop-ink)" }}
              >
                {formatTHB(p.priceTHB)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
