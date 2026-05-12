import type { ComponentType } from 'react';
import { HeroBlock } from '@/components/store-blocks/hero-block';
import { StoreHeaderBlock } from '@/components/store-blocks/store-header-block';
import { ProductBlock } from '@/components/store-blocks/product-block';
import { NavBlock } from '@/components/store-blocks/nav-block';
import { CollectionBlock } from '@/components/store-blocks/collection-block';
import { CategoryBlock } from '@/components/store-blocks/category-block';
import { SwatchBlock } from '@/components/store-blocks/swatch-block';
import { LiveBlock } from '@/components/store-blocks/live-block';
import { VideoFeedBlock } from '@/components/store-blocks/video-feed-block';
import { CompareBlock } from '@/components/store-blocks/compare-block';
import { PricingTierBlock } from '@/components/store-blocks/pricing-tier-block';
import { CountdownBlock } from '@/components/store-blocks/countdown-block';
import { DropCalendarBlock } from '@/components/store-blocks/drop-calendar-block';
import { StoryBlock } from '@/components/store-blocks/story-block';
import { StickyBlock } from '@/components/store-blocks/sticky-block';
import { FeaturedStoresBlock } from '@/components/store-blocks/featured-stores-block';
import { MarketplaceCategoriesBlock } from '@/components/store-blocks/marketplace-categories-block';
import { ProductDetailBlock } from '@/components/store-blocks/product-detail-block';
import { DesktopPatternA } from '@/components/store-desktop/pattern-a';
import { DesktopPatternB } from '@/components/store-desktop/pattern-b';
import { DesktopPatternC } from '@/components/store-desktop/pattern-c';
import { DesktopPatternD } from '@/components/store-desktop/pattern-d';
import { DesktopPatternE } from '@/components/store-desktop/pattern-e';
import type { PatternProps } from '@/components/store-desktop/utils';
import type { Block, BlockType, DesktopPattern, Store, Template } from './types';

export interface BlockProps {
  block: Block;
  store: Store;
}

/**
 * Block type → component map.
 * Add new block here after creating its component file.
 */
const BLOCK_COMPONENTS: Record<BlockType, ComponentType<BlockProps>> = {
  hero: HeroBlock,
  'store-header': StoreHeaderBlock,
  product: ProductBlock,
  nav: NavBlock,
  collection: CollectionBlock,
  category: CategoryBlock,
  swatch: SwatchBlock,
  live: LiveBlock,
  'video-feed': VideoFeedBlock,
  compare: CompareBlock,
  'pricing-tier': PricingTierBlock,
  countdown: CountdownBlock,
  'drop-calendar': DropCalendarBlock,
  story: StoryBlock,
  sticky: StickyBlock,
  'featured-stores': FeaturedStoresBlock,
  'marketplace-categories': MarketplaceCategoriesBlock,
  'product-detail': ProductDetailBlock,
};

/**
 * Desktop pattern → layout component map.
 *
 * A — Hero narrative (editorial, luxury, single-product)
 * B — Sidebar catalog (search-first, dense SKU)
 * C — Cover + tabs + grid (default shopping)
 * D — Feed / stream (live, video)
 * E — Flat / linear (PDP, account, MDX content)
 */
const DESKTOP_PATTERNS: Record<DesktopPattern, ComponentType<PatternProps>> = {
  A: DesktopPatternA,
  B: DesktopPatternB,
  C: DesktopPatternC,
  D: DesktopPatternD,
  E: DesktopPatternE,
};

export function BlockRenderer({ block, store }: BlockProps) {
  const Component = BLOCK_COMPONENTS[block.type];

  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="m-2 rounded-md border border-dashed border-amber-500 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Block <code className="font-mono">{block.type}</code> (variant{' '}
          <code className="font-mono">{block.variant}</code>) not yet implemented.
        </div>
      );
    }
    return null;
  }

  return <Component block={block} store={store} />;
}

export interface StoreRendererProps {
  store: Store;
  template: Template;
}

/**
 * Renders both mobile and desktop layouts.
 * CSS hides whichever doesn't match the viewport (lg breakpoint = 1024px).
 *
 * Mobile: linear blocks (template.mobileBlocks)
 * Desktop: dispatched to DesktopPattern A/B/C/D for layout structure.
 *          Uses template.desktopBlocks if set, else mobileBlocks.
 */
export function StoreRenderer({ store, template }: StoreRendererProps) {
  const mobileBlocks = template.mobileBlocks;
  const desktopBlocks = template.desktopBlocks ?? template.mobileBlocks;
  const Pattern = DESKTOP_PATTERNS[template.desktopPattern];

  return (
    <>
      {/* Mobile layout */}
      <div className="lg:hidden">
        {mobileBlocks.map((block) => (
          <BlockRenderer
            key={block.id ?? `${block.type}-${block.variant}`}
            block={block}
            store={store}
          />
        ))}
      </div>

      {/* Desktop layout — pattern dispatcher */}
      <div className="hidden lg:block">
        <Pattern blocks={desktopBlocks} store={store} template={template} />
      </div>
    </>
  );
}
