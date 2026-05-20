'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ShoppingBag, Search } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface SirinHeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
}

export function SirinHeader({ store }: SirinHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItems = useCart((s) => s.items);
  
  const storeCartItems = cartItems.filter(item => item.storeSlug === store.slug);
  const cartCount = storeCartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fff5f7]/95 backdrop-blur-md border-b border-[#fce7f3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 -ml-2 text-[#3f0f24] md:hidden hover:text-[#be185d] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <nav className="hidden md:flex space-x-8">
              <Link href={`/${store.slug}`} className="text-sm font-[family:var(--font-prompt)] text-[#3f0f24] hover:text-[#be185d] transition-colors uppercase tracking-widest">
                คอลเลกชัน
              </Link>
              <Link href={`/${store.slug}`} className="text-sm font-[family:var(--font-prompt)] text-[#3f0f24] hover:text-[#be185d] transition-colors uppercase tracking-widest">
                ทั้งหมด
              </Link>
              <Link href={`/${store.slug}`} className="text-sm font-[family:var(--font-prompt)] text-[#3f0f24] hover:text-[#be185d] transition-colors uppercase tracking-widest">
                เกี่ยวกับเรา
              </Link>
            </nav>
          </div>

          <div className="flex-1 flex justify-center">
            <Link href={`/${store.slug}`} className="flex items-center space-x-2">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <span className="font-[family:var(--font-kanit)] font-extrabold text-2xl tracking-widest text-[#be185d] uppercase">
                  {store.name}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-[#3f0f24] hover:text-[#be185d] transition-colors hidden sm:block">
              <Search className="h-5 w-5" />
            </button>
            <Link href={`/cart`} className="p-2 text-[#3f0f24] hover:text-[#be185d] transition-colors relative flex items-center">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#be185d] rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#fff5f7] border-b border-[#fce7f3] py-4 px-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Link href={`/${store.slug}`} className="text-sm font-[family:var(--font-prompt)] text-[#3f0f24] uppercase tracking-widest pb-2 border-b border-[#fce7f3]">
              คอลเลกชัน
            </Link>
            <Link href={`/${store.slug}`} className="text-sm font-[family:var(--font-prompt)] text-[#3f0f24] uppercase tracking-widest pb-2 border-b border-[#fce7f3]">
              ทั้งหมด
            </Link>
            <Link href={`/${store.slug}`} className="text-sm font-[family:var(--font-prompt)] text-[#3f0f24] uppercase tracking-widest pb-2">
              เกี่ยวกับเรา
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
