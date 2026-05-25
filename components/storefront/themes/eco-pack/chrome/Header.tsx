'use client';
import React from 'react';
import { Search, ShoppingBag, User, Menu } from 'lucide-react';

export interface HeaderProps {
  logoUrl?: string; // URL for store logo
  storeName: string; // Store name
  navItems: { label: string; url: string }[]; // Navigation links
  cartCount: number; // Number of items in cart
  onSearch: (q: string) => void;
  onSignIn: () => void;
  homeUrl: string; // URL for homepage
  cartUrl: string; // URL for cart page
}

export function Header({ logoUrl, storeName, navItems, cartCount, onSearch, onSignIn, homeUrl, cartUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--shop-card)] border-b border-[var(--shop-border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-[var(--shop-ink)] rounded-md hover:bg-[var(--shop-bg)]">
              <span className="sr-only">Open menu</span>
              <Menu size={24} />
            </button>
            <a href={homeUrl} className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-8 h-8 rounded bg-[var(--shop-primary)] flex items-center justify-center text-white font-bold">
                  {storeName.charAt(0)}
                </div>
              )}
              <span className="font-bold text-xl tracking-tight text-[var(--eco-kraft-dark)] hidden sm:block">
                {storeName}
              </span>
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.url}
                className="text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] font-medium text-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => onSearch('')} 
              className="p-2 text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button 
              onClick={onSignIn}
              className="hidden sm:flex p-2 text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] transition-colors"
              aria-label="Account"
            >
              <User size={20} />
            </button>
            <a 
              href={cartUrl} 
              className="relative p-2 text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] transition-colors flex items-center"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[var(--shop-primary)] text-white text-[10px] items-center justify-center flex h-4 w-4 rounded-full border border-[var(--shop-card)]">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
