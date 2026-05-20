'use client';
import React from 'react';
import { Search, ShoppingBag } from 'lucide-react';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
}

export function Header({ storeSlug, storeName, storeLogoUrl, categories }: HeaderProps) {
  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
  };

  return (
    <header className="bg-white border-b-4 border-black font-sans sticky top-0 z-50">
      
      {/* Top Announcement Bar - Pure Black */}
      <div className="bg-black text-white text-[10px] font-bold py-1.5 px-4 text-center tracking-widest uppercase font-[family:var(--font-google-sans)]">
        BLOCK PRESS · BRUTALIST PRINTING STUDIO · SHIPPED IN THICK CARDBOARD TUBES
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Brand - Thick Border Container */}
          <div className="flex items-center">
            <a href={urls.home} className="flex items-center gap-3">
              <div className="border-4 border-black bg-black text-white font-extrabold text-2xl px-3 py-1.5 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-tighter">
                B
              </div>
              <span className="font-[family:var(--font-google-sans)] font-black text-2xl tracking-tighter text-black uppercase">
                {storeName}
              </span>
            </a>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {categories.slice(0, 4).map((c) => (
              <a
                key={c}
                href={`${urls.shop}?cat=${encodeURIComponent(c)}`}
                className="text-xs uppercase font-extrabold font-[family:var(--font-google-sans)] tracking-widest text-black hover:bg-black hover:text-white px-2 py-1 border-2 border-transparent hover:border-black transition-all"
              >
                {c}
              </a>
            ))}
          </nav>

          {/* Cart with Brutalist Offset Shadow */}
          <div className="flex items-center gap-4">
            <a
              href={urls.cart}
              className="flex items-center gap-2 px-4 py-2 border-4 border-black bg-white hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000]"
            >
              <ShoppingBag size={16} />
              <span>BAG</span>
            </a>
          </div>

        </div>
      </div>

    </header>
  );
}
