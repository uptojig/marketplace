'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, Search } from 'lucide-react';

export function LinenAndLoomHeader({ store }: { store: any }) {
  return (
    <header className="bg-[#f8fafc] border-b border-[#e2e8f0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#475569] hover:bg-[#f1f5f9] rounded-md md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <nav className="hidden md:flex gap-8 font-[family:var(--font-prompt)] text-[#475569] text-sm">
              <Link href={`/stores/${store.slug}`} className="hover:text-[#0f172a] transition-colors">
                หน้าแรก
              </Link>
              <Link href={`/stores/${store.slug}/products`} className="hover:text-[#0f172a] transition-colors">
                สินค้าทั้งหมด
              </Link>
              <Link href={`/stores/${store.slug}/about`} className="hover:text-[#0f172a] transition-colors">
                เกี่ยวกับเรา
              </Link>
            </nav>
          </div>
          
          <div className="flex-1 md:flex-none flex justify-center">
            <Link href={`/stores/${store.slug}`} className="flex items-center gap-2">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-8 object-contain" />
              ) : (
                <span className="text-2xl font-light text-[#0f172a] font-[family:var(--font-kanit)] tracking-widest uppercase">
                  {store.name}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-4 text-[#475569]">
            <button className="p-2 hover:bg-[#f1f5f9] rounded-full transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-[#f1f5f9] rounded-full transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#94a3b8] rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
