import { BlockRenderer } from '@/lib/templates/renderer';
import { findBlock, remapForDesktop } from './utils';
import type { PatternProps } from './utils';

/**
 * Pattern C — Cover + Tabs + Grid
 *
 * Used by: classic, beauty-swatch, home-living, kids-toys, subscription
 *
 *   ┌─────────────────────────────────┐
 *   │      COVER BANNER               │
 *   ├─────────────────────────────────┤
 *   │  Logo Store ★4.8 12k     [+]    │
 *   ├─────────────────────────────────┤
 *   │  Home | Products | Promos       │
 *   ├─────────────────────────────────┤
 *   │  Swatches / Categories / Drops  │
 *   │                                 │
 *   │  Featured Collection            │
 *   │                                 │
 *   │  Products (4-col)               │
 *   └─────────────────────────────────┘
 *
 * Familiar shopping flow. Banner up top, content centered at max-w-7xl.
 */
export function DesktopPatternC({ blocks, store }: PatternProps) {
  const hero = findBlock(blocks, 'hero');
  const header = findBlock(blocks, 'store-header');
  const nav = findBlock(blocks, 'nav');
  const category = findBlock(blocks, 'category');
  const swatch = findBlock(blocks, 'swatch');
  const collection = findBlock(blocks, 'collection');
  const dropCal = findBlock(blocks, 'drop-calendar');
  const products = findBlock(blocks, 'product');

  return (
    <>
      {hero && <BlockRenderer block={hero} store={store} />}

      <div className="mx-auto max-w-7xl px-6">
        {header && (
          <div className="relative -mt-8">
            <BlockRenderer block={header} store={store} />
          </div>
        )}

        {nav && (
          <div className="mt-6">
            <BlockRenderer block={nav} store={store} />
          </div>
        )}

        <div className="mt-6 space-y-8 pb-12">
          {swatch && <BlockRenderer block={swatch} store={store} />}
          {category && <BlockRenderer block={category} store={store} />}
          {collection && <BlockRenderer block={collection} store={store} />}
          {dropCal && <BlockRenderer block={dropCal} store={store} />}
          {products && <BlockRenderer block={remapForDesktop(products, 'C')} store={store} />}
        </div>
      </div>
    </>
  );
}
