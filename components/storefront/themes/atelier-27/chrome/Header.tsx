'use client';
import React, { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
  accent?: string;
}

export function Header({ storeSlug, storeName, storeLogoUrl, categories }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCart((s) => s.countForStore(storeSlug));

  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
    about: `/stores/${storeSlug}/about`,
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fafaf9]/95 backdrop-blur-md">
      {/* Main header row */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-[72px] lg:h-20">

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#1c1917] hover:text-[#a8a29e] transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>

          {/* Desktop left nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {categories.slice(0, 4).map((category) => (
              <a
                key={category}
                href={`${urls.shop}?cat=${encodeURIComponent(category)}`}
                className="font-[family:var(--font-prompt)] text-[11px] tracking-[0.2em] uppercase text-[#78716c] hover:text-[#1c1917] transition-colors duration-300"
              >
                {category}
              </a>
            ))}
          </nav>

          {/* Center logo / brand */}
          <a href={urls.home} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0">
            {storeLogoUrl ? (
              <img src={storeLogoUrl} alt={storeName} className="h-7 w-auto object-contain" />
            ) : (
              <span className="font-[family:var(--font-kanit)] font-light text-xl sm:text-2xl tracking-[0.35em] uppercase text-[#1c1917]">
                Atelier 27
              </span>
            )}
          </a>

          {/* Right actions */}
          <div className="flex items-center gap-6">
            <a
              href={urls.about}
              className="hidden lg:inline font-[family:var(--font-prompt)] text-[11px] tracking-[0.2em] uppercase text-[#78716c] hover:text-[#1c1917] transition-colors duration-300"
            >
              เกี่ยวกับเรา
            </a>
            <a
              href={urls.cart}
              className="relative p-2 text-[#1c1917] hover:text-[#78716c] transition-colors duration-300"
              aria-label="Cart"
            >
              <ShoppingBag size={19} strokeWidth={1.25} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1c1917] text-[#fafaf9] text-[9px] font-[family:var(--font-prompt)] font-medium rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom border — hair-thin */}
      <div className="h-px bg-[#e7e5e4]" />

      {/* Mobile slide-down nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#fafaf9] border-b border-[#e7e5e4] px-6 py-8 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {categories.slice(0, 6).map((category) => (
            <a
              key={category}
              href={`${urls.shop}?cat=${encodeURIComponent(category)}`}
              className="block font-[family:var(--font-kanit)] font-light text-sm tracking-[0.25em] uppercase text-[#44403c] hover:text-[#1c1917] transition-colors"
            >
              {category}
            </a>
          ))}
          <div className="pt-4 border-t border-[#e7e5e4]">
            <a
              href={urls.about}
              className="block font-[family:var(--font-prompt)] text-xs tracking-[0.2em] uppercase text-[#78716c] hover:text-[#1c1917] transition-colors"
            >
              เกี่ยวกับเรา
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
