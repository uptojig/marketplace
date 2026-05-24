'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

/**
 * MotoFog — bespoke header (scaffold).
 *
 * Replace with the designer's final layout — search field, mega-menu,
 * category chips, mobile sheet, etc. Cart count + search action paths
 * are wired so the scaffold is shoppable on day 1.
 */
export function Header({ storeSlug, storeName, storeLogoUrl, categories = [] }: Props) {
  const count = useCart((s) => s.lines.filter((line) => line.storeSlug === storeSlug).length);
  const initial = storeName.trim().slice(0, 1).toUpperCase();
  const visibleCats = categories.slice(0, 6);

  return (
    <header
      className="bg-[var(--shop-bg)] border-b border-[var(--shop-border)] text-[var(--shop-ink)]"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-3">
        <Link
          href={`/stores/${storeSlug}/`}
          className="flex items-center gap-2 shrink-0"
        >
          {storeLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={storeLogoUrl}
              alt={storeName}
              className="h-9 w-9 rounded object-cover"
            />
          ) : (
            <span
              className="h-9 w-9 rounded grid place-items-center font-[family:var(--font-kanit)] font-black text-white"
              style={{ background: 'var(--shop-primary)' }}
            >
              {initial}
            </span>
          )}
          <span className="font-[family:var(--font-kanit)] font-bold text-lg hidden sm:block">
            {storeName}
          </span>
        </Link>

        <form
          action={`/stores/${storeSlug}/search`}
          method="get"
          className="flex-1 max-w-xl"
          role="search"
        >
          <label className="relative block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--shop-ink-muted)]"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              placeholder="ค้นหาสินค้า..."
              aria-label="ค้นหาสินค้า"
              className="w-full pl-9 pr-3 py-2 rounded border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] text-[var(--shop-ink)] focus:outline-none focus:ring-2"
              style={{ accentColor: 'var(--shop-primary)' }}
            />
          </label>
        </form>

        <Link
          href={`/stores/${storeSlug}/cart`}
          className="relative inline-flex items-center justify-center p-2 rounded hover:bg-[var(--shop-muted)]"
          aria-label="ตะกร้าสินค้า"
        >
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold grid place-items-center text-white"
              style={{ background: 'var(--shop-primary)' }}
            >
              {count}
            </span>
          )}
        </Link>

        <button
          type="button"
          aria-label="เมนู"
          className="md:hidden p-2 rounded hover:bg-[var(--shop-muted)]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {visibleCats.length > 0 && (
        <nav
          aria-label="หมวดหมู่"
          className="hidden md:block border-t border-[var(--shop-border)] bg-[var(--shop-bg-soft)]"
        >
          <ul className="max-w-7xl mx-auto flex gap-2 px-4 py-2 overflow-x-auto">
            {visibleCats.map((cat) => (
              <li key={cat}>
                <Link
                  href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                  className="inline-block whitespace-nowrap px-3 py-1 rounded-full border border-[var(--shop-border)] text-sm hover:bg-[var(--shop-muted)]"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
