'use client';

/**
 * Mu Wallpaper — Header
 *
 * Sticky, blurred midnight bar with the gilded "สิงิล" (sigil) brand mark
 * on the left and a live credit chip on the right — the centrepiece of a
 * store-credit storefront. The chip fetches the buyer's per-store balance
 * from `/api/credit/balance?storeSlug=` on mount; once loaded it reads
 * "เครดิต ฿X", otherwise it shows the "เติมเครดิต" CTA. Both states link to
 * `/stores/<slug>/account/credit`.
 *
 * Receives a nested-`store` shape; the adapter in `adapters.tsx` repacks
 * the scaffold flat-prop `HeaderProps` into this shape. Credit-pill logic
 * mirrors `sheetlab-formula/chrome/Header.tsx`.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { MU_WALLPAPER_HEX, MU_WALLPAPER_GOLD_GRADIENT } from '../palette';

interface MuWallpaperHeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  categories?: string[];
}

const COIN = MU_WALLPAPER_HEX.gold;

function CoinSvg({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      style={{ flex: 'none', color: COIN }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.2" fill="currentColor" opacity=".18" />
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5.6" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M12 8.6l1 2 2.2.2-1.6 1.5.5 2.1L12 13.4l-2.1 1 .5-2.1L8.8 10.8l2.2-.2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MuWallpaperHeader({ store }: MuWallpaperHeaderProps) {
  const lines = useCart((s) => s.lines);
  const itemCount = lines
    .filter((l) => l.storeSlug === store.slug)
    .reduce((acc, l) => acc + l.qty, 0);

  const homeUrl = `/stores/${store.slug}`;
  const topupUrl = `/stores/${store.slug}/account/credit`;
  const cartUrl = `/stores/${store.slug}/cart`;

  // Buyer's per-store credit balance. null = still loading or guest (401
  // from /api/credit/balance). When loaded > 0 the chip shows the balance
  // instead of the generic "เติมเครดิต" CTA.
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

  return (
    <header
      className="sticky top-0 z-50 w-full font-[family:var(--font-prompt)]"
      style={{
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        background: 'rgba(11,9,24,.72)',
        borderBottom: `1px solid var(--shop-border, ${MU_WALLPAPER_HEX.border})`,
        ['--shop-primary' as string]: MU_WALLPAPER_HEX.gold,
      }}
    >
      <div className="max-w-[1180px] mx-auto px-4">
        <div className="flex items-center justify-between gap-3" style={{ height: 60 }}>
          {/* Brand: gilded sigil + name */}
          <Link href={homeUrl} className="flex items-center gap-2.5" aria-label={store.name}>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-8 w-auto object-contain" />
            ) : (
              <svg
                viewBox="0 0 40 40"
                fill="none"
                stroke="url(#mu-sg)"
                strokeWidth="1.6"
                className="flex-none"
                style={{
                  width: 32,
                  height: 32,
                  filter: 'drop-shadow(0 0 8px rgba(233,205,132,.45))',
                }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="mu-sg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={MU_WALLPAPER_HEX.gold2} />
                    <stop offset="1" stopColor={MU_WALLPAPER_HEX.goldDeep} />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="15" />
                <circle cx="20" cy="20" r="6" />
                <path d="M20 2 L20 38 M2 20 L38 20 M7 7 L33 33 M33 7 L7 33" />
              </svg>
            )}
            <span className="leading-tight">
              <span
                className="block text-[20px] font-[family:var(--font-kanit)] font-semibold tracking-[0.02em]"
                style={{
                  background: MU_WALLPAPER_GOLD_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {store.name}
              </span>
              <span
                className="block text-[10px] tracking-[0.22em] uppercase font-medium -mt-0.5"
                style={{ color: MU_WALLPAPER_HEX.faint }}
              >
                Lucky Wallpaper
              </span>
            </span>
          </Link>

          {/* Right: live credit chip + cart */}
          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center gap-2"
              style={{
                padding: '6px 6px 6px 13px',
                borderRadius: 999,
                border: '1px solid rgba(233,205,132,.34)',
                background: 'rgba(233,205,132,.08)',
              }}
            >
              <span
                className="inline-flex items-baseline gap-1.5 text-[15px]"
                style={{ color: MU_WALLPAPER_HEX.gold2 }}
              >
                <CoinSvg size={15} />
                <span className="font-[family:var(--font-kanit)] font-semibold tabular-nums">
                  {hasCredit ? `เครดิต ${formatTHB(creditBalanceTHB as number)}` : '0'}
                </span>
              </span>
              <Link
                href={topupUrl}
                className="inline-flex items-center gap-1 text-[13px] font-semibold transition-transform hover:-translate-y-px"
                style={{
                  color: MU_WALLPAPER_HEX.goldInk,
                  background: MU_WALLPAPER_GOLD_GRADIENT,
                  borderRadius: 999,
                  padding: '7px 13px',
                }}
                aria-label={hasCredit ? 'เติมเครดิตเพิ่ม' : 'เติมเครดิตในร้าน'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                เติม
              </Link>
            </div>

            <Link
              href={cartUrl}
              className="relative inline-flex items-center p-2 transition-colors"
              style={{ color: MU_WALLPAPER_HEX.ink }}
              aria-label={`ตะกร้า ${itemCount} รายการ`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" />
              </svg>
              {itemCount > 0 ? (
                <span
                  className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full translate-x-1/4 -translate-y-1/4"
                  style={{
                    color: MU_WALLPAPER_HEX.goldInk,
                    background: MU_WALLPAPER_GOLD_GRADIENT,
                    minWidth: 18,
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

export default MuWallpaperHeader;
