'use client';
import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { ShoppingCart, FlaskConical, Search, Menu } from 'lucide-react';
import type { HeaderProps } from '@/lib/templates/types';

export function CalderaSkinHeader({ store }: HeaderProps) {
  const cartItems = useCart((s) => s.items);
  const storeItems = cartItems.filter((i) => i.storeSlug === store.slug);
  const itemCount = storeItems.length;

  return (
    <header className="sticky top-0 z-50 bg-[#f4f8f9]/90 backdrop-blur-md border-b border-[#cdd9dc] text-[#0b3d4a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button className="sm:hidden p-2 -ml-2 text-[#0b3d4a] hover:bg-[#cdd9dc]/30 rounded-md">
              <Menu className="w-5 h-5" />
            </button>
            <Link href={`/${store.slug}`} className="flex items-center gap-2 group">
              <FlaskConical className="w-6 h-6 text-[#5cbac7] group-hover:text-[#0b3d4a] transition-colors" />
              <span className="font-[family:var(--font-kanit)] font-medium text-xl tracking-tight uppercase">
                {store.name}
              </span>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-8 font-[family:var(--font-prompt)] uppercase tracking-[0.12em] text-xs">
            <Link href={`/${store.slug}/products`} className="hover:text-[#5cbac7] transition-colors">
              FORMULATIONS
            </Link>
            <Link href={`/${store.slug}/about`} className="hover:text-[#5cbac7] transition-colors">
              CLINICAL DATA
            </Link>
            <Link href={`/${store.slug}/contact`} className="hover:text-[#5cbac7] transition-colors">
              RESEARCH LAB
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 text-[#0b3d4a] hover:bg-[#cdd9dc]/30 rounded-md hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            <Link 
              href={`/${store.slug}/cart`} 
              className="flex items-center gap-2 p-2 hover:bg-[#cdd9dc]/30 rounded-md transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0b3d4a] text-[9px] font-[family:var(--font-prompt)] text-[#f4f8f9]">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
