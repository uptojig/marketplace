"use client";

/**
 * Wishlist — localStorage-only saved products list, per store.
 *
 * Pieces:
 *   • useWishlist(slug) hook — { items, has, toggle, remove, clear, count }
 *   • <WishlistButton storeSlug product /> — heart icon, toggles state.
 *     Stops bubbling so click on a card's heart doesn't navigate.
 *   • <WishlistNavLink storeSlug /> — heart icon for the nav with
 *     a count badge.
 *
 * Storage key: `shop-wishlist-<slug>`
 *
 * Storing product snapshot (not just IDs) so the wishlist page can
 * render without fetching — same pattern as RecentlyViewed. Tradeoff:
 * price shown on the wishlist page can be stale if product price
 * changes; refresh on next view (we update snapshot on toggle).
 */
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

const KEY = (slug: string) => `shop-wishlist-${slug}`;
const MAX = 50;

export interface WishlistItem {
  id: string;
  title: string;
  priceTHB: number;
  imageUrl: string | null;
  addedAt: number;
}

function readList(slug: string): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.addedAt - a.addedAt);
  } catch {
    return [];
  }
}

function writeList(slug: string, list: WishlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY(slug), JSON.stringify(list.slice(0, MAX)));
    // Notify other Wishlist consumers in the same tab (storage event
    // only fires across tabs by default; dispatch a custom event so
    // the nav badge + heart buttons re-render in real time).
    window.dispatchEvent(
      new CustomEvent("shop-wishlist-changed", { detail: { slug } }),
    );
  } catch {
    /* quota — ignore */
  }
}

/* ──────────────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────────────── */
export function useWishlist(storeSlug: string) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Initial load + cross-tab sync via storage event + same-tab sync
  // via the custom event above.
  useEffect(() => {
    setItems(readList(storeSlug));

    function handleChange(ev?: Event) {
      const detail = (ev as CustomEvent | undefined)?.detail as
        | { slug?: string }
        | undefined;
      // Storage event has no detail; custom event scopes by slug.
      if (detail && detail.slug !== storeSlug) return;
      setItems(readList(storeSlug));
    }
    window.addEventListener("storage", handleChange);
    window.addEventListener("shop-wishlist-changed", handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("shop-wishlist-changed", handleChange);
    };
  }, [storeSlug]);

  const has = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items],
  );

  const toggle = useCallback(
    (item: Omit<WishlistItem, "addedAt">) => {
      const list = readList(storeSlug);
      if (list.some((p) => p.id === item.id)) {
        writeList(
          storeSlug,
          list.filter((p) => p.id !== item.id),
        );
      } else {
        writeList(storeSlug, [
          { ...item, addedAt: Date.now() },
          ...list,
        ]);
      }
    },
    [storeSlug],
  );

  const remove = useCallback(
    (productId: string) => {
      const list = readList(storeSlug);
      writeList(
        storeSlug,
        list.filter((p) => p.id !== productId),
      );
    },
    [storeSlug],
  );

  const clear = useCallback(() => {
    writeList(storeSlug, []);
  }, [storeSlug]);

  return { items, has, toggle, remove, clear, count: items.length };
}

/* ──────────────────────────────────────────────────────────────
 * Heart toggle button — drop on product cards or PDP.
 * ────────────────────────────────────────────────────────────── */
export function WishlistButton({
  storeSlug,
  product,
  size = "md",
}: {
  storeSlug: string;
  product: {
    id: string;
    title: string;
    priceTHB: number;
    imageUrl: string | null;
  };
  size?: "sm" | "md" | "lg";
}) {
  const { has, toggle } = useWishlist(storeSlug);
  const active = has(product.id);
  const dim = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-11 w-11" }[size];
  const icon = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" }[size];

  return (
    <button
      type="button"
      aria-label={active ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
      aria-pressed={active}
      onClick={(e) => {
        // The card itself is a link — stop bubbling so we don't navigate.
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      className={`inline-flex items-center justify-center ${dim} rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2`}
      style={{
        background: active
          ? "color-mix(in srgb, var(--shop-primary) 14%, var(--shop-card))"
          : "color-mix(in srgb, var(--shop-card) 90%, transparent)",
        color: active ? "var(--shop-primary)" : "var(--shop-ink-muted)",
        backdropFilter: "blur(4px)",
        boxShadow: active
          ? "0 0 0 1.5px var(--shop-primary)"
          : "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <Heart
        className={icon}
        fill={active ? "currentColor" : "none"}
        strokeWidth={active ? 0 : 2}
      />
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Nav link — heart icon with count badge.
 * Used inside GlobalHeader's right-actions row.
 * ────────────────────────────────────────────────────────────── */
export function WishlistNavLink({ storeSlug }: { storeSlug: string }) {
  const { count } = useWishlist(storeSlug);

  return (
    <Link
      href={`/stores/${storeSlug}/wishlist`}
      aria-label="รายการโปรด"
      className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors"
    >
      <Heart className="h-5 w-5" />
      {count > 0 && (
        <span
          aria-label={`${count} รายการ`}
          className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
          style={{ background: "var(--shop-primary)" }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
