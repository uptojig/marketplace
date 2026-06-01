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
  const [open, setOpen] = useState(false);
  const cartCount = useCart((s) => s.countForStore(storeSlug));

  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
    about: `/stores/${storeSlug}/about`,
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-[68px] lg:h-[72px]">

          {/* Logo — SMS|UP+ split */}
          <a href={urls.home} className="flex items-center gap-2.5">
            <span className="relative inline-grid place-items-center w-9 h-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#F97316] text-white font-extrabold shadow-[0_4px_12px_-4px_rgba(37,99,235,0.4)]">
              S
              <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center w-[16px] h-[16px] rounded-full bg-[#F97316] text-white text-[10px] font-extrabold border-2 border-white">+</span>
            </span>
            {storeLogoUrl ? (
              <img src={storeLogoUrl} alt={storeName} className="h-6 w-auto object-contain" />
            ) : (
              <span className="font-extrabold text-[1.0625rem] tracking-tight">
                <span className="text-[#2563EB]">SMS</span>
                <span className="text-[#F97316]">UP</span>
                <span className="text-[#F97316] text-[1.15em] leading-none">+</span>
              </span>
            )}
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {categories.slice(0, 5).map((cat) => (
              <a
                key={cat}
                href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                className="px-4 py-2 rounded-full text-[13.5px] font-semibold text-[#475569] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] transition-all"
              >
                {cat}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href={urls.cart}
              aria-label="Cart"
              className="relative grid place-items-center w-10 h-10 rounded-full text-[#475569] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] transition-all"
            >
              <ShoppingBag size={18} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid place-items-center w-[18px] h-[18px] rounded-full bg-[#F97316] text-white text-[10px] font-extrabold">
                  {cartCount}
                </span>
              )}
            </a>
            <a
              href={urls.about}
              className="hidden lg:inline-flex items-center px-5 py-2.5 rounded-full bg-[#2563EB] text-white text-[13.5px] font-bold hover:bg-[#1D4ED8] hover:-translate-y-0.5 transition-all shadow-[0_8px_20px_-8px_rgba(37,99,235,0.5)]"
            >
              เริ่มฟรี
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden grid place-items-center w-10 h-10 rounded-full text-[#0F172A] hover:bg-[#EFF6FF]"
              aria-label="Menu"
            >
              {open ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-white px-5 py-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {categories.slice(0, 6).map((cat) => (
            <a
              key={cat}
              href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
              className="block px-4 py-3 rounded-xl text-[14px] font-semibold text-[#475569] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
            >
              {cat}
            </a>
          ))}
          <a href={urls.about} className="block mt-3 px-4 py-3 rounded-xl bg-[#2563EB] text-white text-[14px] font-bold text-center">
            เริ่มฟรี
          </a>
        </div>
      )}
    </header>
  );
}
