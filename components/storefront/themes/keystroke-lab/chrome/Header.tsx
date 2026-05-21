'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export function KeystrokeLabHeader({ store, categories }: any) {
  const cartItems = useCart((s) => s.lines);
  const itemCount = cartItems.length;

  return (
    <header className="sticky top-0 z-50 bg-[#020617] border-b border-[#1e293b] text-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[#22d3ee] hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <Link href={`/stores/${store.slug}`} className="flex items-center gap-2 group">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-8 w-8 object-contain rounded-md" />
              ) : (
                <div className="w-8 h-8 bg-[#0f172a] rounded-md border border-[#22d3ee]/30 flex items-center justify-center text-[#22d3ee] font-bold">
                  {store.name.charAt(0)}
                </div>
              )}
              <span className="font-[family:var(--font-prompt)] font-bold text-xl tracking-[0.12em] text-white group-hover:text-[#22d3ee] transition-colors uppercase">
                {store.name}
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href={`/stores/${store.slug}/products`} className="font-[family:var(--font-kanit)] text-sm text-[#e2e8f0] hover:text-[#22d3ee] transition-colors tracking-[0.1em]">
              สินค้าทั้งหมด
            </Link>
            {categories.slice(0, 3).map((category: any) => (
              <Link 
                key={category.id} 
                href={`/stores/${store.slug}/categories/${category.slug}`} 
                className="font-[family:var(--font-kanit)] text-sm text-[#e2e8f0] hover:text-[#22d3ee] transition-colors tracking-[0.1em]"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-[#e2e8f0] hover:text-[#22d3ee] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href={`/stores/${store.slug}/cart`} className="relative text-[#e2e8f0] hover:text-[#22d3ee] transition-colors group">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#22d3ee] text-[#020617] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-[family:var(--font-prompt)] group-hover:bg-white transition-colors tabular-nums">
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
