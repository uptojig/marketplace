'use client';

/**
 * sheetlab-formula — Header
 *
 * Sticky top nav with Excel-green accent. Logo (or store name in
 * Kanit) on the left, a thin "fx" formula chip + nav links in the
 * middle on desktop, and a cart icon with live count on the right.
 *
 * Receives a nested-`store` shape; the adapter in `adapters.tsx`
 * repacks the scaffold flat-prop `HeaderProps` into this shape.
 */

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, Search, FileSpreadsheet } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface SheetlabFormulaHeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  categories?: string[];
}

export function SheetlabFormulaHeader({
  store,
  categories = [],
}: SheetlabFormulaHeaderProps) {
  const lines = useCart((s) => s.lines);
  const itemCount = lines
    .filter((l) => l.storeSlug === store.slug)
    .reduce((acc, l) => acc + l.qty, 0);

  const homeUrl = `/stores/${store.slug}`;
  const catalogUrl = `/stores/${store.slug}/category`;

  // Top 4 categories surface as quick links on desktop. Anything
  // beyond that funnels through the full Catalog page.
  const navCats = categories.slice(0, 4);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E7EB] shadow-sm font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: logo + mobile menu trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="เมนู"
              className="p-2 -ml-2 text-[#1F2937] hover:text-[#107C41] transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              href={homeUrl}
              className="flex items-center gap-2 group"
              aria-label={store.name}
            >
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <>
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-md text-white"
                    style={{ background: '#107C41' }}
                    aria-hidden="true"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </span>
                  <span className="text-lg sm:text-xl font-[family:var(--font-kanit)] font-semibold tracking-tight text-[#1F2937] group-hover:text-[#107C41] transition-colors">
                    {store.name}
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Middle: nav links on desktop */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="ลิงก์หลัก"
          >
            <Link
              href={catalogUrl}
              className="text-sm font-medium text-[#1F2937] hover:text-[#107C41] transition-colors"
            >
              สูตรทั้งหมด
            </Link>
            {navCats.map((cat) => (
              <Link
                key={cat}
                href={`${catalogUrl}?cat=${encodeURIComponent(cat)}`}
                className="text-sm text-[#4B5563] hover:text-[#107C41] transition-colors"
              >
                {cat}
              </Link>
            ))}
          </nav>

          {/* Right: search + cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="ค้นหา"
              className="p-2 text-[#1F2937] hover:text-[#107C41] transition-colors hidden sm:inline-flex"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href={`/stores/${store.slug}/cart`}
              className="p-2 text-[#1F2937] hover:text-[#107C41] transition-colors relative inline-flex items-center"
              aria-label={`ตะกร้า ${itemCount} รายการ`}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 ? (
                <span
                  className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white rounded-full transform translate-x-1/4 -translate-y-1/4"
                  style={{ background: '#107C41', minWidth: 18 }}
                >
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default SheetlabFormulaHeader;
