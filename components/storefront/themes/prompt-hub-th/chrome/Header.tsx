'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, Sparkles, Terminal } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

export function Header({ storeSlug, storeName, storeLogoUrl, categories = [] }: Props) {
  const cartCount = useCart((s) => s.lines.filter((l) => l.storeSlug === storeSlug).length);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B1F]/80 backdrop-blur-xl border-b border-[#312E81]/60 font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="เปิดเมนู"
            className="md:hidden p-2 rounded-lg text-[#F8FAFC] hover:bg-[#1E1E3F] transition-colors border border-transparent hover:border-[#312E81]"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link
            href={`/stores/${storeSlug}`}
            className="flex items-center gap-2.5 text-[#F8FAFC] hover:text-[#A855F7] transition-colors"
          >
            {storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storeLogoUrl} alt={storeName} className="h-8 w-auto object-contain" />
            ) : (
              <div
                className="relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)',
                  boxShadow:
                    '0 0 0 1px rgba(168,85,247,0.4), 0 0 12px rgba(168,85,247,0.4), 0 0 32px rgba(168,85,247,0.2)',
                }}
              >
                <Terminal className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            )}
            <span className="font-[family:var(--font-kanit)] font-semibold text-lg tracking-tight hidden sm:inline truncate max-w-[14rem]">
              {storeName}
            </span>
          </Link>
        </div>

        <form
          action={`/stores/${storeSlug}/search`}
          method="get"
          className="hidden md:flex flex-1 max-w-md relative"
        >
          <input
            type="text"
            name="q"
            placeholder="ค้นหาพรอมต์ · ChatGPT · Midjourney..."
            className="w-full bg-[#13132E]/80 border border-[#312E81] rounded-full py-2 pl-10 pr-4 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/30 transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          <button type="submit" aria-label="ค้นหา" className="sr-only">
            ค้นหา
          </button>
        </form>

        {categories.length > 0 && (
          <nav className="hidden lg:flex items-center gap-1.5">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat}
                href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                className="px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E1E3F] rounded-full transition-colors border border-transparent hover:border-[#312E81]"
              >
                {cat}
              </Link>
            ))}
          </nav>
        )}

        <Link
          href={`/stores/${storeSlug}/cart`}
          className="relative inline-flex items-center gap-2 h-10 px-4 text-white rounded-full text-sm font-medium tracking-wide hover:opacity-90 transition-opacity font-[family:var(--font-kanit)]"
          style={{
            backgroundImage: 'linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)',
            boxShadow:
              '0 0 0 1px rgba(168,85,247,0.4), 0 0 12px rgba(168,85,247,0.4), 0 0 32px rgba(168,85,247,0.2)',
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden md:inline">ตะกร้า</span>
          <span className="tabular-nums">({cartCount})</span>
        </Link>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#312E81]/60 bg-[#0B0B1F]/95 backdrop-blur-xl">
          <form
            action={`/stores/${storeSlug}/search`}
            method="get"
            className="p-4 border-b border-[#312E81]/60 relative"
          >
            <input
              type="text"
              name="q"
              placeholder="ค้นหาพรอมต์..."
              className="w-full bg-[#13132E] border border-[#312E81] rounded-full py-2 pl-10 pr-4 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#A855F7]"
            />
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          </form>
          {categories.length > 0 && (
            <nav className="p-4 grid grid-cols-2 gap-2">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat}
                  href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg bg-[#13132E] hover:bg-[#1E1E3F] text-[#F8FAFC] text-sm font-medium border border-[#312E81] hover:border-[#A855F7]/50 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
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
