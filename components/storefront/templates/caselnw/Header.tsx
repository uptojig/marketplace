"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Menu,
  Search,
  Heart,
  X,
} from "lucide-react";
import { useCart } from "@/lib/store/cart";

interface NavCategory {
  label: string;
  category: string;
}

interface Props {
  storeSlug: string;
  storeName: string;
  navCategories?: NavCategory[];
  /** Hex accent used for cart-badge / brand square. Defaults to caselnw orange. */
  accent?: string;
}

export function CaselNwHeader({
  storeSlug,
  storeName,
  navCategories = [],
  accent = "#fb923c",
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useCart((s) => s.count());
  const categoryHref = (cat: string) =>
    `/stores/${storeSlug}/category/${encodeURIComponent(cat)}`;

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-slate-900 text-slate-100 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <span className="hidden sm:block">
            ส่งฟรีเมื่อช้อปครบ ฿499 · ส่งเร็ว 1-2 วันทำการ
          </span>
          <span className="sm:hidden">ส่งฟรีครบ ฿499</span>
          <span
            className="font-medium tracking-wide"
            style={{ color: accent }}
          >
            {storeName.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden -ml-1 p-2 text-slate-700"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <Link
              href={`/stores/${storeSlug}`}
              className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2"
            >
              <span
                className="inline-flex items-center justify-center size-8 rounded-lg bg-slate-900"
                style={{ color: accent }}
              >
                ◉
              </span>
              <span>{storeName}</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
            <Link href={`/stores/${storeSlug}`} className="hover:text-slate-900">
              ใหม่ล่าสุด
            </Link>
            {navCategories.slice(0, 4).map((c) => (
              <Link
                key={c.category}
                href={categoryHref(c.category)}
                className="hover:text-slate-900"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href={`/stores/${storeSlug}/products?tab=sale`}
              className="text-rose-600 hover:text-rose-700"
            >
              ลดราคา
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 text-slate-700">
            <Link
              href={`/stores/${storeSlug}/search`}
              className="p-2 hover:text-slate-900 hidden sm:block"
              aria-label="Search"
            >
              <Search size={20} />
            </Link>
            <Link
              href={`/stores/${storeSlug}/wishlist`}
              className="p-2 hover:text-slate-900 hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>
            <Link
              href={`/stores/${storeSlug}/cart`}
              className="relative p-2 hover:text-slate-900"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 inline-flex items-center justify-center size-4 text-[10px] font-bold rounded-full text-white"
                  style={{ backgroundColor: accent }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 flex">
            <div className="bg-white w-72 max-w-[80%] h-full p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold">{storeName}</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>
              <Link
                href={`/stores/${storeSlug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium"
              >
                ใหม่ล่าสุด
              </Link>
              {navCategories.slice(0, 6).map((c) => (
                <Link
                  key={c.category}
                  href={categoryHref(c.category)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium"
                >
                  {c.label}
                </Link>
              ))}
              <Link
                href={`/stores/${storeSlug}/products?tab=sale`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-semibold text-rose-600"
              >
                ลดราคา
              </Link>
            </div>
            <button
              type="button"
              aria-label="Close overlay"
              className="flex-1"
              onClick={() => setMobileMenuOpen(false)}
            />
          </div>
        )}
      </header>
    </>
  );
}
