'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, Gift } from 'lucide-react';

interface HeaderProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  categories: { id: string; name: string }[];
  cartItemCount: number;
}

export function PetitCoteHeader({ store, categories, cartItemCount }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#fafafa]/90 backdrop-blur-md border-b border-[#f4f4f5] font-[family:var(--font-kanit)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <button
              type="button"
              className="sm:hidden p-2 text-[#525252]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href={`/stores/${store.slug}`} className="flex items-center ml-2 sm:ml-0">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto" />
              ) : (
                <span className="text-2xl font-light text-[#27272a] tracking-wider">{store.name}</span>
              )}
            </Link>
          </div>

          <nav className="hidden sm:flex space-x-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/stores/${store.slug}/category/${category.id}`}
                className="text-sm text-[#525252] hover:text-[#fbcfe8] transition-colors uppercase tracking-widest"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href={`/stores/${store.slug}/registry`}
              className="text-sm text-[#fbcfe8] font-medium flex items-center gap-1 hover:text-[#525252] transition-colors uppercase tracking-widest"
            >
              <Gift className="h-4 w-4" />
              Registry
            </Link>
          </nav>

          <div className="flex items-center">
            <Link
              href={`/stores/${store.slug}/cart`}
              className="p-2 text-[#525252] hover:text-[#fbcfe8] transition-colors relative flex items-center"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#fbcfe8] text-[#525252] text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#fafafa]">
          <div className="p-4 flex justify-between items-center border-b border-[#f4f4f5]">
            <span className="text-xl font-light text-[#27272a] tracking-wider">{store.name}</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#525252]">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4 flex flex-col space-y-6 mt-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/stores/${store.slug}/category/${category.id}`}
                className="text-lg text-[#525252] tracking-widest uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link
              href={`/stores/${store.slug}/registry`}
              className="text-lg text-[#fbcfe8] flex items-center gap-2 font-medium tracking-widest uppercase"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Gift className="h-5 w-5" />
              Registry
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
