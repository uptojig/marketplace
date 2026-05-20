'use client';

import React from 'react';
import Link from 'next/link';
import type { HeaderProps } from '@/lib/templates/types';
import { Building2, Search, User, Menu, ShoppingCart, FileText } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export function BulkboxHeader({ store, categories }: HeaderProps) {
  const items = useCart((s) => s.items);
  const cartCount = items.filter((i) => i.storeSlug === store.slug).reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="border-b border-[#cbd5e1] bg-[#f8fafc] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href={`/${store.slug}`} className="flex items-center gap-3">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-10 object-contain rounded" />
              ) : (
                <div className="h-10 w-10 bg-[#0f172a] text-[#f8fafc] flex items-center justify-center rounded font-bold text-xl font-[family:var(--font-kanit)]">
                  {store.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-[family:var(--font-kanit)] font-bold text-xl text-[#0f172a] tracking-tight uppercase">
                  {store.name}
                </span>
                <div className="flex items-center gap-1 text-[10px] uppercase font-[family:var(--font-prompt)] text-[#0284c7] font-semibold tracking-wider bg-[#e2e8f0] px-1.5 py-0.5 rounded-sm w-fit mt-0.5">
                  <Building2 className="w-3 h-3" />
                  <span>B2B VERIFIED SUPPLIER</span>
                </div>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-[family:var(--font-prompt)]">
            <Link href={`/${store.slug}`} className="text-sm font-medium text-[#0f172a] hover:text-[#0284c7] transition-colors">หน้าหลัก</Link>
            <div className="group relative">
              <button className="text-sm font-medium text-[#0f172a] hover:text-[#0284c7] transition-colors flex items-center gap-1">
                หมวดหมู่สินค้า
              </button>
              <div className="absolute top-full left-0 mt-4 w-64 bg-white border border-[#cbd5e1] shadow-xl rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/${store.slug}/category/${cat.slug}`} className="block px-4 py-3 text-sm text-[#0f172a] hover:bg-[#e2e8f0] hover:text-[#0284c7] border-b border-[#cbd5e1] last:border-0 font-medium">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href={`/${store.slug}/requests`} className="text-sm font-medium text-[#0f172a] hover:text-[#0284c7] transition-colors flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> ใบขอเสนอราคา
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <button className="text-[#0f172a] hover:text-[#0284c7] transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-[#cbd5e1] hidden sm:block"></div>
            <button className="text-[#0f172a] hover:text-[#0284c7] transition-colors flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="text-sm font-[family:var(--font-prompt)] font-medium hidden sm:block">ล็อกอินธุรกิจ</span>
            </button>
            <Link href="/cart" className="text-[#0f172a] hover:text-[#0284c7] transition-colors relative flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#0284c7] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="text-sm font-[family:var(--font-prompt)] font-medium hidden sm:block">คำสั่งซื้อ</span>
            </Link>
            <button className="text-[#0f172a] md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
