'use client';

/**
 * resume-studio-th — Header
 *
 * Sticky, blurred top nav lifted from the ResumeKit export
 * (`.site-header` / `.nav` in css/styles.css + `mountHeader` in
 * js/store.js). Indigo brand mark on the left, nav links in the
 * middle on desktop, and a mint credit pill + cart icon on the right.
 *
 * The credit pill fetches the buyer's per-store balance on mount
 * (`/api/credit/balance?storeSlug=`). When the buyer has a balance it
 * renders "เครดิต ฿X" (mint chip); otherwise it's the "เติมเครดิต"
 * CTA linking to the store's credit top-up page. This mirrors the
 * sheetlab-formula Header logic.
 *
 * Receives a nested-`store` shape; the adapter in `adapters.tsx`
 * repacks the scaffold flat-prop `HeaderProps` into this shape.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, FileText, Coins } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import {
  RS_ACCENT,
  RS_ACCENT_INK,
  RS_CREDIT,
  RS_CREDIT_INK,
  RS_CREDIT_SOFT,
  RS_FG,
  RS_FG_SOFT,
  RS_BORDER,
} from '../palette';

interface ResumeStudioHeaderProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  categories?: string[];
}

export function ResumeStudioHeader({
  store,
  categories = [],
}: ResumeStudioHeaderProps) {
  const lines = useCart((s) => s.lines);
  const itemCount = lines
    .filter((l) => l.storeSlug === store.slug)
    .reduce((acc, l) => acc + l.qty, 0);

  const homeUrl = `/stores/${store.slug}`;
  const catalogUrl = `/stores/${store.slug}/category`;
  const creditUrl = `/stores/${store.slug}/account/credit`;

  // Buyer's per-store credit balance. null = still loading or guest
  // (401 from /api/credit/balance). When loaded, the pill becomes
  // "เครดิต ฿X" instead of the generic "เติมเครดิต" CTA.
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

  // Top 4 categories surface as quick links on desktop. Anything
  // beyond that funnels through the full Catalog page.
  const navCats = categories.slice(0, 4);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b font-[family:var(--font-prompt)]"
      style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
        borderColor: RS_BORDER,
      }}
    >
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Left: mobile menu + brand */}
          <button
            type="button"
            aria-label="เมนู"
            className="p-2 -ml-2 md:hidden transition-colors"
            style={{ color: RS_FG }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            href={homeUrl}
            className="flex items-center gap-2.5 group"
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
                  style={{
                    background: `linear-gradient(145deg, ${RS_ACCENT}, ${RS_ACCENT_INK})`,
                  }}
                  aria-hidden="true"
                >
                  <FileText className="w-[17px] h-[17px]" />
                </span>
                <span
                  className="text-[19px] font-[family:var(--font-kanit)] font-bold tracking-tight"
                  style={{ color: RS_FG }}
                >
                  {store.name}
                </span>
              </>
            )}
          </Link>

          {/* Middle: nav links on desktop */}
          <nav
            className="hidden md:flex items-center gap-1 ml-2"
            aria-label="ลิงก์หลัก"
          >
            <Link
              href={catalogUrl}
              className="px-3 py-2 rounded-lg text-[14.5px] font-medium transition-colors hover:bg-[#F2F5F9]"
              style={{ color: RS_FG_SOFT }}
            >
              เทมเพลตทั้งหมด
            </Link>
            {navCats.map((cat) => (
              <Link
                key={cat}
                href={`${catalogUrl}?cat=${encodeURIComponent(cat)}`}
                className="px-3 py-2 rounded-lg text-[14.5px] font-medium transition-colors hover:bg-[#F2F5F9]"
                style={{ color: RS_FG_SOFT }}
              >
                {cat}
              </Link>
            ))}
          </nav>

          {/* Right: credit pill + cart */}
          <div className="flex items-center gap-2 ml-auto">
            <Link
              href={creditUrl}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-semibold transition-transform hover:-translate-y-px"
              style={
                hasCredit
                  ? {
                      background: RS_CREDIT_SOFT,
                      border: `1px solid rgba(0,165,125,0.25)`,
                      color: RS_CREDIT_INK,
                    }
                  : {
                      background: RS_CREDIT,
                      color: '#06251C',
                    }
              }
              aria-label={
                hasCredit
                  ? `ยอดเครดิต ${formatTHB(creditBalanceTHB as number)}`
                  : 'เติมเครดิตในร้าน'
              }
            >
              <Coins className="w-4 h-4" />
              {hasCredit ? (
                <span className="font-[family:var(--font-mono)] tabular-nums">
                  เครดิต {formatTHB(creditBalanceTHB as number)}
                </span>
              ) : (
                <span>เติมเครดิต</span>
              )}
            </Link>
            <Link
              href={`/stores/${store.slug}/cart`}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border bg-white transition-colors hover:bg-[#F2F5F9]"
              style={{ color: RS_FG_SOFT, borderColor: RS_BORDER }}
              aria-label={`ตะกร้า ${itemCount} รายการ`}
            >
              <ShoppingCart className="w-[19px] h-[19px]" />
              {itemCount > 0 ? (
                <span
                  className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold leading-none text-white rounded-full font-[family:var(--font-mono)]"
                  style={{ background: RS_ACCENT, border: '2px solid #fff' }}
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

export default ResumeStudioHeader;
