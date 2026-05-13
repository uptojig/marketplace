import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * Top chrome used by platform pages on basketplace.co — seller import,
 * help, legal. Buyer chrome lives in
 * `components/storefront/chrome/ShopHeader.tsx` (per-store, mounted by
 * `app/stores/[slug]/layout.tsx`). Per the Shopify-like architecture
 * basketplace.co itself has no buyer flow — no cart icon, no account
 * link, no notifications. Buyer "account" lives at
 * `/stores/[slug]/account/*`, reached through the store header on each
 * store's own domain (or `/stores/[slug]/*` preview on basketplace.co).
 */
export function MarketplaceHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 lg:gap-4 lg:px-6 lg:py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="h-7 w-7 rounded bg-gradient-to-br from-blue-500 to-purple-600" />
          <span className="hidden text-base font-bold lg:inline">Basketplace</span>
        </Link>

        <form action="/search" className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="ค้นหาสินค้า ร้านค้า แบรนด์..."
              className="pl-9"
            />
          </div>
        </form>

      </div>
    </header>
  );
}
