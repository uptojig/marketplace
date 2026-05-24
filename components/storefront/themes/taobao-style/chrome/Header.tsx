'use client';
import React from 'react';
import { Search, ShoppingCart, Zap, Tag, Bell } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
}

/**
 * taobao-style — bold marketplace header.
 *
 * Layout:
 *   row 1   small utility links (notifications · seller center)
 *   row 2   logo + huge orange search bar + cart pill (Taobao classic)
 *   row 3   horizontal category strip with a "⚡ Flash" highlight chip
 */
export function Header({ storeSlug, storeName, storeLogoUrl, categories }: HeaderProps) {
  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
  };

  const cartCount = useCart((s) => s.countForStore(storeSlug));

  return (
    <header
      className="bg-white border-b font-[family:var(--font-prompt)]"
      style={{ borderColor: 'var(--shop-border)' }}
    >
      {/* Row 1 — utility */}
      <div
        className="border-b text-[11px] font-[family:var(--font-prompt)]"
        style={{ borderColor: 'var(--shop-border)', background: 'var(--shop-bg)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-[color:var(--shop-ink-muted)]">
          <span className="hidden sm:inline">ยินดีต้อนรับสู่ {storeName}</span>
          <div className="flex items-center gap-4 ml-auto">
            <span className="flex items-center gap-1">
              <Bell size={11} /> แจ้งเตือนดีล
            </span>
            <span className="hidden sm:inline">ติดตามคำสั่งซื้อ</span>
            <span className="hidden md:inline">ดาวน์โหลดแอพ</span>
          </div>
        </div>
      </div>

      {/* Row 2 — logo + search + cart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo — image when present, otherwise mark + name fallback */}
          <a href={urls.home} className="flex items-center gap-2 shrink-0">
            {storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="h-10 sm:h-12 w-auto object-contain"
              />
            ) : (
              <>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-[family:var(--font-kanit)] font-black text-lg shadow-md"
                  style={{ background: 'var(--shop-primary-gradient, var(--shop-primary))' }}
                >
                  淘
                </div>
                <span
                  className="font-[family:var(--font-kanit)] font-black text-xl sm:text-2xl tracking-tight uppercase truncate max-w-[180px]"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {storeName}
                </span>
              </>
            )}
          </a>

          {/* Search bar — Taobao classic thick orange border */}
          <div
            className="flex-1 flex items-stretch rounded-full overflow-hidden border-2 max-w-2xl"
            style={{ borderColor: 'var(--shop-primary)' }}
          >
            <input
              type="text"
              placeholder="ค้นหาสินค้ายอดฮิต · แฟลชเซลล์ · ส่งฟรี..."
              className="flex-1 px-3 sm:px-4 py-2 text-sm bg-white text-[color:var(--shop-ink)] focus:outline-none placeholder:text-[color:var(--shop-ink-muted)]"
              style={{ caretColor: 'var(--shop-primary)' }}
            />
            <button
              className="px-4 sm:px-6 text-white text-sm font-[family:var(--font-prompt)] font-bold flex items-center gap-1.5 transition-opacity hover:opacity-90"
              style={{ background: 'var(--shop-primary-gradient, var(--shop-primary))' }}
              aria-label="ค้นหา"
            >
              <Search size={16} />
              <span className="hidden sm:inline">ค้นหา</span>
            </button>
          </div>

          {/* Cart pill */}
          <a
            href={urls.cart}
            className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md font-[family:var(--font-prompt)] font-bold text-sm transition-colors"
            style={{
              background: 'var(--shop-bg-soft)',
              color: 'var(--shop-primary)',
              border: `1px solid var(--shop-primary)`,
            }}
            aria-label={`ตะกร้า ${cartCount} ชิ้น`}
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">ตะกร้า</span>
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center text-white"
                style={{ background: 'var(--shop-primary)' }}
              >
                {cartCount}
              </span>
            )}
          </a>
        </div>
      </div>

      {/* Row 3 — category strip with flash chip */}
      <div
        className="border-t"
        style={{ borderColor: 'var(--shop-border)', background: 'var(--shop-bg-soft)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar text-sm font-[family:var(--font-prompt)] font-semibold">
          {/* Flash chip */}
          <a
            href={`${urls.shop}?cat=flash`}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide shrink-0 text-white shadow-sm"
            style={{ background: 'var(--shop-primary-gradient, var(--shop-primary))' }}
          >
            <Zap size={12} fill="currentColor" /> Flash Sale
          </a>
          <a
            href={`${urls.shop}?cat=hot`}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide shrink-0"
            style={{
              background: 'var(--shop-accent)',
              color: 'var(--shop-ink)',
              border: `1px solid var(--shop-ink)`,
            }}
          >
            <Tag size={12} /> HOT
          </a>

          {/* Divider */}
          <span className="w-px h-4 shrink-0" style={{ background: 'var(--shop-border)' }} />

          <a
            href={urls.shop}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[color:var(--shop-primary)]"
            style={{ color: 'var(--shop-ink)' }}
          >
            ทั้งหมด
          </a>
          {categories.slice(0, 12).map((c) => (
            <a
              key={c}
              href={`${urls.shop}?cat=${encodeURIComponent(c)}`}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[color:var(--shop-primary)]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {c}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
