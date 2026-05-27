'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, Palette } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

/**
 * Vector Bazaar header — rounded, designer-friendly. Confetti-dot strip
 * under the main nav lists categories as pastel chips. Cart pill is
 * pink-primary with the standard --shop-* cascade where reasonable.
 */
export function Header({ storeSlug, storeName, storeLogoUrl, categories = [] }: Props) {
  const cartCount = useCart((s) => s.lines.filter((l) => l.storeSlug === storeSlug).length);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#FBCFE8] font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left — burger + logo */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#FBCFE8] bg-white text-[#1E1B4B] hover:bg-[#FCE7F3] hover:border-[#F472B6] transition-colors"
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
                className="h-10 w-auto object-contain rounded-xl"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F472B6] via-[#FBBF24] to-[#60A5FA] flex items-center justify-center shrink-0 vb-glow-primary">
                <Palette className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="hidden sm:inline font-[family:var(--font-kanit)] font-black text-xl text-[#1E1B4B] truncate max-w-[14rem] leading-tight">
                {storeName}
              </span>
              <span className="hidden sm:inline text-[10px] font-bold tracking-widest uppercase text-[#6366F1]">
                Vector · Icon · SVG
              </span>
            </div>
          </Link>
        </div>

        {/* Center — search */}
        <form
          action={`/stores/${storeSlug}/search`}
          method="get"
          className="hidden md:flex flex-1 max-w-md mx-4 relative"
          role="search"
        >
          <input
            type="text"
            name="q"
            placeholder="ค้นหา SVG · icon · vector pack..."
            aria-label="ค้นหาสินค้า"
            className="w-full bg-[#FCE7F3]/40 border border-[#FBCFE8] rounded-full py-2.5 pl-12 pr-4 text-sm font-medium text-[#1E1B4B] placeholder-[#A78BFA] focus:outline-none focus:bg-white focus:border-[#F472B6] focus:ring-2 focus:ring-[#F472B6]/30 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6366F1] pointer-events-none" />
        </form>

        {/* Right — cart */}
        <Link
          href={`/stores/${storeSlug}/cart`}
          className="relative inline-flex items-center gap-2 h-11 px-4 sm:px-5 rounded-full bg-[#F472B6] text-white font-[family:var(--font-kanit)] font-bold text-sm vb-glow-primary hover:bg-[#EC4899] active:scale-95 transition-all"
          aria-label="ตะกร้าสินค้า"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden md:inline">ตะกร้า</span>
          <span
            className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-white text-[#DB2777] text-xs font-black"
            aria-label={`${cartCount} รายการ`}
          >
            {cartCount}
          </span>
        </Link>
      </div>

      {/* Category chip strip (desktop) */}
      {categories.length > 0 && (
        <nav className="hidden md:block border-t border-[#FBCFE8]/60 bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <ul className="flex items-center gap-2 overflow-x-auto vb-no-scrollbar">
              {categories.slice(0, 8).map((cat, idx) => {
                const colors = [
                  'border-[#F472B6] text-[#DB2777] hover:bg-[#FCE7F3]',
                  'border-[#60A5FA] text-[#2563EB] hover:bg-[#DBEAFE]',
                  'border-[#FBBF24] text-[#B45309] hover:bg-[#FEF3C7]',
                  'border-[#34D399] text-[#047857] hover:bg-[#D1FAE5]',
                  'border-[#A78BFA] text-[#6D28D9] hover:bg-[#EDE9FE]',
                ];
                const c = colors[idx % colors.length];
                return (
                  <li key={cat} className="shrink-0">
                    <Link
                      href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                      className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-full border bg-white text-xs font-bold tracking-wide transition-colors ${c}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {cat}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#FBCFE8] bg-white">
          <form
            action={`/stores/${storeSlug}/search`}
            method="get"
            className="p-4 border-b border-[#FBCFE8] relative"
            role="search"
          >
            <input
              type="text"
              name="q"
              placeholder="ค้นหา SVG · icon..."
              aria-label="ค้นหาสินค้า"
              className="w-full bg-[#FCE7F3]/40 border border-[#FBCFE8] rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#F472B6]"
            />
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6366F1]" />
          </form>
          {categories.length > 0 && (
            <nav className="p-4 grid grid-cols-2 gap-2 border-b border-[#FBCFE8]">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat}
                  href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border border-[#FBCFE8] bg-white px-3 py-2.5 text-xs font-bold text-[#1E1B4B] text-center hover:bg-[#FCE7F3] hover:border-[#F472B6] transition-colors"
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
