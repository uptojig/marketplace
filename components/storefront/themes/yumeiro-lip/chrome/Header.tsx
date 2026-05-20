'use client';
import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface YumeiroLipHeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string;
  };
  categories: { id: string; name: string }[];
}

export function YumeiroLipHeader({ store, categories }: YumeiroLipHeaderProps) {
  const cartItems = useCart((s) => s.items);
  const itemCount = cartItems.length;

  return (
    <header className="sticky top-0 z-50 bg-[#fff0f5]/90 backdrop-blur-md border-b border-[#fbcfe8]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between font-[family:var(--font-prompt)]">
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-[#831843]">
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href={`/${store.slug}`} className="flex items-center gap-2">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-8 w-auto object-contain rounded-full" />
            ) : (
              <span className="text-2xl font-black text-[#ec4899] tracking-tight">{store.name}</span>
            )}
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          <Link href={`/${store.slug}`} className="text-[#831843] hover:text-[#ec4899] font-medium transition-colors">
            หน้าแรก
          </Link>
          {categories.slice(0, 4).map((cat) => (
            <Link key={cat.id} href={`/${store.slug}/category/${cat.id}`} className="text-[#831843] hover:text-[#ec4899] font-medium transition-colors">
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-[#831843]">
          <button className="hover:text-[#ec4899] transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link href={`/${store.slug}/cart`} className="hover:text-[#ec4899] transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ec4899] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
