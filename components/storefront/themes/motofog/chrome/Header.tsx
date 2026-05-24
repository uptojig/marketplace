'use client';

/**
 * MotoFog — racing header.
 *
 * High-energy motorsport header with a skewed bottom edge (racing
 * banner feel), a rounded-full search field, and an accent cart pill.
 *
 * Palette tokens come from CSS vars (`--shop-bg`, `--shop-surface`,
 * `--shop-ink`, `--shop-primary`, `--shop-accent`) so the three
 * motofog palette variants re-skin without JSX changes.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, Search, X, Flag } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import type { HeaderProps } from '@/lib/templates/types';

export function MotoFogHeader(props: HeaderProps) {
  const { storeSlug, storeName, storeLogoUrl, categories = [] } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = useCart((s) =>
    s.lines.filter((l) => l.storeSlug === storeSlug).reduce((n, l) => n + l.qty, 0),
  );

  const navCats = categories.slice(0, 5);

  return (
    <header
      className="relative z-40"
      style={{
        backgroundColor: 'var(--shop-surface, #1A2128)',
        color: 'var(--shop-ink, #F5F7FA)',
      }}
    >
      {/* Top bar */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-20 gap-4">
          {/* Mobile menu */}
          <button
            type="button"
            aria-label="เปิดเมนู"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 -ml-2 rounded-md hover:bg-white/5 transition-colors"
            style={{ color: 'var(--shop-ink, #F5F7FA)' }}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo + brand */}
          <Link
            href={`/stores/${storeSlug}`}
            className="flex items-center gap-3 shrink-0"
          >
            {storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-10 w-10 object-cover rounded-md"
                style={{ border: '1px solid var(--shop-border, #2B3540)' }}
              />
            ) : (
              <div
                className="h-10 w-10 flex items-center justify-center rounded-md"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                }}
              >
                <Flag className="h-5 w-5 text-black" />
              </div>
            )}
            <div className="flex flex-col leading-none">
              <span
                className="font-[family:var(--font-kanit)] italic font-black text-xl sm:text-2xl uppercase tracking-tight"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              >
                {storeName}
              </span>
              <span
                className="font-[family:var(--font-prompt)] text-[9px] tracking-[0.25em] uppercase font-bold mt-0.5"
                style={{ color: 'var(--shop-accent, #FFC72C)' }}
              >
                Racing · Performance
              </span>
            </div>
          </Link>

          {/* Search field — rounded-full */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <label className="sr-only" htmlFor="motofog-search">
              ค้นหาอะไหล่ / ชุดแข่ง
            </label>
            <div
              className="flex items-center gap-2 w-full rounded-full px-4 h-10"
              style={{
                backgroundColor: 'var(--shop-bg, #0F1417)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--shop-ink-muted, #94A3B0)' }} />
              <input
                id="motofog-search"
                type="search"
                placeholder="ค้นหาอะไหล่ ชุดแข่ง หมวกกันน็อก..."
                className="bg-transparent border-0 outline-none w-full text-sm font-[family:var(--font-prompt)] placeholder:opacity-60"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              />
            </div>
          </div>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <Link
              href={`/stores/${storeSlug}/cart`}
              aria-label="ตะกร้าสินค้า"
              className="relative inline-flex items-center gap-2 rounded-full pl-3 pr-4 h-10 font-[family:var(--font-prompt)] text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5"
              style={{
                background:
                  'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                color: '#0A0A0A',
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">ตะกร้า</span>
              <span
                className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[10px] font-black bg-black text-white tabular-nums"
              >
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Desktop nav strip */}
        <nav
          className="hidden md:block border-t"
          style={{
            borderColor: 'var(--shop-border, #2B3540)',
            backgroundColor: 'var(--shop-bg, #0F1417)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center gap-1">
            <Link
              href={`/stores/${storeSlug}/category`}
              className="px-3 py-1.5 font-[family:var(--font-kanit)] italic font-black text-xs uppercase tracking-wider rounded-sm transition-colors"
              style={{
                color: 'var(--shop-accent, #FFC72C)',
              }}
            >
              สินค้าทั้งหมด
            </Link>
            {navCats.map((cat) => (
              <Link
                key={cat}
                href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                className="px-3 py-1.5 font-[family:var(--font-prompt)] text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-white/5 transition-colors"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </nav>

        {/* Skewed bottom edge — speed/racing flag vibe */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 -bottom-3 h-3"
          style={{
            background:
              'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
            clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 100%)',
          }}
        />
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            backgroundColor: 'var(--shop-bg, #0F1417)',
            borderColor: 'var(--shop-border, #2B3540)',
          }}
        >
          <div className="px-4 py-3 space-y-1">
            <div
              className="flex items-center gap-2 rounded-full px-4 h-10 mb-3"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              <Search className="h-4 w-4" style={{ color: 'var(--shop-ink-muted, #94A3B0)' }} />
              <input
                type="search"
                placeholder="ค้นหาอะไหล่..."
                className="bg-transparent border-0 outline-none w-full text-sm font-[family:var(--font-prompt)]"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              />
            </div>
            <Link
              href={`/stores/${storeSlug}/category`}
              className="block py-2 font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-wider"
              style={{ color: 'var(--shop-accent, #FFC72C)' }}
              onClick={() => setMobileOpen(false)}
            >
              สินค้าทั้งหมด
            </Link>
            {navCats.map((cat) => (
              <Link
                key={cat}
                href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                className="block py-2 font-[family:var(--font-prompt)] text-sm uppercase tracking-wider font-semibold"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                onClick={() => setMobileOpen(false)}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default MotoFogHeader;
