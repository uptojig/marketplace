'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, Code2 } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

/**
 * SalepageMarket header — ThemeForest-style top bar. Dark logo block on
 * white, prominent search, primary CTA, cart pill with count badge.
 * Categories rendered as flat nav inline on desktop, drawer on mobile.
 */
export function Header({
  storeSlug,
  storeName,
  storeLogoUrl,
  categories = [],
}: Props) {
  const cartCount = useCart(
    (s) => s.lines.filter((l) => l.storeSlug === storeSlug).length,
  );
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 font-[family:var(--font-prompt)]"
      style={{
        background: 'var(--shop-bg-soft, #FFFFFF)',
        borderBottom: '1px solid var(--shop-border, #E5E7EB)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3 sm:gap-6">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
          className="md:hidden p-2 -ml-2 text-[color:var(--shop-ink,#0D1421)] hover:text-[color:var(--shop-primary,#82B440)] transition-colors"
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
              className="h-9 w-auto object-contain"
            />
          ) : (
            <>
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center text-white"
                style={{
                  background: 'var(--shop-primary, #82B440)',
                }}
                aria-hidden
              >
                <Code2 className="w-5 h-5" />
              </div>
              <span className="font-[family:var(--font-kanit)] text-lg sm:text-xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)] truncate max-w-[10rem] sm:max-w-[14rem]">
                {storeName}
              </span>
            </>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-5 ml-4">
          <Link
            href={`/stores/${storeSlug}/category`}
            className="text-sm font-medium text-[color:var(--shop-ink,#0D1421)] hover:text-[color:var(--shop-primary,#82B440)] transition-colors"
          >
            เทมเพลตทั้งหมด
          </Link>
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat}
              href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
              className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#82B440)] transition-colors"
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* Search (desktop) */}
        <form
          action={`/stores/${storeSlug}/search`}
          method="get"
          className="hidden md:flex flex-1 max-w-md ml-auto relative"
        >
          <input
            type="text"
            name="q"
            placeholder="ค้นหาเซลเพจ · landing-page · เครื่องมือ..."
            className="w-full rounded-md border bg-[color:var(--shop-muted,#F3F4F6)] focus:bg-white focus:border-[color:var(--shop-primary,#82B440)] py-2 pl-10 pr-3 text-sm text-[color:var(--shop-ink,#0D1421)] placeholder:text-[color:var(--shop-ink-muted,#6B7280)] outline-none transition-colors"
            style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--shop-ink-muted,#6B7280)]" />
        </form>

        {/* Cart button */}
        <Link
          href={`/stores/${storeSlug}/cart`}
          className="ml-auto md:ml-0 inline-flex items-center gap-2 rounded-md px-3 h-9 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
          }}
          aria-label="ตะกร้าสินค้า"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">ตะกร้า</span>
          <span
            className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold tabular-nums"
            style={{
              background: 'rgba(255,255,255,0.22)',
              color: '#FFFFFF',
            }}
          >
            {cartCount}
          </span>
        </Link>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lg:hidden border-t"
          style={{
            borderColor: 'var(--shop-border, #E5E7EB)',
            background: 'var(--shop-bg-soft, #FFFFFF)',
          }}
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
              className="w-full rounded-md bg-[color:var(--shop-muted,#F3F4F6)] border py-2 pl-10 pr-3 text-sm outline-none focus:border-[color:var(--shop-primary,#82B440)] focus:bg-white"
              style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
            />
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--shop-ink-muted,#6B7280)]" />
          </form>
          <nav className="px-4 pb-4 flex flex-col gap-1">
            <Link
              href={`/stores/${storeSlug}/category`}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-[color:var(--shop-ink,#0D1421)] py-2"
            >
              เทมเพลตทั้งหมด
            </Link>
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat}
                href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] py-2 hover:text-[color:var(--shop-primary,#82B440)]"
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
