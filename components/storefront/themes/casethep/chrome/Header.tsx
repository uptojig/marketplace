'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

/**
 * Casethep header — minimal logo · rounded-full search · cart pill.
 * Soft cream backdrop with primary CSS-var for cart count and active
 * states so the per-store accent override paints correctly.
 */
export function Header({ storeSlug, storeName, storeLogoUrl, categories = [] }: Props) {
  const cartCount = useCart((s) => s.lines.filter((l) => l.storeSlug === storeSlug).length);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md font-[family:var(--font-prompt)]"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3 sm:gap-6">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
          className="md:hidden p-2 -ml-2 text-[color:var(--shop-ink,#1A1A1F)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <Link
          href={`/stores/${storeSlug}`}
          className="flex items-center gap-2 shrink-0"
        >
          {storeLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={storeLogoUrl}
              alt={storeName}
              className="h-8 w-8 object-cover rounded-full"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{
                background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
              }}
              aria-hidden
            >
              {storeName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span className="font-[family:var(--font-kanit)] text-lg sm:text-xl font-semibold tracking-tight text-[color:var(--shop-ink,#1A1A1F)] truncate max-w-[10rem] sm:max-w-[14rem]">
            {storeName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 ml-4">
          <Link
            href={`/stores/${storeSlug}/category`}
            className="text-sm text-[color:var(--shop-ink,#1A1A1F)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
          >
            สินค้าทั้งหมด
          </Link>
          {categories.slice(0, 3).map((cat) => (
            <Link
              key={cat}
              href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
              className="text-sm text-[color:var(--shop-ink,#1A1A1F)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* Search (desktop) */}
        <form
          action={`/stores/${storeSlug}/search`}
          method="get"
          className="hidden md:flex flex-1 max-w-sm ml-auto relative"
        >
          <input
            type="text"
            name="q"
            placeholder="ค้นหาเคส รุ่นโทรศัพท์..."
            className="w-full rounded-full bg-[#F5F1EB] border border-transparent focus:border-[color:var(--shop-primary,#FF5A6A)] focus:bg-white py-2 pl-4 pr-10 text-sm text-[color:var(--shop-ink,#1A1A1F)] placeholder:text-[color:var(--shop-ink-muted,#6B7280)] outline-none transition-colors"
          />
          <button
            type="submit"
            aria-label="ค้นหา"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#FF5A6A)]"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Cart pill */}
        <Link
          href={`/stores/${storeSlug}/cart`}
          className="ml-auto md:ml-0 inline-flex items-center gap-2 rounded-full pl-3 pr-4 h-9 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
          }}
          aria-label="ตะกร้าสินค้า"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">ตะกร้า</span>
          <span className="tabular-nums">{cartCount}</span>
        </Link>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'var(--shop-bg, #FBF8F3)' }}
        >
          <form
            action={`/stores/${storeSlug}/search`}
            method="get"
            className="p-4 relative"
          >
            <input
              type="text"
              name="q"
              placeholder="ค้นหา..."
              className="w-full rounded-full bg-white border border-[color:var(--shop-primary,#FF5A6A)]/20 py-2 pl-4 pr-10 text-sm outline-none focus:border-[color:var(--shop-primary,#FF5A6A)]"
            />
            <button
              type="submit"
              aria-label="ค้นหา"
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[color:var(--shop-ink-muted,#6B7280)]"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
          <nav className="px-4 pb-4 flex flex-col gap-2">
            <Link
              href={`/stores/${storeSlug}/category`}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-[color:var(--shop-ink,#1A1A1F)] py-2"
            >
              สินค้าทั้งหมด
            </Link>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[color:var(--shop-ink,#1A1A1F)] py-2"
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
