'use client';

/**
 * IconMart (iconmart-th) — Header
 *
 * Sticky, frosted top nav in the export's modern-minimal language: a
 * box/cube logo mark on a slate-ink chip, Thai nav links, a live credit
 * pill, and a cart icon with live count. Cool-blue accent.
 *
 * The live credit pill fetches `/api/credit/balance?storeSlug=` on mount
 * (logic copied from sheetlab-formula's Header). When a positive balance
 * is loaded it shows "เครดิต ฿X"; otherwise it falls back to a
 * "เติมเครดิต" CTA linking to the top-up route.
 *
 * Receives a nested-`store` shape; the adapter in `adapters.tsx` repacks
 * the scaffold flat-prop `HeaderProps` into this shape.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Coins, Box } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { ICONMART_HEX } from '../palette';

interface IconMartHeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  categories?: string[];
}

const ACCENT = `var(--shop-primary, ${ICONMART_HEX.primary})`;

export function IconMartHeader({
  store,
  categories = [],
}: IconMartHeaderProps) {
  const lines = useCart((s) => s.lines);
  const itemCount = lines
    .filter((l) => l.storeSlug === store.slug)
    .reduce((acc, l) => acc + l.qty, 0);

  const homeUrl = `/stores/${store.slug}`;
  const catalogUrl = `/stores/${store.slug}/category`;
  const topupUrl = `/stores/${store.slug}/account/credit`;

  // Buyer's per-store credit balance. null = still loading or guest
  // (401 from /api/credit/balance). When loaded > 0, the pill becomes
  // "เครดิต ฿X"; otherwise it stays the "เติมเครดิต" CTA.
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

  const hasCredit = creditBalanceTHB !== null && creditBalanceTHB > 0;

  // Top 4 categories surface as quick links on desktop. Anything beyond
  // that funnels through the full Catalog page.
  const navCats = categories.slice(0, 4);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md font-[family:var(--font-prompt)]"
      style={{
        backgroundColor: 'rgba(255,255,255,0.82)',
        borderColor: ICONMART_HEX.border,
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
        backdropFilter: 'saturate(180%) blur(16px)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-[60px]">
          {/* Left: logo + brand */}
          <Link
            href={homeUrl}
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label={store.name}
          >
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <>
                <span
                  className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] text-white"
                  style={{ background: ICONMART_HEX.ink }}
                  aria-hidden="true"
                >
                  <Box className="w-[18px] h-[18px]" strokeWidth={2} />
                </span>
                <span
                  className="text-[18px] font-[family:var(--font-kanit)] font-bold tracking-tight"
                  style={{ color: ICONMART_HEX.ink, letterSpacing: '-0.02em' }}
                >
                  {store.name}
                </span>
              </>
            )}
          </Link>

          {/* Middle: nav links on desktop */}
          <nav
            className="hidden md:flex items-center gap-1 ml-1.5"
            aria-label="ลิงก์หลัก"
          >
            <Link
              href={catalogUrl}
              className="px-3 py-1.5 rounded-[9px] text-[14px] font-medium transition-colors hover:bg-[var(--shop-surface-2,#F5F7F9)]"
              style={{ color: ICONMART_HEX.inkMuted }}
            >
              ไอคอนทั้งหมด
            </Link>
            {navCats.map((cat) => (
              <Link
                key={cat}
                href={`${catalogUrl}?cat=${encodeURIComponent(cat)}`}
                className="px-3 py-1.5 rounded-[9px] text-[14px] font-medium transition-colors hover:bg-[var(--shop-surface-2,#F5F7F9)]"
                style={{ color: ICONMART_HEX.inkMuted }}
              >
                {cat}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Right: search (icon) + credit pill + cart */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="ค้นหาไอคอน"
              className="hidden sm:grid place-items-center w-[38px] h-[38px] rounded-[10px] border transition-colors"
              style={{
                borderColor: ICONMART_HEX.border2,
                background: ICONMART_HEX.surface,
                color: ICONMART_HEX.ink,
              }}
            >
              <Search className="w-[19px] h-[19px]" />
            </button>

            {/* Live credit pill */}
            <Link
              href={topupUrl}
              className="inline-flex items-center gap-1.5 h-[38px] px-3 rounded-[10px] border text-[14px] font-semibold transition-colors tabular-nums"
              style={
                hasCredit
                  ? {
                      borderColor: ACCENT,
                      background: ICONMART_HEX.accentSoft,
                      color: ICONMART_HEX.primaryHover,
                    }
                  : {
                      borderColor: ICONMART_HEX.border2,
                      background: ICONMART_HEX.surface,
                      color: ICONMART_HEX.ink,
                    }
              }
              aria-label={
                hasCredit
                  ? `ยอดเครดิต ${formatTHB(creditBalanceTHB as number)}`
                  : 'เติมเครดิตในร้าน'
              }
            >
              <Coins className="w-4 h-4" style={{ color: ACCENT }} />
              {hasCredit
                ? `เครดิต ${formatTHB(creditBalanceTHB as number)}`
                : 'เติมเครดิต'}
            </Link>

            {/* Cart */}
            <Link
              href={`/stores/${store.slug}/cart`}
              className="relative grid place-items-center w-[38px] h-[38px] rounded-[10px] border transition-colors"
              style={{
                borderColor: ICONMART_HEX.border2,
                background: ICONMART_HEX.surface,
                color: ICONMART_HEX.ink,
              }}
              aria-label={`ตะกร้า ${itemCount} รายการ`}
            >
              <ShoppingCart className="w-[19px] h-[19px]" />
              {itemCount > 0 ? (
                <span
                  className="absolute -top-[7px] -right-[7px] min-w-[18px] h-[18px] px-1 grid place-items-center rounded-[9px] text-[11px] font-bold text-white"
                  style={{
                    background: ACCENT,
                    border: `2px solid ${ICONMART_HEX.surface}`,
                  }}
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

export default IconMartHeader;
