'use client';
import React, { useTransition } from 'react';
import { Search, ShoppingBag, User, Menu } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
  accent?: string;
}

export function Header({ storeSlug, storeName, storeLogoUrl, categories, accent }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentModel = searchParams.get('model') || 'ทุกรุ่น';
  const models = ['CB650R', 'MT-07', 'R3', 'GPX', 'Wave 125', 'ทุกรุ่น'];

  const handleModelSelect = (model: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (model === 'ทุกรุ่น') {
      params.delete('model');
    } else {
      params.set('model', model);
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#1f1f1f]">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <a href={urls.home} className="flex items-center gap-2">
              {storeLogoUrl ? (
                <img src={storeLogoUrl} alt={storeName} className="h-8 w-auto object-contain" />
              ) : (
                <div className="w-9 h-9 rounded bg-[#facc15] flex items-center justify-center text-black font-extrabold text-lg">
                  V7
                </div>
              )}
              <span className="font-sans font-extrabold text-2xl tracking-tighter text-[#fafafa] uppercase">
                {storeName}
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {categories.slice(0, 5).map((category) => (
              <a
                key={category}
                href={`${urls.shop}?cat=${encodeURIComponent(category)}`}
                className="text-xs uppercase font-sans tracking-widest font-semibold text-[#a3a3a3] hover:text-[#facc15] transition-colors"
              >
                {category}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {}}
              className="p-2 text-[#a3a3a3] hover:text-[#facc15] transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <a
              href={urls.cart}
              className="p-2 text-[#a3a3a3] hover:text-[#facc15] transition-colors flex items-center relative"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
            </a>
          </div>

        </div>
      </div>

      {/* Sticky Model Lock Chip Strip */}
      <div className="bg-[#0f0f0f] border-t border-[#1f1f1f] py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-sans tracking-wide text-[#737373]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]" />
            <span className="uppercase font-semibold text-[#fafafa]">ล็อกขนาดให้ตรงรถ:</span>
            <span className="hidden lg:inline text-[#525252]">| ฟิลเตอร์โชว์เฉพาะของที่ใส่ได้จริง ส่งวันเดียวในกรุงเทพ</span>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar pb-1 sm:pb-0">
            {models.map((model) => {
              const active = currentModel === model;
              return (
                <button
                  key={model}
                  onClick={() => handleModelSelect(model)}
                  disabled={isPending}
                  className={`px-3 py-1.5 text-xs font-sans tracking-wider uppercase font-semibold transition-all duration-200 border rounded-none ${
                    active
                      ? 'bg-[#facc15] text-black border-[#facc15] font-bold shadow-lg shadow-[#facc15]/10'
                      : 'bg-[#171717] text-[#a3a3a3] border-[#262626] hover:border-[#facc15]/50 hover:text-[#fafafa]'
                  }`}
                >
                  {model}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
