import Link from 'next/link';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
 *   │  Logo  Store        ┃  Search      │
 *   ├──────────┬─────────────────────────┤
 *   │ Cats     │                         │
 *   │ Filters  │  Products (4-col)       │
 *   │          │  Compare / Pricing      │
 *   └──────────┴─────────────────────────┘
 *
 * Search-first catalog. Sticky top bar + sticky sidebar.
 * Hero is hidden; store-header is rendered inline in the top bar.
 */
export function DesktopPatternB({ blocks, store }: PatternProps) {
  const countdown = findBlock(blocks, 'countdown');
  const compare = findBlock(blocks, 'compare');
  const pricing = findBlock(blocks, 'pricing-tier');
  const products = findBlock(blocks, 'product');

  return (
    <>
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
          <InlineHeader store={store} />
          <div className="ml-auto max-w-2xl flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={`Search ${store.name}...`} className="pl-9" />
            </div>
          </div>
        </div>
      </div>

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

function InlineHeader({ store }: { store: Store }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={store.branding.logoUrl} alt={store.name} />
        <AvatarFallback className="text-xs">{store.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="text-sm font-semibold">{store.name}</div>
      {store.badges?.official && (
        <Badge className="bg-blue-600 text-[10px] hover:bg-blue-600">Official</Badge>
      )}
      {store.badges?.b2b && (
        <Badge className="bg-purple-600 text-[10px] hover:bg-purple-600">B2B</Badge>
      )}
    </div>
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
            href={`/stores/${store.slug}/category/${encodeURIComponent(c.name)}`}
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
