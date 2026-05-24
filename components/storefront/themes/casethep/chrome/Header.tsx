'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-white border-b-4 border-black font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="เปิดเมนู"
            className="md:hidden p-2 border-4 border-transparent hover:border-black hover:bg-yellow-400 transition-colors text-black"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link
            href={`/stores/${storeSlug}`}
            className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-black tracking-tighter uppercase text-black flex items-center gap-2"
          >
            {storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-10 w-auto border-4 border-black"
              />
            ) : (
              <div className="w-10 h-10 bg-black flex items-center justify-center shrink-0">
                <div className="w-5 h-5 bg-yellow-400 rotate-45" />
              </div>
            )}
            <span className="hidden sm:inline truncate max-w-[14rem]">{storeName}</span>
          </Link>
        </div>

        <form
          action={`/stores/${storeSlug}/search`}
          method="get"
          className="hidden md:flex flex-1 max-w-md mx-8 relative"
        >
          <input
            type="text"
            name="q"
            placeholder="ค้นหาสินค้าปาร์ตี้..."
            className="w-full bg-white border-4 border-black py-2 pl-4 pr-10 text-sm font-bold uppercase focus:outline-none focus:bg-pink-100 transition-colors"
          />
          <button
            type="submit"
            aria-label="ค้นหา"
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-black hover:text-pink-600"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center gap-3">
          <Link
            href={`/stores/${storeSlug}/cart`}
            className="relative h-12 px-4 sm:px-6 flex items-center gap-2 bg-pink-500 text-white border-4 border-black font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none transition-colors font-[family:var(--font-kanit)]"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden md:inline">ตะกร้า</span>
            <span>({cartCount})</span>
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t-4 border-black bg-white">
          <form action={`/stores/${storeSlug}/search`} method="get" className="p-4 border-b-4 border-black relative">
            <input
              type="text"
              name="q"
              placeholder="ค้นหา..."
              className="w-full border-4 border-black py-2 pl-4 pr-10 text-sm font-bold uppercase focus:outline-none focus:bg-pink-100"
            />
            <button type="submit" aria-label="ค้นหา" className="absolute right-6 top-1/2 -translate-y-1/2 p-2">
              <Search className="w-5 h-5" />
            </button>
          </form>
          {categories.length > 0 && (
            <nav className="p-4 grid grid-cols-2 gap-2 border-b-4 border-black">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat}
                  href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="border-4 border-black px-3 py-2 text-xs font-black uppercase tracking-widest bg-white hover:bg-yellow-400 active:translate-x-1 active:translate-y-1"
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
