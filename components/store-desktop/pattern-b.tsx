import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlockRenderer } from '@/lib/templates/renderer';
import { findBlock, remapForDesktop } from './utils';
import type { PatternProps } from './utils';
import type { Store } from '@/lib/templates/types';

/**
 * Pattern B — Sidebar Catalog
 *
 * Used by: catalog-dense, tech-compare, sport-active, wholesale-b2b,
 *          flash-deal, vintage
 *
 *   ┌────────────────────────────────────┐
 *   │  Logo  Store        ┃  Search      │  ← ShopHeader (from layout)
 *   ├──────────┬─────────────────────────┤
 *   │ Cats     │                         │
 *   │ Filters  │  Products (4-col)       │
 *   │          │  Compare / Pricing      │
 *   └──────────┴─────────────────────────┘
 *
 * Search-first catalog with sticky category + filter sidebar.
 * ShopHeader from app/stores/[slug]/layout.tsx already supplies the
 * top chrome (logo + search + cart/wishlist/account), so this pattern
 * MUST NOT render its own inline header — doing so stacked two
 * headers on every Pattern B store.
 */
export function DesktopPatternB({ blocks, store }: PatternProps) {
  const countdown = findBlock(blocks, 'countdown');
  const compare = findBlock(blocks, 'compare');
  const pricing = findBlock(blocks, 'pricing-tier');
  const products = findBlock(blocks, 'product');

  return (
    <>
      {countdown && <BlockRenderer block={countdown} store={store} />}

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-[260px_1fr] gap-6">
          <aside className="sticky top-20 max-h-[calc(100vh-5rem)] space-y-6 self-start overflow-y-auto pr-2">
            <SidebarCategories store={store} />
            <SidebarFilters />
          </aside>

          <main className="min-w-0 space-y-6">
            {compare && <BlockRenderer block={compare} store={store} />}
            {pricing && <BlockRenderer block={pricing} store={store} />}
            {products && <BlockRenderer block={remapForDesktop(products, 'B')} store={store} />}
          </main>
        </div>
      </div>
    </>
  );
}

function SidebarCategories({ store }: { store: Store }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Categories
      </h3>
      <div className="space-y-0.5">
        {store.collections.map((c) => (
          <Link
            key={c.id}
            href={`/store/${store.slug}/collection/${c.id}`}
            className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-accent"
          >
            <span>{c.name}</span>
            <span className="text-xs text-muted-foreground">{c.productIds.length}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SidebarFilters() {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Filters
      </h3>
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 text-xs font-medium">Price range</div>
          <div className="flex gap-2">
            <Input type="number" placeholder="Min" className="h-8 text-xs" />
            <Input type="number" placeholder="Max" className="h-8 text-xs" />
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium">Rating</div>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            ★ 4.0 & up
          </Button>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium">Availability</div>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            In stock now
          </Button>
        </div>
      </div>
    </div>
  );
}
