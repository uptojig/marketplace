'use client';

import React, { useState } from 'react';
import {
  IconSearch,
  IconHeart,
  IconShoppingBag,
  IconUser,
} from '@tabler/icons-react';

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
  /** Highlights item as sale style (orange pill) */
  sale?: boolean;
}

export interface HeaderProps {
  storeName?: string;
  /** When provided, replaces the wordmark with the uploaded logo image */
  logoUrl?: string;
  navItems?: NavItem[];
  cartCount?: number;
  /** Submitted when user presses Enter or clicks search button */
  onSearch?: (query: string) => void;
  onSignIn?: () => void;
  /** Cart button href; default '/cart' */
  cartHref?: string;
  // URL prop: store homepage (wordmark link target)
  homeUrl?: string;
}

const DEFAULT_NAV: NavItem[] = [
  { label: 'NEW', href: '/shop?filter=new', active: true },
  { label: 'BIKINI', href: '/shop?cat=bikini' },
  { label: 'ONE-PIECE', href: '/shop?cat=one-piece' },
  { label: 'COVER-UP', href: '/shop?cat=cover-up' },
  { label: 'LOOKBOOK', href: '/lookbook' },
  { label: 'SALE 50%', href: '/shop?filter=sale', sale: true },
];

/**
 * Header — sticky top header.
 * - Wordmark "BIKINI551" with gradient text by default
 * - Custom logo image when logoUrl supplied
 * - Search bar with controlled state submitted via onSearch
 */
export function Header({
  storeName = 'BIKINI551',
  logoUrl,
  navItems = DEFAULT_NAV,
  cartCount = 0,
  onSearch,
  onSignIn,
  cartHref = '/cart',
  homeUrl = '/',
}: HeaderProps) {
  const [query, setQuery] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <header className="bk-hdr" role="banner">
      <div className="bk-container">
        <div className="bk-hdr-inner">
          <a className="bk-logo" href={homeUrl} aria-label={`${storeName} home`}>
            {logoUrl ? (
              <img src={logoUrl} alt={`${storeName} logo`} style={{ height: 40 }} />
            ) : (
              <>
                <div aria-hidden="true">
                  <svg viewBox="0 0 50 50" width={50} height={50}>
                    <path d="M10 14 Q15 10 22 14 L24 22 Q20 26 14 24 Q10 22 10 18 Z" fill="#F472B6" stroke="#1E40AF" strokeWidth={1.5} />
                    <path d="M28 14 Q33 10 40 14 L40 18 Q40 22 36 24 Q30 26 26 22 Z" fill="#F472B6" stroke="#1E40AF" strokeWidth={1.5} />
                    <path d="M22 14 Q25 12 28 14" stroke="#1E40AF" strokeWidth={1.5} fill="none" />
                    <circle cx={15} cy={11} r={2} fill="#EC4899" />
                    <circle cx={35} cy={11} r={2} fill="#EC4899" />
                    <circle cx={15} cy={18} r={1.2} fill="white" />
                    <circle cx={33} cy={18} r={1.2} fill="white" />
                    <path d="M14 32 Q25 30 36 32 L34 42 Q25 44 16 42 Z" fill="#F472B6" stroke="#1E40AF" strokeWidth={1.5} />
                    <path d="M2 46 Q8 42 14 46 T26 46 T38 46 T50 46" stroke="#38BDF8" strokeWidth={2} fill="none" />
                  </svg>
                </div>
                <div className="bk-logo-text" aria-label={storeName}>
                  <span className="bk-logo-bk">{storeName.replace(/\d+$/, '')}</span>
                  <span className="bk-logo-num">{storeName.match(/\d+$/)?.[0] ?? ''}</span>
                </div>
              </>
            )}
          </a>

          <nav className="bk-nav" aria-label="Primary">
            {navItems.map((item) =>
              item.sale ? (
                <a key={item.href} href={item.href} className="sale">
                  {item.label}
                </a>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className={item.active ? 'active' : undefined}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.label}
                </a>
              )
            )}
          </nav>

          <form
            className="bk-search"
            role="search"
            onSubmit={submit}
            aria-label="Site search"
          >
            <div className="bk-search-row">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาบีกีนี่ลายโปรด ลายดอท ลายดอกไม้..."
                aria-label="Search products"
              />
              <button
                type="submit"
                className="bk-search-btn"
                aria-label="Submit search"
              >
                <IconSearch size={18} />
              </button>
            </div>
          </form>

          <div className="bk-hdr-actions">
            <button
              type="button"
              className="bk-icon-btn"
              aria-label="Wishlist"
              onClick={onSignIn /* placeholder — wire up wishlist */}
            >
              <IconHeart size={19} />
            </button>
            <button
              type="button"
              className="bk-icon-btn"
              aria-label="Sign in"
              onClick={onSignIn}
            >
              <IconUser size={19} />
            </button>
            <a
              href={cartHref}
              className="bk-icon-btn"
              aria-label={`Shopping bag, ${cartCount} items`}
            >
              <IconShoppingBag size={19} />
              {cartCount > 0 && <span className="bk-pip">{cartCount}</span>}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
