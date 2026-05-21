'use client';
import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, Lightbulb } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface HeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

export function GlowLampCoHeader({ store }: HeaderProps) {
  const items = useCart((s) => s.lines);
  const cartCount = items.filter(i => i.storeSlug === store.slug).length;

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a] text-[#f8fafc] border-b border-[#0f172a]/20 shadow-sm font-[family:var(--font-kanit)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
        {/* Subtle ambient light from top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-[#f59e0b] blur-xl opacity-50 pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <button className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors">
            <Menu className="w-5 h-5 text-[#f8fafc]" />
          </button>
          <Link href={`/${store.slug}`} className="flex items-center gap-3 group">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto rounded" />
            ) : (
              <div className="w-10 h-10 bg-[#f59e0b] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.8)] transition-all">
                <Lightbulb className="w-6 h-6 text-[#0f172a]" />
              </div>
            )}
            <span className="text-xl font-bold tracking-wider hidden sm:block text-[#f8fafc]">{store.name}</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-8 items-center font-medium relative z-10">
          <Link href={`/${store.slug}/category/desk-lamps`} className="text-[#e2e8f0] hover:text-[#f59e0b] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#f59e0b] hover:after:w-full after:transition-all">โคมตั้งโต๊ะ</Link>
          <Link href={`/${store.slug}/category/ceiling-lamps`} className="text-[#e2e8f0] hover:text-[#f59e0b] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#f59e0b] hover:after:w-full after:transition-all">โคมเพดาน</Link>
          <Link href={`/${store.slug}/category/bulbs`} className="text-[#e2e8f0] hover:text-[#f59e0b] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#f59e0b] hover:after:w-full after:transition-all">หลอดไฟ</Link>
        </nav>

        <div className="flex items-center gap-4 text-[#f8fafc] relative z-10">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-[#f59e0b] text-[#0f172a] text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
