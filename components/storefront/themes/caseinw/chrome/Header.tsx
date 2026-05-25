'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Heart, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
  accent?: string;
}

/**
 * CaseINW — off-white sticky header with tilted-bezel logo.
 *
 * Left logo + category chips on desktop / burger on mobile. Right side
 * holds a "Customize" pill (gradient), search, wishlist, cart with a
 * gradient badge. Underline rail tints first 3 categories with the
 * brand gradient — different from casetify-clone's single-red accent.
 */
export function Header({
  storeSlug,
  storeName,
  storeLogoUrl,
  categories,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCart((s) => s.countForStore(storeSlug));

  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
    about: `/stores/${storeSlug}/about`,
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF7]/95 backdrop-blur-md border-b border-[#E6E6DF] font-[family:var(--font-prompt)] text-[#0E0E12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-[72px] gap-4">
          {/* Left — burger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link href={urls.home} className="flex items-center gap-2 group">
              {storeLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={storeLogoUrl}
                  alt={storeName}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <CaseinwWordmark name={storeName} />
              )}
            </Link>
          </div>

          {/* Center — desktop category chips */}
          {categories.length > 0 && (
            <nav className="hidden lg:flex items-center gap-1.5 flex-1 justify-center max-w-2xl">
              {categories.slice(0, 5).map((cat, idx) => {
                const active = idx === 0;
                return (
                  <Link
                    key={cat}
                    href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                    className={[
                      'px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[0.12em] transition-all',
                      active
                        ? 'text-white shadow-sm'
                        : 'text-[#0E0E12]/70 hover:text-[#0E0E12] hover:bg-black/5',
                    ].join(' ')}
                    style={
                      active
                        ? {
                            background:
                              'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
                          }
                        : undefined
                    }
                  >
                    {cat}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right — actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href={urls.shop}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-[0.18em] text-white shadow-sm hover:shadow-md transition-shadow"
              style={{
                background:
                  'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
              }}
            >
              <Sparkles size={13} />
              <span>ปั้นเคส</span>
            </Link>
            <Link
              href={urls.shop}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
              aria-label="ค้นหา"
            >
              <Search size={20} />
            </Link>
            <Link
              href={urls.about}
              className="hidden sm:inline-flex p-2 rounded-full hover:bg-black/5 transition-colors"
              aria-label="รายการโปรด"
            >
              <Heart size={20} />
            </Link>
            <Link
              href={urls.cart}
              className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-black h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-sm"
                  style={{
                    background:
                      'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
                  }}
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
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#FAFAF7] border-b border-[#E6E6DF] shadow-lg">
          <ul className="py-3 px-4 space-y-1 text-sm font-semibold text-[#0E0E12]">
            {categories.slice(0, 10).map((cat, idx) => (
              <li key={cat}>
                <Link
                  href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-3 rounded-xl hover:bg-black/5 uppercase tracking-[0.12em] text-[13px] transition-colors"
                  style={
                    idx === 0
                      ? {
                          color: 'var(--shop-primary, #8B5CF6)',
                        }
                      : undefined
                  }
                >
                  {cat}
                </Link>
              </li>
            ))}
            <li className="pt-3 mt-2 border-t border-[#E6E6DF]">
              <Link
                href={urls.shop}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 py-3 rounded-full text-white text-[12px] font-extrabold uppercase tracking-[0.18em]"
                style={{
                  background:
                    'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
                }}
              >
                <Sparkles size={14} /> ปั้นเคสของคุณ
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function CaseinwWordmark({ name }: { name: string }) {
  return (
    <span className="font-[family:var(--font-kanit)] font-black text-2xl tracking-[-0.02em] uppercase leading-none inline-flex items-baseline">
      <span
        style={{
          backgroundImage:
            'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {name}
      </span>
      <span
        aria-hidden="true"
        className="ml-1 inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: '#A3E635' }}
      />
    </span>
  );
}

export default Header;
