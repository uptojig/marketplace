'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface SalukiHeaderProps {
  storeSlug: string;
  storeName: string;
  logoUrl?: string | null;
}

export function SalukiHeader({ storeSlug, storeName, logoUrl }: SalukiHeaderProps) {
  const cartItems = useCart((s) => s.lines);
  const storeItems = cartItems.filter(item => item.storeSlug === storeSlug);
  const itemCount = storeItems.reduce((total, item) => total + item.qty, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#ecfdf5]/90 backdrop-blur-md border-b border-[#a7f3d0] font-[family:var(--font-prompt)]">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-[#064e3b] hover:text-[#0f766e] transition-colors p-2">
            <Menu className="w-6 h-6" />
          </button>
          <nav className="hidden lg:flex items-center gap-8 text-[#0f766e] font-medium text-sm">
            <Link href={`/stores/${storeSlug}`} className="hover:text-[#064e3b] transition-colors">
              หน้าแรก
            </Link>
            <Link href={`/stores/${storeSlug}?category=leggings`} className="hover:text-[#064e3b] transition-colors">
              เลกกิ้ง
            </Link>
            <Link href={`/stores/${storeSlug}?category=tops`} className="hover:text-[#064e3b] transition-colors">
              เสื้อครอป
            </Link>
            <Link href={`/stores/${storeSlug}?category=accessories`} className="hover:text-[#064e3b] transition-colors">
              อุปกรณ์โยคะ
            </Link>
          </nav>
        </div>

        <Link href={`/stores/${storeSlug}`} className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-10 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-semibold tracking-wider text-[#0f766e]">
              {storeName}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="text-[#064e3b] hover:text-[#0f766e] transition-colors p-2">
            <Search className="w-5 h-5" />
          </button>
          <div className="relative">
            <button className="text-[#064e3b] hover:text-[#0f766e] transition-colors p-2 flex items-center">
              <ShoppingBag className="w-5 h-5" />
            </button>
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-[#064e3b] bg-[#a7f3d0] rounded-full transform translate-x-1/4 -translate-y-1/4 border-2 border-[#ecfdf5]">
                {itemCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
