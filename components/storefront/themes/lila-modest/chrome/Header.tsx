'use client';
import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-[#f5efe6]/95 backdrop-blur-md border-b border-[#e6dcc9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 text-[#5b4636] hover:text-[#c9974b] transition-colors"
            aria-label="เมนู"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo & Brand Name */}
          <a href={urls.home} className="flex items-center gap-3 group">
            {storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-9 w-auto object-contain rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#5b4636] flex items-center justify-center text-[#f5efe6] font-[family:var(--font-kanit)] font-bold text-base">
                ลี
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-[family:var(--font-kanit)] font-semibold text-lg sm:text-xl text-[#2a2118] leading-tight tracking-tight">
                {storeName}
              </span>
              <span className="hidden sm:block text-[10px] text-[#8b7355] font-[family:var(--font-prompt)] tracking-wider">
                modest wear · thai made
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-8">
            <a
              href={urls.home}
              className="text-sm font-[family:var(--font-prompt)] text-[#5b4636] hover:text-[#c9974b] transition-colors font-medium"
            >
              หน้าแรก
            </a>
            {categories.slice(0, 4).map((cat) => (
              <a
                key={cat}
                href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                className="text-sm font-[family:var(--font-prompt)] text-[#5b4636] hover:text-[#c9974b] transition-colors font-medium"
              >
                {cat}
              </a>
            ))}
            <a
              href={urls.about}
              className="text-sm font-[family:var(--font-prompt)] text-[#5b4636] hover:text-[#c9974b] transition-colors font-medium"
            >
              เรื่องของเรา
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              className="p-2 text-[#5b4636] hover:text-[#c9974b] transition-colors hidden sm:block"
              aria-label="ค้นหา"
            >
              <Search size={20} />
            </button>
            <a
              href={urls.cart}
              className="relative p-2 text-[#5b4636] hover:text-[#c9974b] transition-colors"
              aria-label="ตะกร้า"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#c9974b] text-[#f5efe6] text-[10px] font-[family:var(--font-prompt)] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div className="sm:hidden bg-[#f5efe6] border-t border-[#e6dcc9] px-4 py-4 space-y-1">
          <a
            href={urls.home}
            className="block py-2.5 text-sm font-[family:var(--font-prompt)] text-[#5b4636] font-medium"
          >
            หน้าแรก
          </a>
          {categories.slice(0, 5).map((cat) => (
            <a
              key={cat}
              href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
              className="block py-2.5 text-sm font-[family:var(--font-prompt)] text-[#5b4636] font-medium"
            >
              {cat}
            </a>
          ))}
          <a
            href={urls.about}
            className="block py-2.5 text-sm font-[family:var(--font-prompt)] text-[#5b4636] font-medium"
          >
            เรื่องของเรา
          </a>
          <div className="pt-2 border-t border-[#e6dcc9]">
            <a
              href={urls.cart}
              className="block py-2.5 text-sm font-[family:var(--font-prompt)] text-[#c9974b] font-semibold"
            >
              ตะกร้าสินค้า {cartCount > 0 && `(${cartCount})`}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
