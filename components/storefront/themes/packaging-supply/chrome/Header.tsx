'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu, Package, Phone } from 'lucide-react';

export interface PackagingSupplyHeaderProps {
  storeName: string;
  storeLogoUrl?: string | null;
  homeUrl: string;
  shopUrl: string;
  cartUrl: string;
  bulkUrl: string;
  categories: string[];
  cartCount: number;
}

/**
 * Packaging Supply — playful B2B-light header.
 *
 * Sticky white shell with a bright pink-yellow tape strip at the top,
 * search input wired to the catalog route, MOQ-friendly bulk-quote CTA
 * and a category chip rail underneath. All hot-pink CTAs use
 * `var(--shop-primary)` from `palette.ts`.
 */
export function Header({
  storeName,
  storeLogoUrl,
  homeUrl,
  shopUrl,
  cartUrl,
  bulkUrl,
  categories,
  cartCount,
}: PackagingSupplyHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--shop-bg)] border-b border-[var(--shop-border)] font-[family:var(--font-prompt)]">
      {/* Top tape strip — pink ↘ yellow gradient · zig-zag effect via dashed border */}
      <div className="bg-gradient-to-r from-[var(--shop-primary)] via-[var(--pks-pink-deep)] to-[var(--shop-accent)] text-white text-[11px] font-bold tracking-wide py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <span className="hidden sm:flex items-center gap-1.5">
            <Phone size={12} />
            สั่งขั้นต่ำ 50 ชิ้น · ส่งฟรีเมื่อสั่งครบ ฿990
          </span>
          <span className="sm:hidden">ส่งฟรี ฿990+</span>
          <Link
            href={bulkUrl}
            className="bg-white text-[var(--pks-pink-deep)] font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider hover:bg-[var(--shop-accent)] hover:text-[var(--shop-ink)] transition-colors"
          >
            ขอราคาส่ง
          </Link>
        </div>
      </div>

      {/* Main bar — logo · search · actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-20">
          {/* Left: mobile menu + logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              className="lg:hidden p-2 -ml-2 text-[var(--shop-ink)] rounded-md hover:bg-[var(--shop-muted)]"
              aria-label="เปิดเมนู"
            >
              <Menu size={22} />
            </button>
            <Link href={homeUrl} className="flex items-center gap-2.5">
              {storeLogoUrl ? (
                <img
                  src={storeLogoUrl}
                  alt={storeName}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-[var(--shop-primary)] flex items-center justify-center text-white shadow-sm">
                  <Package size={20} strokeWidth={2.5} />
                </div>
              )}
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-[family:var(--font-kanit)] font-extrabold text-lg text-[var(--shop-ink)] tracking-tight">
                  {storeName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--shop-primary)]">
                  Packaging Supply · ขายส่ง
                </span>
              </div>
            </Link>
          </div>

          {/* Center: search */}
          <form
            action={shopUrl}
            method="GET"
            className="flex-1 max-w-2xl hidden md:flex items-center rounded-full border-2 border-[var(--shop-border)] focus-within:border-[var(--shop-primary)] bg-[var(--shop-muted)] overflow-hidden transition-colors"
          >
            <input
              type="text"
              name="q"
              placeholder="ค้นหา · กล่องไปรษณีย์ · ถุงไปรษณีย์ · ซอง · เทป"
              className="flex-1 px-5 py-2.5 text-sm bg-transparent text-[var(--shop-ink)] placeholder:text-[var(--pks-ink-dim)] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[var(--shop-primary)] hover:bg-[var(--pks-pink-deep)] text-white px-5 py-2.5 flex items-center justify-center transition-colors"
              aria-label="ค้นหา"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Right: actions */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button
              className="md:hidden p-2 text-[var(--shop-ink)] hover:text-[var(--shop-primary)]"
              aria-label="ค้นหา"
            >
              <Search size={20} />
            </button>
            <button
              className="hidden sm:flex p-2 text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] transition-colors"
              aria-label="บัญชีผู้ใช้"
            >
              <User size={20} />
            </button>
            <Link
              href={cartUrl}
              className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--shop-accent)] hover:brightness-95 text-[var(--shop-ink)] font-bold text-sm transition-all"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">ตะกร้า</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--shop-primary)] text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-[var(--shop-bg)]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Category chip rail */}
        {categories.length > 0 && (
          <nav
            className="flex items-center gap-2 overflow-x-auto pb-3 -mb-px scrollbar-none"
            aria-label="หมวดหมู่บรรจุภัณฑ์"
          >
            <Link
              href={shopUrl}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--shop-primary)] text-white hover:bg-[var(--pks-pink-deep)] transition-colors"
            >
              ทั้งหมด
            </Link>
            {categories.slice(0, 12).map((c) => (
              <Link
                key={c}
                href={`${shopUrl}?cat=${encodeURIComponent(c)}`}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--shop-border)] text-[var(--shop-ink-muted)] hover:border-[var(--shop-primary)] hover:text-[var(--shop-primary)] bg-[var(--shop-bg)] transition-colors"
              >
                {c}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
