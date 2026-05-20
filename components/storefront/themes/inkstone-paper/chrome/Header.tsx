'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, Search } from 'lucide-react';
import type { HeaderProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';

export function InkstonePaperHeader({ store }: HeaderProps) {
  const cartItems = useCart((s) => s.items);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#f7f1e3] border-b border-[#e6dcc4] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 text-[#3a2e22] hover:text-[#c9974b] transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <nav className="hidden md:flex gap-8">
              <Link href={`/${store.slug}`} className="text-[#3a2e22] hover:text-[#c9974b] font-[family:var(--font-prompt)] text-sm uppercase tracking-widest transition-colors">
                Shop
              </Link>
              <Link href={`/${store.slug}`} className="text-[#3a2e22] hover:text-[#c9974b] font-[family:var(--font-prompt)] text-sm uppercase tracking-widest transition-colors">
                Journal
              </Link>
              <Link href={`/${store.slug}`} className="text-[#3a2e22] hover:text-[#c9974b] font-[family:var(--font-prompt)] text-sm uppercase tracking-widest transition-colors">
                About
              </Link>
            </nav>
          </div>

          <div className="flex-1 flex justify-center">
            <Link href={`/${store.slug}`} className="flex flex-col items-center group">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <span className="text-2xl font-[family:var(--font-kanit)] font-light tracking-widest text-[#3a2e22] group-hover:text-[#c9974b] transition-colors">
                    {store.name}
                  </span>
                  <span className="text-[10px] font-[family:var(--font-prompt)] text-[#c9974b] uppercase tracking-[0.3em] mt-1 hidden sm:block">
                    เครื่องเขียนญี่ปุ่นและสมุดทำมือ
                  </span>
                </>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-[#3a2e22] hover:text-[#c9974b] transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            <Link href={`/${store.slug}/cart`} className="p-2 text-[#3a2e22] hover:text-[#c9974b] transition-colors relative flex items-center">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#f7f1e3] transform translate-x-1/4 -translate-y-1/4 bg-[#c9974b] rounded-full font-[family:var(--font-prompt)]">
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
