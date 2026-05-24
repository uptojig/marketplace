'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Heart, User } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

/**
 * Konvy — K-beauty marketplace header.
 *
 * Premium K-beauty vibe: white background, rounded-full pill search,
 * soft hover transitions, accent-coloured wordmark. The cart pill
 * inherits `var(--shop-primary)` so all 7 palette presets re-skin it.
 *
 * Row 1: logo + pill search + nav icons (favourite / account / cart)
 * Row 2: horizontal category chip rail (only when categories present)
 */
export function Header({ storeSlug, storeName, storeLogoUrl, categories = [] }: Props) {
  const cartCount = useCart((s) => s.countForStore(storeSlug));
  const initial = storeName.trim().slice(0, 1).toUpperCase();
  const visibleCats = categories.slice(0, 8);

  const urls = {
    home: `/stores/${storeSlug}/`,
    cart: `/stores/${storeSlug}/cart`,
    account: `/stores/${storeSlug}/account`,
    favourites: `/stores/${storeSlug}/favourites`,
    search: `/stores/${storeSlug}/search`,
    category: `/stores/${storeSlug}/category`,
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[var(--shop-border)] font-[family:var(--font-prompt)] sticky top-0 z-40">
      {/* Row 1 — logo + search + actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-6 h-16 sm:h-20">
          {/* Logo */}
          <Link href={urls.home} className="flex items-center gap-2 shrink-0 group">
            {storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-9 sm:h-10 w-auto object-contain rounded-full"
              />
            ) : (
              <span
                className="h-10 w-10 rounded-full grid place-items-center font-[family:var(--font-kanit)] font-semibold text-white text-lg"
                style={{ background: 'var(--shop-primary-gradient, var(--shop-primary))' }}
              >
                {initial}
              </span>
            )}
            <span
              className="font-[family:var(--font-kanit)] font-semibold text-lg sm:text-xl tracking-tight hidden sm:block transition-colors"
              style={{ color: 'var(--shop-ink)' }}
            >
              {storeName}
            </span>
          </Link>

          {/* Pill search */}
          <form
            action={urls.search}
            method="get"
            className="flex-1 max-w-xl"
            role="search"
          >
            <label className="relative block">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: 'var(--shop-ink-muted)' }}
                aria-hidden
              />
              <input
                type="search"
                name="q"
                placeholder="ค้นหาแบรนด์ · สกินแคร์ · เมคอัพ..."
                aria-label="ค้นหาสินค้า"
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-full bg-[var(--shop-bg-soft)] text-sm border border-transparent focus:outline-none focus:border-[var(--shop-primary)] focus:bg-white transition-colors placeholder:text-[var(--shop-ink-muted)]"
                style={{ color: 'var(--shop-ink)' }}
              />
            </label>
          </form>

          {/* Nav icons */}
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0" aria-label="บัญชีและตะกร้า">
            <Link
              href={urls.favourites}
              className="hidden sm:inline-flex p-2.5 rounded-full hover:bg-[var(--shop-bg-soft)] transition-colors"
              aria-label="รายการโปรด"
            >
              <Heart className="h-5 w-5" style={{ color: 'var(--shop-ink)' }} />
            </Link>
            <Link
              href={urls.account}
              className="hidden sm:inline-flex p-2.5 rounded-full hover:bg-[var(--shop-bg-soft)] transition-colors"
              aria-label="บัญชีของฉัน"
            >
              <User className="h-5 w-5" style={{ color: 'var(--shop-ink)' }} />
            </Link>
            <Link
              href={urls.cart}
              className="relative inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: 'var(--shop-primary-gradient, var(--shop-primary))' }}
              aria-label={`ตะกร้าสินค้า ${cartCount} ชิ้น`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">ตะกร้า</span>
              {cartCount > 0 && (
                <span
                  className="min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold grid place-items-center"
                  style={{ background: 'rgba(255,255,255,0.25)' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>

      {/* Row 2 — category chip rail */}
      {visibleCats.length > 0 && (
        <nav
          aria-label="หมวดหมู่"
          className="border-t border-[var(--shop-border)] bg-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center gap-2 py-2.5 overflow-x-auto no-scrollbar text-sm">
              <li className="shrink-0">
                <Link
                  href={urls.category}
                  className="inline-block whitespace-nowrap px-3 py-1.5 rounded-full font-medium transition-colors hover:bg-[var(--shop-bg-soft)]"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  ทั้งหมด
                </Link>
              </li>
              {visibleCats.map((cat) => (
                <li key={cat} className="shrink-0">
                  <Link
                    href={`${urls.category}?cat=${encodeURIComponent(cat)}`}
                    className="inline-block whitespace-nowrap px-3 py-1.5 rounded-full text-[var(--shop-ink-muted)] hover:bg-[var(--shop-bg-soft)] hover:text-[var(--shop-ink)] transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
