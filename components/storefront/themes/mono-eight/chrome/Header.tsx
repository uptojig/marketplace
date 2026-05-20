'use client';
import React, { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
}

export function Header({ storeSlug, storeName, storeLogoUrl, categories }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
  };

  return (
    <header className="bg-[#0a0a0a] border-b border-[#1c1c1c] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-14">

          {/* Logo / Wordmark */}
          <a href={urls.home} className="flex items-center gap-3">
            {storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-6 w-auto brightness-0 invert"
              />
            ) : null}
            <span className="font-[family:var(--font-kanit)] font-black text-sm uppercase tracking-[0.2em] text-[#e8e2d4]">
              {storeName}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href={urls.shop}
              className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.18em] text-[#e8e2d4]/60 hover:text-[#e8e2d4] transition-colors duration-300"
            >
              ทั้งหมด
            </a>
            {categories.slice(0, 5).map((c) => (
              <a
                key={c}
                href={`${urls.shop}?cat=${encodeURIComponent(c)}`}
                className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.18em] text-[#e8e2d4]/60 hover:text-[#e8e2d4] transition-colors duration-300"
              >
                {c}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            <a
              href={urls.cart}
              className="text-[#e8e2d4]/70 hover:text-[#e8e2d4] transition-colors duration-300"
              aria-label="ตะกร้า"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[#e8e2d4]/70 hover:text-[#e8e2d4] transition-colors"
              aria-label="เมนู"
            >
              {mobileOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#1c1c1c]">
          <nav className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
            <a
              href={urls.shop}
              className="font-[family:var(--font-kanit)] text-xs font-black uppercase tracking-[0.2em] text-[#e8e2d4] border-b border-[#1c1c1c] pb-3"
            >
              ทั้งหมด
            </a>
            {categories.slice(0, 5).map((c) => (
              <a
                key={c}
                href={`${urls.shop}?cat=${encodeURIComponent(c)}`}
                className="font-[family:var(--font-kanit)] text-xs font-black uppercase tracking-[0.2em] text-[#e8e2d4]/70 hover:text-[#e8e2d4] border-b border-[#1c1c1c] pb-3 transition-colors"
              >
                {c}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
