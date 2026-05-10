"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, Search } from "lucide-react";
import { useCart } from "@/lib/store/cart";

interface NavCategory {
  label: string;
  category: string;
}

interface Props {
  storeSlug: string;
  storeName: string;
  navCategories?: NavCategory[];
  /** Hex accent — defaults to emerald-600 (#10b981). */
  accent?: string;
}

export function MiniMopsHeader({
  storeSlug,
  storeName,
  navCategories = [],
  accent = "#10b981",
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useCart((s) =>
    s.lines.filter((l) => l.storeSlug === storeSlug).reduce((n, l) => n + l.qty, 0),
  );
  const categoryHref = (cat: string) =>
    `/stores/${storeSlug}/category/${encodeURIComponent(cat)}`;

  return (
    <nav className="bg-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:opacity-80"
              style={{ color: mobileMenuOpen ? accent : undefined }}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <Link
              href={`/stores/${storeSlug}`}
              className="text-2xl font-black tracking-tight flex items-center gap-2"
              style={{
                color: `color-mix(in srgb, ${accent} 80%, black)`,
              }}
            >
              <span
                className="p-1.5 rounded-lg"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
                }}
              >
                ✨
              </span>
              {storeName}
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link
              href={`/stores/${storeSlug}`}
              className="font-semibold border-b-2 px-1 py-2"
              style={{ color: accent, borderColor: accent }}
            >
              หน้าแรก
            </Link>
            {navCategories.slice(0, 4).map((c) => (
              <Link
                key={c.category}
                href={categoryHref(c.category)}
                className="text-gray-500 font-medium px-1 py-2 transition-colors hover:opacity-100"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "";
                }}
              >
                {c.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4 border-l pl-4 border-gray-200">
            <Link
              href={`/stores/${storeSlug}/search`}
              className="text-gray-500 hidden sm:block transition-colors"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "";
              }}
              aria-label="Search"
            >
              <Search size={22} />
            </Link>
            <Link
              href={`/stores/${storeSlug}/cart`}
              className="text-gray-500 relative transition-colors"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "";
              }}
              aria-label="Cart"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-3 shadow-inner">
          <Link
            href={`/stores/${storeSlug}`}
            onClick={() => setMobileMenuOpen(false)}
            className="block font-medium rounded-lg px-4 py-2"
            style={{
              color: accent,
              backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
            }}
          >
            หน้าแรก
          </Link>
          {navCategories.slice(0, 4).map((c) => (
            <Link
              key={c.category}
              href={categoryHref(c.category)}
              onClick={() => setMobileMenuOpen(false)}
              className="block font-medium text-gray-600 hover:bg-gray-50 rounded-lg px-4 py-2"
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
