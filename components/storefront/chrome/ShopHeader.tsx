"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/store/cart";

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
  /** Hex accent — drives cart badge, focus ring, primary CTAs. */
  accent?: string;
}

/**
 * Phase-1 unified storefront header.
 *
 * Replaces the long inline default header in app/stores/[slug]/layout.tsx
 * with a shadcn-primitive composition (Button / Input / lucide icons +
 * a CSS-only mobile drawer). Each store opts in via its theme tokens —
 * `accent` swings cart-badge / hover / outline.
 */
export function ShopHeader({
  storeSlug,
  storeName,
  storeLogoUrl,
  categories = [],
  accent = "#0f172a",
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCart((s) =>
    s.lines.filter((l) => l.storeSlug === storeSlug).reduce((n, l) => n + l.qty, 0),
  );

  const categoryHref = (cat: string) =>
    `/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--shop-border)] bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar — logo + search + actions */}
          <div className="h-16 flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>

            <Link
              href={`/stores/${storeSlug}`}
              className="flex items-center gap-2 shrink-0"
            >
              {storeLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={storeLogoUrl}
                  alt={storeName}
                  className="h-9 w-auto max-w-[180px] object-contain"
                />
              ) : (
                <>
                  <span
                    className="inline-flex size-9 items-center justify-center rounded-lg text-sm font-extrabold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {storeName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-base font-extrabold tracking-tight text-[var(--shop-ink)]">
                    {storeName}
                  </span>
                </>
              )}
            </Link>

            <form
              action={`/stores/${storeSlug}`}
              className="hidden md:flex flex-1 max-w-lg items-center"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--shop-ink-muted)]" />
                <Input
                  name="q"
                  placeholder="ค้นหาในร้านนี้"
                  className="pl-9 h-10 rounded-full bg-[var(--shop-bg)] border-[var(--shop-border)]"
                />
              </div>
            </form>

            <div className="flex items-center gap-1 ml-auto">
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Search"
                className="md:hidden"
              >
                <Link href={`/stores/${storeSlug}/search`}>
                  <Search className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Wishlist"
                className="hidden sm:inline-flex"
              >
                <Link href={`/stores/${storeSlug}/wishlist`}>
                  <Heart className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Sign in"
                className="hidden sm:inline-flex"
              >
                <Link href="/signin">
                  <User className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Cart"
                className="relative"
              >
                <Link href={`/stores/${storeSlug}/cart`}>
                  <ShoppingBag className="size-5" />
                  {cartCount > 0 && (
                    <span
                      className="absolute top-0.5 right-0.5 inline-flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          </div>

          {/* Sub-nav with categories */}
          {categories.length > 0 && (
            <nav className="hidden md:flex items-center gap-6 h-10 -mt-px text-sm overflow-x-auto">
              <Link
                href={`/stores/${storeSlug}`}
                className="font-medium text-[var(--shop-ink)] hover:opacity-80 whitespace-nowrap"
              >
                ใหม่ล่าสุด
              </Link>
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c}
                  href={categoryHref(c)}
                  className="text-[var(--shop-ink-muted)] hover:text-[var(--shop-ink)] whitespace-nowrap"
                >
                  {c}
                </Link>
              ))}
              {categories.length > 6 && (
                <Link
                  href={`/stores/${storeSlug}/category`}
                  className="text-[var(--shop-ink-muted)] hover:text-[var(--shop-ink)] whitespace-nowrap"
                >
                  ดูทั้งหมด
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex flex-col w-80 max-w-[85%] h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--shop-border)]">
              <span className="font-extrabold tracking-tight text-[var(--shop-ink)]">
                {storeName}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <form
              action={`/stores/${storeSlug}`}
              className="px-4 pt-4"
              onSubmit={() => setMobileOpen(false)}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--shop-ink-muted)]" />
                <Input
                  name="q"
                  placeholder="ค้นหา"
                  className="pl-9 h-10 rounded-full bg-[var(--shop-bg)] border-[var(--shop-border)]"
                />
              </div>
            </form>
            <nav className="flex-1 overflow-y-auto p-2">
              <Link
                href={`/stores/${storeSlug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-[var(--shop-ink)] hover:bg-[var(--shop-bg)]"
              >
                <span>ใหม่ล่าสุด</span>
                <ChevronRight className="size-4 text-[var(--shop-ink-muted)]" />
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={categoryHref(c)}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-lg text-base text-[var(--shop-ink)] hover:bg-[var(--shop-bg)]"
                >
                  <span>{c}</span>
                  <ChevronRight className="size-4 text-[var(--shop-ink-muted)]" />
                </Link>
              ))}
            </nav>
            <div className="border-t border-[var(--shop-border)] p-4 grid grid-cols-3 gap-2">
              <Button asChild variant="outline" className="text-xs">
                <Link
                  href={`/stores/${storeSlug}/wishlist`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Heart className="size-4" />
                  รายการโปรด
                </Link>
              </Button>
              <Button asChild variant="outline" className="text-xs">
                <Link href="/signin" onClick={() => setMobileOpen(false)}>
                  <User className="size-4" />
                  เข้าสู่ระบบ
                </Link>
              </Button>
              <Button asChild className="text-xs" style={{ backgroundColor: accent }}>
                <Link
                  href={`/stores/${storeSlug}/cart`}
                  onClick={() => setMobileOpen(false)}
                >
                  <ShoppingBag className="size-4" />
                  ตะกร้า ({cartCount})
                </Link>
              </Button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close overlay"
            className="flex-1 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
