'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, Wrench } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

/**
 * GridModu — Header. Carbon dark, rounded-full search, accent cart pill.
 *
 * Kanit semibold uppercase for the store name and nav so the header
 * carries the spec-sheet vibe even on the smallest viewports.
 */
export function Header({
  storeSlug,
  storeName,
  storeLogoUrl,
  categories = [],
}: Props) {
  const count = useCart((s) =>
    s.lines
      .filter((line) => line.storeSlug === storeSlug)
      .reduce((n, l) => n + l.qty, 0),
  );
  const initial = storeName.trim().slice(0, 1).toUpperCase();
  const visibleCats = categories.slice(0, 6);

  return (
    <header className="sticky top-0 z-40 bg-[#0E0E10] border-b border-[#1F1F23] text-[#E5E7EB] font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4 py-3">
          {/* Logo + store name */}
          <Link
            href={`/stores/${storeSlug}/`}
            className="flex items-center gap-2 shrink-0 group"
          >
            {storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <span
                className="h-9 w-9 rounded-sm grid place-items-center font-[family:var(--font-kanit)] font-semibold tabular-nums text-[#0E0E10] border"
                style={{
                  background: 'var(--shop-accent, #00BFFF)',
                  borderColor: 'var(--shop-accent, #00BFFF)',
                }}
              >
                {initial}
              </span>
            )}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm text-white group-hover:text-[var(--shop-accent,#00BFFF)] transition-colors">
                {storeName}
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold">
                MOTO · PARTS · TUNING
              </span>
            </div>
          </Link>

          {/* Search (rounded-full) */}
          <form
            action={`/stores/${storeSlug}/search`}
            method="get"
            className="flex-1 max-w-xl"
            role="search"
          >
            <label className="relative block">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]"
                aria-hidden
              />
              <input
                type="search"
                name="q"
                placeholder="ค้นหาอะไหล่ · ของแต่ง · รุ่นรถ"
                aria-label="ค้นหา"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#15151A] border border-[#1F1F23] text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[var(--shop-accent,#00BFFF)]"
              />
            </label>
          </form>

          {/* Cart pill */}
          <Link
            href={`/stores/${storeSlug}/cart`}
            aria-label="ตะกร้าสินค้า"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-[#2A2A2E] text-[#E5E7EB] hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline text-xs tracking-wider uppercase font-[family:var(--font-kanit)] font-semibold">
              CART
            </span>
            {count > 0 && (
              <span
                className="min-w-5 h-5 px-1.5 rounded-full grid place-items-center text-[10px] tabular-nums font-bold font-[family:var(--font-kanit)] text-[#0E0E10]"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
              >
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="เมนู"
            className="md:hidden p-2 rounded-sm border border-[#2A2A2E] text-[#E5E7EB] hover:border-[var(--shop-accent,#00BFFF)] transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Category nav strip */}
        {visibleCats.length > 0 && (
          <nav
            aria-label="หมวดหมู่"
            className="hidden md:block border-t border-[#1F1F23]"
          >
            <ul className="flex items-center gap-1 overflow-x-auto py-2">
              <li>
                <Link
                  href={`/stores/${storeSlug}/category`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-sm text-[11px] tracking-wider uppercase font-[family:var(--font-kanit)] font-semibold text-[#E5E7EB] hover:bg-[#15151A] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
                >
                  <Wrench className="h-3 w-3" /> ทั้งหมด
                </Link>
              </li>
              {visibleCats.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                    className="inline-block whitespace-nowrap px-3 py-1.5 rounded-sm text-[11px] tracking-wider uppercase font-[family:var(--font-kanit)] font-semibold text-[#E5E7EB] hover:bg-[#15151A] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
