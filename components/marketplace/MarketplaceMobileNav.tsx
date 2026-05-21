'use client';

/**
 * MarketplaceMobileNav — slide-from-right drawer used inside
 * MarketplaceHeader on mobile (<md).
 *
 * Client component (state for open/close). Kept tiny so the rest of
 * the header can stay server-rendered for the auth + caching wins
 * that Next.js layouts offer.
 *
 * Per Stitch DESIGN.md: drawer slides from RIGHT (not top) for better
 * one-handed thumb reach on Thai-language phones (long words → wider
 * tap targets). Same pattern as vendor ShopHeader's mobile drawer.
 */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  items: ReadonlyArray<NavItem>;
}

export function MarketplaceMobileNav({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const drawerContent = open && (
    <div className="theme-marketplace">
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-mp-ink/30 backdrop-blur-sm md:hidden"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-[70] w-[85%] max-w-[320px] bg-mp-cream shadow-xl md:hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-mp-border">
          <span
            className="text-lg font-bold text-mp-coral-dark"
            style={{ fontFamily: 'var(--mp-font-display)' }}
          >
            Basketplace
          </span>
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md text-mp-ink hover:bg-mp-cream-alt transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col p-2">
          {items.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-[16px] font-medium text-mp-ink hover:bg-mp-cream-alt rounded-md transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-mp-border p-4 space-y-3">
          <Link
            href="/signin"
            onClick={() => setOpen(false)}
            className="block w-full text-center px-4 py-3 text-[15px] font-semibold text-mp-ink rounded-xl border border-mp-border hover:bg-mp-cream-alt transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/apply"
            onClick={() => setOpen(false)}
            className="block w-full text-center px-4 py-3 text-[15px] font-semibold text-white bg-mp-coral rounded-xl hover:bg-mp-coral-dark transition-colors"
          >
            เปิดร้าน
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="เปิดเมนู"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-mp-ink hover:bg-mp-cream-alt transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mounted && typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null}
    </>
  );
}
