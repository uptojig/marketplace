'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, FileText } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

/**
 * ResumeForge header — sticky white letterhead with navy underline,
 * search, cart pill. Category strip below the main bar shows up to 6
 * resume-category chips (executive / engineering / design / finance
 * / healthcare / academic / creative).
 */
export function Header({ storeSlug, storeName, storeLogoUrl, categories = [] }: Props) {
  const cartCount = useCart((s) => s.lines.filter((l) => l.storeSlug === storeSlug).length);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#CBD5E1] font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Left — burger + logo */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A] hover:bg-[#E2E8F0] hover:border-[#1E3A8A] transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href={`/stores/${storeSlug}`} className="flex items-center gap-3 min-w-0">
            {storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-10 w-auto object-contain rounded-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#172554] flex items-center justify-center shrink-0 rf-glow-primary border border-[#172554]">
                <FileText className="w-5 h-5 text-[#FBBF24]" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="hidden sm:inline font-[family:var(--font-kanit)] font-bold text-lg text-[#0F172A] truncate max-w-[14rem] leading-tight">
                {storeName}
              </span>
              <span className="hidden sm:inline text-[10px] font-bold tracking-[0.2em] uppercase text-[#B45309]">
                Resume · CV · Cover Letter
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
            placeholder="ค้นหาเทมเพลตเรซูเม่ · CV · cover letter..."
            aria-label="ค้นหาเทมเพลต"
            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-md py-2 pl-10 pr-4 text-sm font-medium text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] pointer-events-none" />
        </form>

        {/* Right — cart */}
        <Link
          href={`/stores/${storeSlug}/cart`}
          className="relative inline-flex items-center gap-2 h-10 px-4 sm:px-5 rounded-md bg-[#1E3A8A] text-white font-[family:var(--font-kanit)] font-semibold text-sm rf-glow-primary hover:bg-[#1E40AF] active:scale-95 transition-all"
          aria-label="ตะกร้าสินค้า"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden md:inline">ตะกร้า</span>
          <span
            className="inline-flex items-center justify-center min-w-[1.4rem] h-5 px-1.5 rounded bg-[#FBBF24] text-[#172554] text-[11px] font-extrabold"
            aria-label={`${cartCount} รายการ`}
          >
            {cartCount}
          </span>
        </Link>
      </div>

      {/* Category chip strip (desktop) */}
      {categories.length > 0 && (
        <nav className="hidden md:block border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <ul className="flex items-center gap-2 overflow-x-auto rf-no-scrollbar">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat} className="shrink-0">
                  <Link
                    href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#CBD5E1] bg-white text-xs font-semibold tracking-wide text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-current" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#CBD5E1] bg-white">
          <form
            action={`/stores/${storeSlug}/search`}
            method="get"
            className="p-4 border-b border-[#E2E8F0] relative"
            role="search"
          >
            <input
              type="text"
              name="q"
              placeholder="ค้นหาเทมเพลต..."
              aria-label="ค้นหาเทมเพลต"
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-md py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#1E3A8A]"
            />
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
          </form>
          {categories.length > 0 && (
            <nav className="p-4 grid grid-cols-2 gap-2 border-b border-[#E2E8F0]">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat}
                  href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md border border-[#CBD5E1] bg-white px-3 py-2.5 text-xs font-semibold text-[#0F172A] text-center hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] transition-colors"
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
