'use client';
import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

/**
 * Local prop shape — uses a nested `store` object + category objects
 * with `{ id, slug, name }`, not the flat scaffold `HeaderProps`. The
 * adapter in `adapters.tsx` re-packs the scaffold props into this shape.
 */
interface CarbonEraCamerasHeaderProps {
  store: { name: string; slug: string; logoUrl?: string | null };
  categories: { id: string; name: string; slug: string }[];
}

export function CarbonEraCamerasHeader({ store, categories }: CarbonEraCamerasHeaderProps) {
  const items = useCart((s) => s.lines);
  const storeItems = items.filter((i) => i.storeSlug === store.slug);
  const cartCount = storeItems.length;

  return (
    <header className="sticky top-0 z-50 bg-[#fafafa] border-b border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-6">
            <button className="sm:hidden text-[#0a0a0a]">
              <Menu className="w-6 h-6" />
            </button>
            <Link href={`/stores/${store.slug}`} className="flex items-center gap-3">
              {store.logoUrl && (
                <img src={store.logoUrl} alt={store.name} className="w-10 h-10 object-contain rounded-sm grayscale" />
              )}
              <span className="font-[family:var(--font-kanit)] text-2xl font-black text-[#0a0a0a] uppercase tracking-tighter">
                {store.name}
              </span>
            </Link>
            <nav className="hidden sm:flex gap-8 ml-8">
              {categories.slice(0, 4).map((cat, index) => (
                <Link
                  key={`${cat.id}-${cat.slug}-${index}`}
                  href={`/stores/${store.slug}/category/${cat.slug}`}
                  className="text-sm font-[family:var(--font-prompt)] font-medium text-[#0a0a0a]/70 hover:text-[#0a0a0a] transition-colors uppercase tracking-wider"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-[#0a0a0a]/70 hover:text-[#0a0a0a]">
              <Search className="w-5 h-5" />
            </button>
            <Link href={`/stores/${store.slug}/cart`} className="relative text-[#0a0a0a]">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#0a0a0a] text-[#fafafa] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full font-[family:var(--font-prompt)]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
