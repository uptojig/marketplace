'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
  accent?: string;
}

/**
 * BlackWrapp — premium dark header.
 *
 * Near-black surface, hair-thin divider, accent-color cart badge with
 * a subtle glow, rounded-full search box that lights up on focus.
 * Mobile drawer drops down from the same near-black tone so the
 * silhouette stays calm.
 */
export function Header({
  storeSlug,
  storeName,
  storeLogoUrl,
  categories,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const cartCount = useCart((s) => s.countForStore(storeSlug));

  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = `${urls.shop}?q=${encodeURIComponent(q)}`;
  };

  return (
    <header
      className="sticky top-0 z-50 font-[family:var(--font-prompt)] border-b border-white/5 backdrop-blur-md"
      style={{ background: 'rgba(10,10,10,0.85)', color: '#FAFAFA' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden -ml-2 p-2 text-white/80 hover:text-white transition-colors"
            aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>

          {/* Brand */}
          <Link
            href={urls.home}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            {storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full font-[family:var(--font-kanit)] font-medium text-sm"
                style={{
                  background: 'var(--shop-primary-gradient, var(--shop-primary))',
                  color: '#0A0A0A',
                  boxShadow: '0 0 18px var(--shop-primary, #00FF88)40',
                }}
              >
                {storeName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="font-[family:var(--font-kanit)] font-medium text-base sm:text-lg tracking-[0.15em] text-white truncate max-w-[180px] sm:max-w-none">
              {storeName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat}
                href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                className="font-[family:var(--font-prompt)] text-[12px] tracking-[0.18em] text-white/70 hover:text-white transition-colors duration-300"
              >
                {cat}
              </Link>
            ))}
          </nav>

          {/* Search + cart */}
          <div className="flex items-center gap-3">
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 focus-within:border-[var(--shop-primary,#00FF88)] focus-within:shadow-[0_0_0_3px_rgba(0,255,136,0.12)] transition-all duration-300"
              role="search"
            >
              <Search size={14} strokeWidth={1.75} className="text-white/50" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาสินค้า"
                className="w-40 lg:w-52 bg-transparent text-xs text-white placeholder:text-white/40 outline-none"
                aria-label="ค้นหาสินค้า"
              />
            </form>

            <Link
              href={urls.cart}
              className="relative p-2 text-white/80 hover:text-white transition-colors"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag size={20} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums"
                  style={{
                    background: 'var(--shop-primary-gradient, var(--shop-primary))',
                    color: '#0A0A0A',
                    boxShadow: '0 0 12px var(--shop-primary, #00FF88)55',
                  }}
                  aria-label={`${cartCount} รายการในตะกร้า`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#0A0A0A] px-4 sm:px-6 py-5 space-y-1">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 mb-4 focus-within:border-[var(--shop-primary,#00FF88)]"
            role="search"
          >
            <Search size={14} strokeWidth={1.75} className="text-white/50" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาสินค้า"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
              aria-label="ค้นหาสินค้า"
            />
          </form>
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat}
              href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 font-[family:var(--font-kanit)] text-sm tracking-[0.1em] text-white/80 hover:text-white border-b border-white/5 last:border-0 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export default Header;
