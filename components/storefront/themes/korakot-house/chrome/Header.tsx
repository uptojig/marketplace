'use client';
import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, Search, User } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface HeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
}

export function KorakotHouseHeader({ store }: HeaderProps) {
  const items = useCart((s) => s.items);
  const storeItems = items.filter((i) => i.storeSlug === store.slug);
  const itemCount = storeItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-[#f5ede0] border-b border-[#e8d5b7] sticky top-0 z-50 text-[#3a2818] font-[family:var(--font-prompt)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4 flex-1">
            <button className="p-2 -ml-2 text-[#7c4a1e] hover:bg-[#e8d5b7]/50 rounded-full transition-colors lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <nav className="hidden lg:flex gap-8 text-sm font-medium tracking-wide">
              <Link href="#" className="text-[#3a2818] hover:text-[#7c4a1e] transition-colors">คอลเลกชัน</Link>
              <Link href="#" className="text-[#3a2818] hover:text-[#7c4a1e] transition-colors">เรื่องราวของเรา</Link>
              <Link href="#" className="text-[#3a2818] hover:text-[#7c4a1e] transition-colors">การดูแลรักษา</Link>
            </nav>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center">
            <Link href={`/${store.slug}`} className="flex flex-col items-center">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto" />
              ) : (
                <span className="font-[family:var(--font-kanit)] text-2xl font-semibold tracking-wider text-[#7c4a1e] uppercase">
                  {store.name}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
            <button className="p-2 text-[#7c4a1e] hover:bg-[#e8d5b7]/50 rounded-full transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-[#7c4a1e] hover:bg-[#e8d5b7]/50 rounded-full transition-colors hidden sm:block">
              <User className="w-5 h-5" />
            </button>
            <Link 
              href={`/${store.slug}/cart`}
              className="p-2 text-[#7c4a1e] hover:bg-[#e8d5b7]/50 rounded-full transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d7a86e] text-[10px] font-bold text-[#3a2818]">
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
