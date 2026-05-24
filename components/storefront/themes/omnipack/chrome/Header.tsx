'use client';

/**
 * OmniPack — sticky storefront header.
 *
 * Kraft-card surface, rounded-full search pill, Kanit logo + Prompt nav.
 * Cart count is read from the per-store zustand selector so the badge
 * reflects only THIS store's lines.
 */

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu, PackageOpen } from 'lucide-react';
import type { HeaderProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';

export function OmnipackHeader(props: HeaderProps) {
  const { storeSlug, storeName, storeLogoUrl, categories } = props;
  const cartCount = useCart((s) => s.countForStore(storeSlug));
  const homeUrl = `/stores/${storeSlug}`;
  const shopUrl = `/stores/${storeSlug}/category`;
  const cartUrl = `/stores/${storeSlug}/cart`;
  const cats = (categories ?? []).slice(0, 5);

  return (
    <header
      className="sticky top-0 z-40 border-b font-[family:var(--font-prompt)]"
      style={{
        backgroundColor: 'var(--shop-card)',
        borderColor: 'var(--shop-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-20">
          {/* Mobile menu trigger */}
          <button
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-[var(--shop-bg-soft,var(--shop-bg))]"
            style={{ color: 'var(--shop-ink)' }}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href={homeUrl} className="flex items-center gap-3 shrink-0">
            {storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-10 w-10 object-contain rounded-md"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-md flex items-center justify-center text-white"
                style={{ background: 'var(--shop-primary-gradient, var(--shop-primary))' }}
              >
                <PackageOpen className="w-5 h-5" />
              </div>
            )}
            <div className="hidden sm:flex flex-col leading-tight">
              <span
                className="font-[family:var(--font-kanit)] font-medium text-lg tracking-tight"
                style={{ color: 'var(--shop-ink)' }}
              >
                {storeName}
              </span>
              <span
                className="text-[10px] font-medium tracking-wide"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                บรรจุภัณฑ์สำเร็จรูป · ส่งทันที
              </span>
            </div>
          </Link>

          {/* Search pill */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <label
              className="flex items-center gap-2 w-full rounded-full border px-4 py-2"
              style={{
                backgroundColor: 'var(--shop-bg)',
                borderColor: 'var(--shop-border)',
              }}
            >
              <Search className="w-4 h-4" style={{ color: 'var(--shop-ink-muted)' }} />
              <input
                type="search"
                placeholder="ค้นหากล่อง · ซองไปรษณีย์ · ขนาด..."
                className="flex-1 bg-transparent outline-none text-sm font-[family:var(--font-prompt)]"
                style={{ color: 'var(--shop-ink)' }}
              />
            </label>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 ml-auto">
            <Link
              href={shopUrl}
              className="text-sm font-medium hover:opacity-80"
              style={{ color: 'var(--shop-ink)' }}
            >
              สินค้าทั้งหมด
            </Link>
            {cats.map((cat) => (
              <Link
                key={cat}
                href={`${shopUrl}?cat=${encodeURIComponent(cat)}`}
                className="text-sm font-medium hover:opacity-80"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                {cat}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <button
              className="md:hidden p-2 rounded-full hover:bg-[var(--shop-bg-soft,var(--shop-bg))]"
              style={{ color: 'var(--shop-ink)' }}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="hidden sm:flex p-2 rounded-full hover:bg-[var(--shop-bg-soft,var(--shop-bg))]"
              style={{ color: 'var(--shop-ink)' }}
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>
            <Link
              href={cartUrl}
              className="relative p-2 rounded-full hover:bg-[var(--shop-bg-soft,var(--shop-bg))]"
              style={{ color: 'var(--shop-ink)' }}
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ backgroundColor: 'var(--shop-primary)' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
