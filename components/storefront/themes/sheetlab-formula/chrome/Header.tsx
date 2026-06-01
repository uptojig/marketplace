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

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, Search, FileSpreadsheet, Wallet, User, ChevronDown } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

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

  // Buyer's per-store credit balance. null = still loading or guest
  // (401 from /api/credit/balance). When loaded, the header pill
  // becomes "เครดิต ฿X" instead of the generic "เติมเครดิต" CTA.
  const [creditBalanceTHB, setCreditBalanceTHB] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/credit/balance?storeSlug=${encodeURIComponent(store.slug)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setCreditBalanceTHB(null);
          return;
        }
        const data = (await res.json()) as { balanceTHB: number };
        setCreditBalanceTHB(data.balanceTHB);
      })
      .catch(() => {
        if (!cancelled) setCreditBalanceTHB(null);
      });
    return () => {
      cancelled = true;
    };
  }, [store.slug]);

  // First 4 categories show as direct links; the rest go into a dropdown.
  const visibleCats = categories.slice(0, 4);
  const overflowCats = categories.slice(4);
  const hasOverflow = overflowCats.length > 0;

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen]);

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
            className="hidden md:flex items-center gap-5"
            aria-label="ลิงก์หลัก"
          >
            {visibleCats.map((cat) => (
              <Link
                key={cat}
                href={`${catalogUrl}?cat=${encodeURIComponent(cat)}`}
                className="text-sm text-[#4B5563] hover:text-[#107C41] transition-colors"
              >
                {cat}
              </Link>
            ))}
            {/* "อื่นๆ" dropdown — remaining categories + สูตรทั้งหมด */}
            {hasOverflow && (
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className={`inline-flex items-center gap-1 text-sm transition-colors ${
                    moreOpen
                      ? 'text-[#107C41] font-medium'
                      : 'text-[#4B5563] hover:text-[#107C41]'
                  }`}
                >
                  อื่นๆ
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      moreOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {moreOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-lg border border-[#E5E7EB] shadow-lg py-1 z-50">
                    {overflowCats.map((cat) => (
                      <Link
                        key={cat}
                        href={`${catalogUrl}?cat=${encodeURIComponent(cat)}`}
                        className="block px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F0FDF4] hover:text-[#107C41] transition-colors"
                        onClick={() => setMoreOpen(false)}
                      >
                        {cat}
                      </Link>
                    ))}
                    <div className="border-t border-[#E5E7EB] my-1" />
                    <Link
                      href={catalogUrl}
                      className="block px-4 py-2 text-sm font-medium text-[#107C41] hover:bg-[#F0FDF4] transition-colors"
                      onClick={() => setMoreOpen(false)}
                    >
                      สูตรทั้งหมด
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right: top-up CTA + search + cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href={`/stores/${store.slug}/account/credit`}
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 ${
                creditBalanceTHB && creditBalanceTHB > 0
                  ? 'bg-[#ECFDF5] text-[#107C41] border border-[#107C41]'
                  : 'text-white'
              }`}
              style={
                creditBalanceTHB && creditBalanceTHB > 0
                  ? undefined
                  : { background: '#107C41' }
              }
              aria-label={
                creditBalanceTHB && creditBalanceTHB > 0
                  ? `ยอดเครดิต ${formatTHB(creditBalanceTHB)}`
                  : 'เติมเครดิตในร้าน'
              }
            >
              <Wallet className="w-4 h-4" />
              {creditBalanceTHB !== null && creditBalanceTHB > 0
                ? `เครดิต ${formatTHB(creditBalanceTHB)}`
                : 'เติมเครดิต'}
            </Link>
            <Link
              href={`/stores/${store.slug}/account`}
              className="p-2 text-[#1F2937] hover:text-[#107C41] transition-colors hidden sm:inline-flex"
              aria-label="โปรไฟล์"
            >
              <User className="w-5 h-5" />
            </Link>
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
