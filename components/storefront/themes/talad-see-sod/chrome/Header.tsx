'use client';
import React from 'react';
import { Search, ShoppingCart, ShieldAlert } from 'lucide-react';

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
    <header className="bg-white border-b border-[#fdba74] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Stamp Accent */}
          <div className="flex items-center gap-3">
            <a href={urls.home} className="flex items-center gap-2">
              {storeLogoUrl ? (
                <img src={storeLogoUrl} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                <div className="bg-[#dc2626] text-white font-[family:var(--font-kanit)] font-black text-xl px-3 py-1 rounded shadow-md border-2 border-yellow-300 transform -rotate-2">
                  ดี!
                </div>
              )}
              <span className="font-[family:var(--font-kanit)] font-black text-2xl tracking-tight text-[#dc2626] uppercase">
                {storeName}
              </span>
            </a>
            
            <div className="hidden lg:block bg-yellow-300 text-red-700 text-[10px] font-[family:var(--font-kanit)] font-extrabold uppercase border border-red-700 px-1.5 py-0.5 rounded shadow-sm rotate-3">
              ของแท้ 100%
            </div>
          </div>

          {/* Search bar - Taobao Style */}
          <form
            action={`/stores/${storeSlug}/search`}
            method="get"
            className="w-full md:max-w-xl flex items-center border-2 border-[#dc2626] rounded-none overflow-hidden"
          >
            <input
              type="text"
              name="q"
              placeholder={`ค้นหาสินค้าใน ${storeName}...`}
              className="flex-1 px-4 py-2 text-sm bg-orange-50/20 text-red-900 focus:outline-none placeholder-red-300"
            />
            <button
              type="submit"
              aria-label="ค้นหา"
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-6 py-2 flex items-center justify-center transition-colors"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Cart Icon & Single Vendor Label */}
          <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-orange-600 font-[family:var(--font-prompt)] font-semibold bg-orange-50 border border-orange-200 px-3 py-1.5">
              <ShieldAlert size={14} className="text-[#dc2626]" />
              <span>สินค้าพร้อมส่ง จัดส่งเร็วถึงหน้าบ้าน</span>
            </div>

            <a
              href={urls.cart}
              className="flex items-center gap-2 px-4 py-2 border border-[#fdba74] hover:bg-[#fff7ed] text-[#dc2626] font-semibold text-sm transition-colors relative"
            >
              <ShoppingCart size={18} />
              <span className="font-[family:var(--font-kanit)]">ตะกร้า</span>
            </a>
          </div>

        </div>
      </div>

      {/* Category scroll bar */}
      <div className="bg-[#fff7ed] border-t border-[#fdba74] py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto flex gap-6 text-sm font-semibold no-scrollbar">
          {categories.map((c) => (
            <a
              key={c}
              href={`${urls.shop}?cat=${encodeURIComponent(c)}`}
              className="text-[#7f1d1d] hover:text-[#dc2626] whitespace-nowrap font-[family:var(--font-prompt)] tracking-wide transition-colors"
            >
              {c}
            </a>
          ))}
        </div>
      </div>

    </header>
  );
}
