'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, Search, Brush } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface PigmentStudioHeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  categories: { id: string; name: string; slug: string }[];
}

export function PigmentStudioHeader({ store, categories }: PigmentStudioHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItems = useCart((s) => s.lines);
  const storeItems = cartItems.filter((item) => item.storeSlug === store.slug);
  const cartCount = storeItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="bg-[#fff7ed] border-b-2 border-[#fed7aa] sticky top-0 z-50 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-[#7c2d12] hover:bg-[#fed7aa] md:hidden transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="hidden md:flex space-x-8 ml-8">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/stores/${store.slug}/category/${category.slug}`}
                  className="font-[family:var(--font-prompt)] text-[#7c2d12] hover:text-[#f97316] font-medium transition-colors relative group"
                >
                  {category.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-1 bg-[#facc15] rounded-full transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <Link href={`/stores/${store.slug}`} className="flex items-center gap-2 group">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-12 w-auto object-contain transform group-hover:rotate-6 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Brush className="w-8 h-8 text-[#f97316] group-hover:-rotate-12 transition-transform duration-300" />
                  <span className="font-[family:var(--font-kanit)] font-bold text-2xl tracking-tight text-[#7c2d12]">
                    {store.name}
                  </span>
                </div>
              )}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-[#7c2d12] hover:bg-[#fed7aa] hover:text-[#f97316] rounded-xl transition-colors hidden sm:block">
              <Search className="w-6 h-6" />
            </button>
            <Link
              href={`/stores/${store.slug}/cart`}
              className="p-2 text-[#7c2d12] hover:bg-[#fed7aa] hover:text-[#f97316] rounded-xl transition-colors relative group"
            >
              <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#f97316] rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#fff7ed] border-t-2 border-[#fed7aa] absolute w-full left-0 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/stores/${store.slug}/category/${category.slug}`}
                className="block px-4 py-3 font-[family:var(--font-prompt)] text-[#7c2d12] font-medium hover:bg-[#fed7aa] hover:text-[#f97316] rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
