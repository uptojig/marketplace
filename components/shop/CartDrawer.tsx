"use client";

/**
 * Legacy CartDrawer — now a THIN TRIGGER that delegates to the global
 * slide-out drawer mounted from `app/stores/[slug]/layout.tsx`. Kept as
 * a re-export so GlobalHeader (multi-page v12 schema renderer path)
 * still shows a cart icon in the top bar without rendering a second
 * drawer panel.
 *
 * The original component shipped its own DrawerContent with hardcoded
 * mock items ("รองเท้าวิ่ง SPEEDFORCE") — which caused two side-effects
 * once the new global drawer landed in PR #161:
 *   1. Two drawer panels mounted on the same page.
 *   2. The header cart count came from local useState (always 1) while
 *      the new drawer read from `useCart` (real number).
 *
 * Now this file ONLY renders the trigger button. Clicking it calls
 * `useCart.openDrawer()` and the global <CartDrawer> in layout.tsx
 * handles the rest.
 */
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export function CartDrawer() {
  const openDrawer = useCart((s) => s.openDrawer);
  const count = useCart((s) => s.lines.reduce((acc, l) => acc + l.qty, 0));

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label="เปิดตะกร้า"
      className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Backwards-compat — some callers still navigate to `/cart` directly
 * instead of using the drawer. Keep the link export so those don't 404.
 */
export function CartLink({ storeSlug }: { storeSlug?: string }) {
  return (
    <Link
      href={storeSlug ? `/stores/${storeSlug}/cart` : '/cart'}
      className="text-sm font-medium"
    >
      ดูตะกร้าเต็มหน้า →
    </Link>
  );
}
