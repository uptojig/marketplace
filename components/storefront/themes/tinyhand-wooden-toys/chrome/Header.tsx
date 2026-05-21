'use client';
import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export function TinyhandHeader({ storeName, storeSlug }: { storeName: string; storeSlug: string }) {
  const items = useCart((s) => s.lines);
  const itemCount = items.reduce((total, item) => total + (item.qty || 1), 0);

  return (
    <header className="bg-[#f7f1e3] border-b border-[#ebe1c8] sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-[#3a2e22]">
              <Menu className="w-6 h-6" />
            </button>
            <Link 
              href={`/stores/${storeSlug}`} 
              className="text-[#3a2e22] text-xl font-bold font-[family:var(--font-kanit)] tracking-wide"
            >
              {storeName}
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8 font-[family:var(--font-prompt)] text-[#3a2e22] font-medium text-sm">
            <Link href={`/stores/${storeSlug}`} className="hover:text-[#c9974b] transition-colors">หน้าแรก</Link>
            <Link href={`/stores/${storeSlug}/products`} className="hover:text-[#c9974b] transition-colors">ของเล่นทั้งหมด</Link>
            <Link href={`/stores/${storeSlug}/about`} className="hover:text-[#c9974b] transition-colors">เรื่องราวของเรา</Link>
          </nav>

          <div className="flex items-center">
            <Link href={`/stores/${storeSlug}/cart`} className="relative p-2 text-[#3a2e22] hover:text-[#c9974b] transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c9974b] text-[#f7f1e3] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-[family:var(--font-kanit)]">
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
