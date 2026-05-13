import Image from 'next/image';
import Link from 'next/link';
import type { BlockProps } from '@/lib/templates/renderer';
import type { MarketplaceCategory, Store } from '@/lib/templates/types';

/**
 * Per-store category link. Uses BlockProps.store context.
 *
 * Tradeoff: this block is named "marketplace-categories" but currently
 * routes per-store (because no cross-store /category/[slug] route exists
 * in codebase yet). If/when a global category route is added, swap to:
 *
 *   function categoryHref(slug: string): string {
 *     return `/category/${slug}`;
 *   }
 *
 * And drop the `store` arg.
 */
function categoryHref(store: Store, slug: string): string {
  return `/stores/${store.slug}/category/${slug}`;
}

export function MarketplaceCategoriesBlock({ block, store }: BlockProps) {
  const categories = (block.data?.categories ?? []) as MarketplaceCategory[];
  if (categories.length === 0) return null;

  return (
    <div className="px-3 py-4">
      <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={categoryHref(store, c.slug)}
            className="flex flex-col items-center gap-1.5 transition active:scale-95"
          >
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl lg:h-16 lg:w-16">
              {c.iconUrl ? (
                <Image
                  src={c.iconUrl}
                  alt={c.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span>{c.emoji ?? '📦'}</span>
              )}
            </div>
            <span className="line-clamp-2 text-center text-xs">{c.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
