'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export function WavelengthAudioHeader({ store }: { store: any }) {
  const cartCount = useCart((s) =>
    s.lines.filter((l) => l.storeSlug === store.slug).reduce((n, l) => n + l.qty, 0),
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fafafa]/90 backdrop-blur-md border-b border-[#0a0a0a]/10 text-[#0a0a0a]">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between">
        <Link href={`/stores/${store.slug}`} className="flex items-center gap-4">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
          ) : (
            <div className="h-10 w-10 bg-[#dc2626] rounded-sm" />
          )}
          <span className="font-[family:var(--font-prompt)] text-2xl tracking-[0.16em] uppercase font-bold">
            {store.name}
          </span>
        </Link>
        <div className="flex items-center gap-6 md:gap-10">
          <nav className="hidden md:flex gap-10 font-[family:var(--font-kanit)] text-sm tracking-widest uppercase font-medium">
            <Link href={`/stores/${store.slug}`} className="hover:text-[#dc2626] transition-colors">
              ภาพรวม
            </Link>
            <Link href={`/stores/${store.slug}/category`} className="hover:text-[#dc2626] transition-colors">
              สินค้าทั้งหมด
            </Link>
            <Link href={`/stores/${store.slug}#specs`} className="hover:text-[#dc2626] transition-colors">
              ข้อมูลทางเทคนิค
            </Link>
          </nav>
          <Link
            href={`/stores/${store.slug}/cart`}
            aria-label="ตะกร้าสินค้า"
            className="relative p-2 hover:text-[#dc2626] transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#dc2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
