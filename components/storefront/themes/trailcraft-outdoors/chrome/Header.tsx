'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, Search, User } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

/**
 * Local prop shape — uses a nested `store` object + category objects
 * with `{ id, slug, name }`, not the flat scaffold `HeaderProps` shape.
 * The adapter in `adapters.tsx` re-packs the scaffold props into this.
 */
interface TrailcraftHeaderProps {
  store: { name: string; slug: string; logoUrl?: string | null };
  categories: { id: string; name: string; slug: string }[];
}

export function TrailcraftHeader({ store, categories }: TrailcraftHeaderProps) {
  const cartItems = useCart((s) => s.lines);
  const storeCartItems = cartItems.filter((i) => i.storeSlug === store.slug);
  const cartCount = storeCartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header className="bg-[#fdfbe8] border-b border-[#84cc16] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button className="text-[#1a2e05] hover:text-[#365314]">
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={`/stores/${store.slug}`} className="flex items-center gap-3">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <div className="h-10 w-10 bg-[#365314] text-[#facc15] flex items-center justify-center rounded-md font-[family:var(--font-kanit)] font-bold text-xl shadow-sm">
                  T
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-[family:var(--font-kanit)] font-bold text-2xl text-[#1a2e05] uppercase tracking-wider">
                  {store.name}
                </span>
                <span className="font-[family:var(--font-prompt)] text-xs text-[#365314] uppercase font-medium tracking-widest hidden sm:block">
                  Outdoors
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {categories.slice(0, 4).map((category, index) => (
              <Link
                key={`${category.id}-${category.slug}-${index}`}
                href={`/stores/${store.slug}/category/${category.slug}`}
                className="font-[family:var(--font-prompt)] text-[#1a2e05] hover:text-[#365314] hover:underline decoration-[#facc15] decoration-4 underline-offset-4 font-semibold transition-all"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-5">
            <button className="text-[#1a2e05] hover:text-[#365314] transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="text-[#1a2e05] hover:text-[#365314] transition-colors hidden sm:block">
              <User className="h-5 w-5" />
            </button>
            <Link href={`/stores/${store.slug}/cart`} className="text-[#1a2e05] hover:text-[#365314] relative group">
              <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#facc15] text-[#1a2e05] text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm">
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
