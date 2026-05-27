'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

/**
 * MysticMu Header — Mario pixel-art with bold 4px dark border, hard
 * offset shadows on CTAs, coin-gold accent strips. Sky-blue strip at
 * top, dark-ink nav row underneath.
 */
export function Header({ storeSlug, storeName, storeLogoUrl, categories = [] }: Props) {
  const cartCount = useCart((s) => s.lines.filter((l) => l.storeSlug === storeSlug).length);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b-4 border-[#1A1A2E] font-[family:var(--font-prompt)]">
      {/* Top coin strip — pixel pattern decoration */}
      <div className="h-2 bg-gradient-to-r from-[#FFD700] via-[#E52521] via-50% to-[#009A4E]" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="เปิดเมนู"
            className="md:hidden w-11 h-11 border-4 border-[#1A1A2E] bg-white text-[#1A1A2E] flex items-center justify-center hover:bg-[#FFD700] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            href={`/stores/${storeSlug}`}
            className="font-[family:var(--font-kanit)] text-xl sm:text-2xl font-black tracking-tight uppercase text-[#1A1A2E] flex items-center gap-2"
          >
            {storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-10 w-auto object-contain border-4 border-[#1A1A2E] bg-white p-1"
              />
            ) : (
              <div className="relative w-11 h-11 bg-[#E52521] border-4 border-[#1A1A2E] flex items-center justify-center shrink-0 shadow-[3px_3px_0_0_#1A1A2E]">
                <span className="font-[family:var(--font-kanit)] font-black text-white text-xl leading-none">
                  M
                </span>
                <span
                  className="absolute -top-2 -right-2 text-[10px] leading-none"
                  aria-hidden
                >
                  ⭐
                </span>
              </div>
            )}
            <span className="hidden sm:inline truncate max-w-[12rem]">{storeName}</span>
          </Link>
        </div>

        {/* Desktop search */}
        <form
          action={`/stores/${storeSlug}/search`}
          method="get"
          className="hidden md:flex flex-1 max-w-md mx-4 relative"
        >
          <input
            type="text"
            name="q"
            placeholder="ค้นหาวอลเปเปอร์มงคล..."
            className="w-full bg-white border-4 border-[#1A1A2E] py-2 pl-4 pr-10 text-sm font-semibold focus:outline-none focus:bg-[#FFF8DC] transition-colors placeholder:text-[#4A4A6E]"
          />
          <button
            type="submit"
            aria-label="ค้นหา"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-[#1A1A2E] hover:text-[#E52521]"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* Cart CTA — Mario red block */}
        <Link
          href={`/stores/${storeSlug}/cart`}
          className="relative h-11 px-3 sm:px-5 flex items-center gap-2 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-wide text-sm shadow-[3px_3px_0_0_#1A1A2E] hover:bg-[#009A4E] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="hidden md:inline">ตะกร้า</span>
          <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1 bg-[#FFD700] text-[#1A1A2E] border-2 border-[#1A1A2E] font-black text-xs">
            {cartCount}
          </span>
        </Link>
      </div>

      {/* Desktop category nav */}
      {categories.length > 0 && (
        <nav className="hidden md:block border-t-4 border-[#1A1A2E] bg-[#5C94FC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 h-12 overflow-x-auto hide-scrollbar">
            <span className="shrink-0 font-[family:var(--font-kanit)] font-black text-white text-xs uppercase tracking-widest pr-3 border-r-2 border-white/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> หมวด
            </span>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                className="shrink-0 h-8 px-3 flex items-center font-[family:var(--font-kanit)] font-bold uppercase text-xs tracking-wider text-white border-2 border-transparent hover:border-[#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-y-0.5 transition-colors"
              >
                {cat}
              </Link>
            ))}
            <Link
              href={`/stores/${storeSlug}/category`}
              className="ml-auto shrink-0 h-8 px-3 flex items-center font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-[#FFD700] hover:text-white"
            >
              ดูทั้งหมด →
            </Link>
          </div>
        </nav>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t-4 border-[#1A1A2E] bg-white">
          <form
            action={`/stores/${storeSlug}/search`}
            method="get"
            className="p-4 border-b-4 border-[#1A1A2E] relative bg-[#5C94FC]"
          >
            <input
              type="text"
              name="q"
              placeholder="ค้นหา..."
              className="w-full border-4 border-[#1A1A2E] bg-white py-2 pl-4 pr-10 text-sm font-semibold focus:outline-none focus:bg-[#FFF8DC]"
            />
            <button
              type="submit"
              aria-label="ค้นหา"
              className="absolute right-6 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
          {categories.length > 0 && (
            <nav className="p-4 grid grid-cols-2 gap-2">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat}
                  href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="border-4 border-[#1A1A2E] bg-white px-3 py-2 text-xs font-[family:var(--font-kanit)] font-black uppercase tracking-wider hover:bg-[#FFD700] active:translate-x-0.5 active:translate-y-0.5"
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
