'use client';
import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface HeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

export function ReclaimLeatherHeader({ store }: HeaderProps) {
  const cartItems = useCart((s) => s.items);
  const cartCount = cartItems.length;

  return (
    <header className="sticky top-0 z-50 bg-[#f4ead8]/90 backdrop-blur-md border-b-2 border-[#5b3a1e] border-dashed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-[#2a1a09] hover:bg-[#e6d7b8] rounded-full transition-colors">
              <Menu size={24} />
            </button>
            <nav className="hidden md:flex gap-8 font-[family:var(--font-kanit)] text-[#5b3a1e] font-medium tracking-wide">
              <Link href={`/${store.slug}/category/bags`} className="hover:text-[#c9974b] transition-colors relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-[#c9974b] after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-bottom-left">
                กระเป๋าสะพาย
              </Link>
              <Link href={`/${store.slug}/category/wallets`} className="hover:text-[#c9974b] transition-colors relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-[#c9974b] after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-bottom-left">
                วอลเล็ต
              </Link>
              <Link href={`/${store.slug}/about`} className="hover:text-[#c9974b] transition-colors relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-[#c9974b] after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-bottom-left">
                เรื่องราวของเรา
              </Link>
            </nav>
          </div>

          <Link href={`/${store.slug}`} className="absolute left-1/2 -translate-x-1/2 text-center group">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-12 w-auto object-contain" />
            ) : (
              <div className="font-[family:var(--font-prompt)] font-bold text-3xl text-[#5b3a1e] tracking-tight group-hover:scale-105 transition-transform">
                {store.name}
              </div>
            )}
            <div className="text-[10px] text-[#2a1a09] font-[family:var(--font-kanit)] mt-1 uppercase tracking-[0.2em] opacity-70">
              Handcrafted in BKK
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 text-[#2a1a09] hover:bg-[#e6d7b8] rounded-full transition-colors hidden sm:block">
              <Search size={22} />
            </button>
            <button className="p-2 text-[#2a1a09] hover:bg-[#e6d7b8] rounded-full transition-colors relative">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#c9974b] text-[#f4ead8] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#f4ead8]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
