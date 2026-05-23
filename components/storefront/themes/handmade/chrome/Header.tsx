'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, Search, Heart } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

/**
 * Handmade — Header
 *
 * Sticky atelier-style header with:
 *  • brand mark (logo OR wordmark + "Atelier · Handmade" eyebrow)
 *  • centered search form posting to /stores/<slug>/search?q=
 *  • top-nav strip of category labels (first 6) on desktop
 *  • mobile sheet that lists every category + extra links
 *  • cart badge driven by zustand `useCart`
 *
 * Visual language reads from the Specialty family CSS-var cascade
 * (`--shop-bg`, `--shop-ink`, `--shop-border`, `--shop-primary`,
 * `--shop-accent`) — see `lib/landing/specialty.ts`. Typography
 * uses --font-prompt for Thai readability while the wordmark
 * leans on the family's slab-serif display var.
 */

export interface HandmadeHeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
  accent?: string;
}

export function Header({
  storeSlug,
  storeName,
  storeLogoUrl,
  categories,
  accent,
}: HandmadeHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const cartItemCount = useCart((s) =>
    s.lines.filter((l) => l.storeSlug === storeSlug).reduce((n, l) => n + l.qty, 0),
  );

  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
    search: `/stores/${storeSlug}/search`,
    about: `/stores/${storeSlug}/about`,
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('q') as HTMLInputElement | null;
    const q = (input?.value ?? '').trim();
    if (!q) return;
    router.push(`${urls.search}?q=${encodeURIComponent(q)}`);
  };

  const accentColor = accent ?? 'var(--shop-primary, #ca8a04)';

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--shop-bg, #f5efe3) 92%, transparent)',
        color: 'var(--shop-ink, #44403c)',
        borderColor: 'var(--shop-border, #e7e2d6)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className="sm:hidden p-2 -ml-2 transition-colors hover:opacity-70"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label={isMobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* Brand mark */}
          <Link href={urls.home} className="flex items-center gap-3 flex-shrink-0 group">
            {storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="flex flex-col items-start leading-tight">
                <span
                  className="text-2xl tracking-wide font-[family:var(--font-specialty-display,var(--font-prompt))]"
                  style={{ color: 'var(--shop-ink, #44403c)', fontWeight: 500 }}
                >
                  {storeName}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.18em] font-[family:var(--font-prompt)]"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  Atelier · Handmade
                </span>
              </div>
            )}
          </Link>

          {/* Search — desktop */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            action={urls.search}
            method="GET"
            className="hidden md:flex flex-1 max-w-md mx-4 items-center border rounded-full overflow-hidden"
            style={{
              borderColor: 'var(--shop-border, #e7e2d6)',
              backgroundColor: 'var(--shop-card, #fbf9f3)',
            }}
          >
            <label htmlFor="handmade-search" className="sr-only">
              ค้นหา
            </label>
            <input
              id="handmade-search"
              type="search"
              name="q"
              placeholder="ค้นหางานคราฟท์ ของแต่งบ้าน ของขวัญ..."
              className="flex-1 px-4 py-2 text-sm bg-transparent focus:outline-none font-[family:var(--font-prompt)]"
              style={{ color: 'var(--shop-ink, #44403c)' }}
            />
            <button
              type="submit"
              className="px-4 py-2 flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ color: accentColor }}
              aria-label="ค้นหา"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={urls.about}
              className="hidden lg:flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] hover:opacity-70 transition-opacity font-[family:var(--font-prompt)]"
              style={{ color: 'var(--shop-ink-muted, #78716c)' }}
            >
              <Heart className="h-3.5 w-3.5" />
              <span>เรื่องราว</span>
            </Link>

            <Link
              href={urls.cart}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full border transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--shop-border, #e7e2d6)',
                color: 'var(--shop-ink, #44403c)',
              }}
              aria-label="ตะกร้า"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-[family:var(--font-prompt)] hidden sm:inline">
                ตะกร้า
              </span>
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none rounded-full"
                  style={{
                    backgroundColor: accentColor,
                    color: 'var(--shop-bg, #f5efe3)',
                  }}
                  aria-label={`สินค้าในตะกร้า ${cartItemCount} ชิ้น`}
                >
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Category strip — desktop */}
        {categories.length > 0 && (
          <nav
            className="hidden sm:flex items-center gap-6 py-2 overflow-x-auto no-scrollbar border-t"
            style={{ borderColor: 'var(--shop-border, #e7e2d6)' }}
            aria-label="หมวดหมู่สินค้า"
          >
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category}
                href={`${urls.shop}?cat=${encodeURIComponent(category)}`}
                className="text-xs uppercase tracking-[0.18em] whitespace-nowrap hover:opacity-70 transition-opacity font-[family:var(--font-prompt)]"
                style={{ color: 'var(--shop-ink-muted, #78716c)' }}
              >
                {category}
              </Link>
            ))}
          </nav>
        )}

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            action={urls.search}
            method="GET"
            className="flex items-center border rounded-full overflow-hidden"
            style={{
              borderColor: 'var(--shop-border, #e7e2d6)',
              backgroundColor: 'var(--shop-card, #fbf9f3)',
            }}
          >
            <label htmlFor="handmade-search-mobile" className="sr-only">
              ค้นหา
            </label>
            <input
              id="handmade-search-mobile"
              type="search"
              name="q"
              placeholder="ค้นหา..."
              className="flex-1 px-4 py-2 text-sm bg-transparent focus:outline-none font-[family:var(--font-prompt)]"
              style={{ color: 'var(--shop-ink, #44403c)' }}
            />
            <button
              type="submit"
              className="px-4 py-2 flex items-center justify-center"
              style={{ color: accentColor }}
              aria-label="ค้นหา"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile menu sheet */}
      {isMobileMenuOpen && (
        <div
          className="sm:hidden absolute top-full inset-x-0 border-b shadow-lg"
          style={{
            backgroundColor: 'var(--shop-bg, #f5efe3)',
            borderColor: 'var(--shop-border, #e7e2d6)',
          }}
        >
          <nav className="px-4 py-2" aria-label="เมนูมือถือ">
            {categories.map((category) => (
              <Link
                key={category}
                href={`${urls.shop}?cat=${encodeURIComponent(category)}`}
                className="block py-3 text-sm font-[family:var(--font-prompt)] border-b last:border-b-0"
                style={{
                  borderColor: 'var(--shop-border, #e7e2d6)',
                  color: 'var(--shop-ink, #44403c)',
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category}
              </Link>
            ))}
            <Link
              href={urls.about}
              className="block py-3 text-sm font-[family:var(--font-prompt)]"
              style={{ color: 'var(--shop-ink, #44403c)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              เรื่องราวของเรา
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
