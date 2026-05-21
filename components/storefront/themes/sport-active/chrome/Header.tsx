'use client';
import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu } from 'lucide-react';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
  accent?: string;
}

export function Header({ storeSlug, storeName, storeLogoUrl, categories = [], accent }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        background: '#FFFFFFee',
        borderColor: '#e5e5e5',
        color: '#171717',
      }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href={`/stores/${storeSlug}`} className="flex items-center gap-2">
          {storeLogoUrl ? (
            <img src={storeLogoUrl} alt={storeName} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: accent || '#16a34a' }}
            >
              {storeName.charAt(0)}
            </div>
          )}
          <span className="text-base font-semibold">{storeName}</span>
        </Link>

        <nav className="hidden gap-6 text-sm md:flex">
          <Link href={`/stores/${storeSlug}`} className="opacity-70 transition hover:opacity-100">
            หน้าแรก
          </Link>
          <Link href={`/stores/${storeSlug}/category`} className="opacity-70 transition hover:opacity-100">
            สินค้า
          </Link>
          <Link href={`/stores/${storeSlug}/about`} className="opacity-70 transition hover:opacity-100">
            เกี่ยวกับ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href={`/stores/${storeSlug}/category`} aria-label="ค้นหา">
            <Search className="h-5 w-5 opacity-60 transition hover:opacity-100" />
          </Link>
          <Link href={`/stores/${storeSlug}/cart`} aria-label="ตะกร้า">
            <ShoppingCart className="h-5 w-5 opacity-60 transition hover:opacity-100" />
          </Link>
          <button className="md:hidden" aria-label="เมนู">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
