'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export function HinokiHeader({ store }: { store: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItems = useCart((s) => s.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 border-b ${
        isScrolled
          ? 'bg-[#f6efe2]/95 backdrop-blur-md border-[#3f2e1e]/10 py-3'
          : 'bg-[#f6efe2] border-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-1 flex items-center">
            <button
              type="button"
              className="text-[#3f2e1e] p-2 -ml-2 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">เปิดเมนู</span>
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <nav className="hidden lg:flex space-x-8">
              <Link href="#" className="text-sm font-[family:var(--font-prompt)] text-[#3f2e1e] hover:text-[#a87a4b] transition-colors">เรื่องเล่า</Link>
              <Link href="#" className="text-sm font-[family:var(--font-prompt)] text-[#3f2e1e] hover:text-[#a87a4b] transition-colors">น้ำหอม</Link>
              <Link href="#" className="text-sm font-[family:var(--font-prompt)] text-[#3f2e1e] hover:text-[#a87a4b] transition-colors">เทียนหอม</Link>
            </nav>
          </div>

          <Link href={`/${store.slug}`} className="flex-1 text-center">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-8 mx-auto object-contain" />
            ) : (
              <h1 className="text-2xl font-[family:var(--font-prompt)] text-[#3f2e1e] font-light tracking-widest uppercase">
                {store.name}
              </h1>
            )}
          </Link>

          <div className="flex-1 flex items-center justify-end space-x-4 sm:space-x-6">
            <button className="text-[#3f2e1e] hover:text-[#a87a4b] transition-colors p-2">
              <span className="sr-only">ค้นหา</span>
              <Search className="h-4 w-4" />
            </button>
            <button className="text-[#3f2e1e] hover:text-[#a87a4b] transition-colors p-2 relative">
              <span className="sr-only">ตะกร้าสินค้า</span>
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#f6efe2] bg-[#a87a4b] rounded-full transform translate-x-1/4 -translate-y-1/4 font-[family:var(--font-prompt)]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-[#3f2e1e]/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-[#f6efe2] shadow-xl p-6 flex flex-col h-full border-r border-[#3f2e1e]/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-[family:var(--font-prompt)] text-[#3f2e1e] tracking-widest">{store.name}</h2>
              <button
                type="button"
                className="text-[#3f2e1e] p-2 -mr-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">ปิดเมนู</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col space-y-6">
              <Link href="#" className="text-lg font-[family:var(--font-prompt)] text-[#3f2e1e]">เรื่องเล่า</Link>
              <Link href="#" className="text-lg font-[family:var(--font-prompt)] text-[#3f2e1e]">น้ำหอม</Link>
              <Link href="#" className="text-lg font-[family:var(--font-prompt)] text-[#3f2e1e]">เทียนหอม</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
