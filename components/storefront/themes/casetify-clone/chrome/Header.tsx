'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
  accent?: string;
}

/**
 * Casetify Clone — white header with center logo, red dot accent.
 *
 * Three-column layout: mobile-burger / search (lg only) on the left,
 * brand center, account + cart on the right. A second nav row sits
 * under the brand on desktop with the category strip — uppercase
 * tracking-wider and a red highlight on the first chip.
 */
export function Header({
  storeSlug,
  storeName,
  storeLogoUrl,
  categories,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCart((s) => s.countForStore(storeSlug));

  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 font-[family:var(--font-prompt)] text-gray-900">
      {/* Main header */}
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Left — mobile burger / desktop search */}
          <div className="flex items-center flex-1">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link
              href={urls.shop}
              className="hidden lg:flex items-center text-gray-800 hover:text-black"
            >
              <Search size={20} className="mr-2" />
              <span className="text-sm font-medium uppercase tracking-wide">ค้นหา</span>
            </Link>
          </div>

          {/* Center — brand (signature CASETiFY red dot) */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <Link href={urls.home} className="flex items-center">
              {storeLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={storeLogoUrl}
                  alt={storeName}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="font-[family:var(--font-kanit)] font-black text-2xl tracking-tighter uppercase">
                  {storeName}
                  <span
                    className="ml-0.5 text-3xl leading-none"
                    style={{ color: 'var(--shop-primary, #EA1C5C)' }}
                  >
                    .
                  </span>
                </span>
              )}
            </Link>
          </div>

          {/* Right — account + cart */}
          <div className="flex items-center justify-end flex-1 space-x-4 lg:space-x-6">
            <Link
              href={`/stores/${storeSlug}/about`}
              aria-label="Account"
              className="hidden lg:block text-gray-800 hover:text-black"
            >
              <User size={20} />
            </Link>
            <Link
              href={urls.cart}
              aria-label="ตะกร้าสินค้า"
              className="text-gray-800 hover:text-black relative"
            >
              <ShoppingBag size={20} />
              <span
                className="absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center"
                style={{ background: 'var(--shop-primary, #EA1C5C)' }}
              >
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop categories rail */}
      {categories.length > 0 && (
        <nav className="hidden lg:flex justify-center border-t border-gray-100 bg-white py-3">
          <ul className="flex space-x-8 text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
            {categories.slice(0, 6).map((cat, idx) => (
              <li key={cat}>
                <Link
                  href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                  className="hover:text-black transition-colors"
                  style={idx === 2 ? { color: 'var(--shop-primary, #EA1C5C)' } : undefined}
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200">
          <ul className="py-4 px-6 space-y-4 text-sm font-semibold text-gray-800 uppercase tracking-widest">
            {categories.slice(0, 8).map((cat, idx) => (
              <li key={cat} className="py-2 border-b border-gray-100">
                <Link
                  href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                  onClick={() => setMobileOpen(false)}
                  style={idx === 2 ? { color: 'var(--shop-primary, #EA1C5C)' } : undefined}
                >
                  {cat}
                </Link>
              </li>
            ))}
            <li className="py-2 mt-4">
              <Link
                href={urls.shop}
                onClick={() => setMobileOpen(false)}
                className="flex items-center text-gray-600"
              >
                <Search size={18} className="mr-3" /> ค้นหา
              </Link>
            </li>
            <li className="py-2">
              <Link
                href={`/stores/${storeSlug}/about`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center text-gray-600"
              >
                <User size={18} className="mr-3" /> เกี่ยวกับ
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export default Header;
