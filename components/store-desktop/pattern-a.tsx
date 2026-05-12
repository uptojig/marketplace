import { BlockRenderer } from '@/lib/templates/renderer';
import { findBlock, remapForDesktop } from './utils';
import type { PatternProps } from './utils';

/**
 * Pattern A — Hero Narrative
 *
 * Used by: official-brand, premium-luxury, lookbook, single-product,
 *          storyteller, handmade
 *
 *   ┌─────────────────────────────────┐
 *   │      HERO (full width)          │
 *   ├─────────────────────────────────┤
 *   │     Store Header (overlap)      │
 *   │                                 │
 *   │     Story / Category            │
 *   │     Collection                  │
 *   │                                 │
 *   │     Products (4-col grid)       │
 *   └─────────────────────────────────┘
 *
 * Centered max-w-5xl narrative flow. Hero stretches edge-to-edge.
 */
export function DesktopPatternA({ blocks, store }: PatternProps) {
  const hero = findBlock(blocks, 'hero');
  const header = findBlock(blocks, 'store-header');
  const story = findBlock(blocks, 'story');
  const category = findBlock(blocks, 'category');
  const collection = findBlock(blocks, 'collection');
  const products = findBlock(blocks, 'product');
  const sticky = findBlock(blocks, 'sticky');
  const others = blocks.filter(
    (b) =>
      ![
        'hero',
        'store-header',
        'nav',
        'story',
        'category',
        'collection',
        'product',
        'sticky',
      ].includes(b.type),
  );

  return (
    <>
      {hero && (
        <div className="max-h-[80vh] overflow-hidden">
          <BlockRenderer block={hero} store={store} />
        </div>
      )}

      <div className="mx-auto max-w-5xl px-8">
        {header && (
          <div className="relative -mt-12">
            <BlockRenderer block={header} store={store} />
          </div>
        )}

        <div className="mt-12 space-y-12 pb-12">
          {category && <BlockRenderer block={category} store={store} />}
          {story && <BlockRenderer block={story} store={store} />}
          {collection && <BlockRenderer block={collection} store={store} />}
          {others.map((b) => (
            <BlockRenderer key={b.id ?? `${b.type}-${b.variant}`} block={b} store={store} />
          ))}
          {products && (
            <BlockRenderer block={remapForDesktop(products, 'A')} store={store} />
          )}
        </div>
      </div>

      {sticky && <BlockRenderer block={sticky} store={store} />}
    </>
  );
}
