'use client';
import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
  accent?: string;
}

export function Header({ storeSlug, storeName, storeLogoUrl, categories }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const cartCount = useCart((s) => s.countForStore(storeSlug));

  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
    about: `/stores/${storeSlug}/about`,
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFBEB]/90 backdrop-blur-md border-b border-[#EDE9FE]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-[68px] lg:h-[76px]">

          {/* Logo + wordmark */}
          <a href={urls.home} className="flex items-center gap-2.5 group">
            <span className="relative inline-grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#A78BFA] to-[#F472B6] shadow-[0_6px_16px_-6px_rgba(124,58,237,0.5)]">
              <span className="font-bold text-white text-sm leading-none">P</span>
              <span className="absolute inset-0.5 rounded-[10px] bg-gradient-to-br from-transparent to-white/20 pointer-events-none" />
            </span>
            {storeLogoUrl ? (
              <img src={storeLogoUrl} alt={storeName} className="h-6 w-auto object-contain" />
            ) : (
              <span className="font-extrabold text-[1.0625rem] tracking-tight text-[#1E1B4B]">
                <span className="text-[#6D28D9]">Persona</span>
                <span className="text-[#EC4899]">Path</span>
              </span>
            )}
          </a>

          {/* Desktop nav — pill shaped */}
          <nav className="hidden lg:flex items-center gap-1">
            {categories.slice(0, 5).map((cat) => (
              <a
                key={cat}
                href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                className="px-4 py-2 rounded-full text-[13.5px] font-semibold text-[#3F3D5C] hover:bg-[#F5F3FF] hover:text-[#6D28D9] transition-all"
              >
                {cat}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="hidden sm:grid place-items-center w-10 h-10 rounded-full text-[#3F3D5C] hover:bg-[#F5F3FF] hover:text-[#6D28D9] transition-all"
            >
              <Search size={18} strokeWidth={2} />
            </button>
            <a
              href={urls.cart}
              aria-label="Cart"
              className="relative grid place-items-center w-10 h-10 rounded-full text-[#3F3D5C] hover:bg-[#F5F3FF] hover:text-[#6D28D9] transition-all"
            >
              <ShoppingBag size={18} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid place-items-center w-[18px] h-[18px] rounded-full bg-[#EC4899] text-white text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </a>
            <a
              href={urls.about}
              className="hidden lg:inline-flex items-center px-5 py-2.5 rounded-full bg-[#7C3AED] text-white text-[13.5px] font-bold hover:bg-[#6D28D9] hover:-translate-y-0.5 transition-all shadow-[0_8px_20px_-8px_rgba(124,58,237,0.5)]"
            >
              เริ่มสำรวจ
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden grid place-items-center w-10 h-10 rounded-full text-[#1E1B4B] hover:bg-[#F5F3FF]"
              aria-label="Menu"
            >
              {open ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-down */}
      {open && (
        <div className="lg:hidden border-t border-[#EDE9FE] bg-[#FFFBEB] px-5 py-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {categories.slice(0, 6).map((cat) => (
            <a
              key={cat}
              href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
              className="block px-4 py-3 rounded-xl text-[14px] font-semibold text-[#3F3D5C] hover:bg-[#F5F3FF] hover:text-[#6D28D9]"
            >
              {cat}
            </a>
          ))}
          <a
            href={urls.about}
            className="block mt-3 px-4 py-3 rounded-xl bg-[#7C3AED] text-white text-[14px] font-bold text-center"
          >
            เริ่มสำรวจ
          </a>
        </div>
      )}
    </header>
  );
}
