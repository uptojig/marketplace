'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MaiHatthakamHeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  categories: Category[];
}

export function MaiHatthakamHeader({ store, categories }: MaiHatthakamHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const items = useCart((s) => s.items);
  const cartItemCount = items.filter((i) => i.storeSlug === store.slug).reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-[#fef9f1]/95 backdrop-blur-md border-b border-[#fde8c8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left: Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="p-2 -ml-2 text-[#7c2d12] hover:text-[#d97706] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">เปิดเมนู</span>
              {isMobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>

          {/* Left: Desktop Navigation */}
          <nav className="hidden sm:flex space-x-8 items-center">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/${store.slug}/c/${category.slug}`}
                className="text-[#3a1a07] hover:text-[#7c2d12] text-sm font-medium font-[family:var(--font-kanit)] transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href={`/${store.slug}/about`}
              className="text-[#3a1a07] hover:text-[#7c2d12] text-sm font-medium font-[family:var(--font-kanit)] transition-colors"
            >
              เกี่ยวกับเตาเผา
            </Link>
          </nav>

          {/* Center: Logo */}
          <div className="flex-shrink-0 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <Link href={`/${store.slug}`} className="flex flex-col items-center group">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <div className="text-center">
                  <span className="text-2xl font-bold text-[#7c2d12] tracking-wider font-[family:var(--font-prompt)] uppercase">
                    {store.name}
                  </span>
                  <span className="block text-[10px] text-[#3a1a07]/60 tracking-widest mt-1 font-[family:var(--font-kanit)]">
                    EST. 2024
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-[#3a1a07] hover:text-[#7c2d12] transition-colors hidden sm:block">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/cart" className="p-2 text-[#3a1a07] hover:text-[#7c2d12] transition-colors relative flex items-center">
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-[#fef9f1] transform translate-x-1/4 -translate-y-1/4 bg-[#7c2d12] rounded-full font-[family:var(--font-kanit)]">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-20 left-0 w-full bg-[#fef9f1] border-b border-[#fde8c8] shadow-lg">
          <div className="pt-2 pb-4 space-y-1 px-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${store.slug}/c/${category.slug}`}
                className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-[#3a1a07] hover:bg-[#fde8c8]/30 hover:border-[#7c2d12] hover:text-[#7c2d12] text-base font-medium font-[family:var(--font-kanit)] transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link
              href={`/${store.slug}/about`}
              className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-[#3a1a07] hover:bg-[#fde8c8]/30 hover:border-[#7c2d12] hover:text-[#7c2d12] text-base font-medium font-[family:var(--font-kanit)] transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              เกี่ยวกับเตาเผา
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
