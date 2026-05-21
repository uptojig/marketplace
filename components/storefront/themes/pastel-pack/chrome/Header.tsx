'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface PastelPackHeaderProps {
  storeName: string;
  storeSlug: string;
  logoUrl?: string | null;
  categories: { id: string; name: string; slug: string }[];
}

export function PastelPackHeader({ storeName, storeSlug, logoUrl, categories }: PastelPackHeaderProps) {
  const cartItems = useCart((s) => s.lines);
  const cartCount = cartItems.length;

  return (
    <header className="sticky top-0 z-50 bg-[#f0fdfa] border-b border-[#ccfbf1] text-[#0f4a44] shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 lg:hidden">
          <button className="p-2 text-[#0f766e] hover:bg-[#ccfbf1] rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex justify-center lg:justify-start">
          <Link href={`/stores/${storeSlug}`} className="flex items-center gap-2 group">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-10 w-auto rounded group-hover:opacity-90 transition-opacity" />
            ) : (
              <div className="w-10 h-10 bg-[#0f766e] text-[#fde68a] flex items-center justify-center rounded-lg font-black font-[family:var(--font-kanit)] text-xl group-hover:scale-105 transition-transform">
                {storeName.charAt(0)}
              </div>
            )}
            <span className="font-bold text-2xl tracking-tight font-[family:var(--font-prompt)] hidden lg:inline-block text-[#0f4a44] group-hover:text-[#0f766e] transition-colors">
              {storeName}
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-8 font-[family:var(--font-prompt)]">
          {categories.slice(0, 5).map((category) => (
            <Link 
              key={category.id} 
              href={`/stores/${storeSlug}/category/${category.slug}`}
              className="text-[#0f766e] hover:text-[#0f4a44] transition-colors uppercase text-sm font-bold tracking-wider relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#0f4a44] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-right hover:after:origin-left"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 lg:gap-6 justify-end flex-1 lg:flex-none">
          <Search className="w-5 h-5 hidden lg:block cursor-pointer text-[#0f766e] hover:text-[#0f4a44] transition-colors" />
          <User className="w-5 h-5 hidden lg:block cursor-pointer text-[#0f766e] hover:text-[#0f4a44] transition-colors" />
          <Link href={`/stores/${storeSlug}/cart`} className="relative group p-2 flex items-center gap-2 bg-[#ccfbf1] hover:bg-[#0f766e] hover:text-[#fde68a] text-[#0f766e] rounded-full transition-all px-4 py-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold font-[family:var(--font-kanit)] hidden sm:block">ตะกร้า</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#fde68a] text-[#0f766e] text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm border-2 border-[#f0fdfa]">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
