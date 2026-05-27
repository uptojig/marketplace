'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Aperture, Search, ShoppingBag, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

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
    <header className="sticky top-0 z-50 bg-[#0C0A09]/90 backdrop-blur-xl border-b border-[#44403C] font-[family:var(--font-prompt)]">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="เปิดเมนู"
            className="md:hidden w-10 h-10 flex items-center justify-center border border-[#44403C] hover:border-[#F59E0B] text-[#F5F5F4] transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            href={`/stores/${storeSlug}`}
            className="flex items-center gap-3 min-w-0"
          >
            {storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 shrink-0 border border-[#F59E0B] bg-gradient-to-br from-[#1C1917] to-[#0C0A09] flex items-center justify-center pv-glow-amber">
                <Aperture className="w-5 h-5 text-[#F59E0B]" strokeWidth={1.5} />
              </div>
            )}
            <div className="min-w-0 hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#A8A29E] font-semibold">
                Photo Vault
              </p>
              <p className="font-[family:var(--font-kanit)] text-xl font-bold tracking-tight text-[#F5F5F4] truncate max-w-[14rem]">
                {storeName}
              </p>
            </div>
          </Link>
        </div>

        {/* Search */}
        <form
          action={`/stores/${storeSlug}/search`}
          method="get"
          className="hidden md:flex flex-1 max-w-md relative"
        >
          <input
            type="text"
            name="q"
            placeholder="ค้นหา preset · LUT · action..."
            className="w-full bg-[#1C1917] border border-[#44403C] py-2.5 pl-4 pr-10 text-sm text-[#F5F5F4] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#F59E0B] transition-colors rounded-sm"
          />
          <button
            type="submit"
            aria-label="ค้นหา"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#A8A29E] hover:text-[#F59E0B] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Cart */}
        <div className="flex items-center gap-2">
          <Link
            href={`/stores/${storeSlug}/cart`}
            className="relative inline-flex items-center gap-2 h-10 px-4 bg-[#F59E0B] text-[#0C0A09] hover:bg-[#FBBF24] transition-colors font-[family:var(--font-kanit)] font-bold text-sm tracking-wide pv-glow-amber"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">ตะกร้า</span>
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-[#E11D48] text-white text-[10px] font-bold rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category rail (desktop) */}
      {categories.length > 0 && (
        <div className="hidden md:block border-t border-[#44403C] bg-[#0C0A09]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-1 overflow-x-auto hide-scrollbar">
            <Link
              href={`/stores/${storeSlug}/category`}
              className="shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-[#A8A29E] hover:text-[#F59E0B] transition-colors font-semibold inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" /> ทั้งหมด
            </Link>
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c}
                href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(c)}`}
                className="shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-[#A8A29E] hover:text-[#F59E0B] transition-colors font-semibold"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#44403C] bg-[#0C0A09]">
          <form
            action={`/stores/${storeSlug}/search`}
            method="get"
            className="p-4 relative border-b border-[#44403C]"
          >
            <input
              type="text"
              name="q"
              placeholder="ค้นหา preset · LUT..."
              className="w-full bg-[#1C1917] border border-[#44403C] py-2 pl-4 pr-10 text-sm text-[#F5F5F4] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#F59E0B]"
            />
            <button
              type="submit"
              aria-label="ค้นหา"
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-[#A8A29E]"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
          {categories.length > 0 && (
            <nav className="p-4 grid grid-cols-2 gap-2">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat}
                  href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="pv-chip px-3 py-2 text-xs uppercase tracking-[0.24em] text-[#F5F5F4] font-semibold"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          )}
        </div>
      )}
    </header>
  );
}
