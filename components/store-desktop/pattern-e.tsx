import { BlockRenderer } from '@/lib/templates/renderer';
import type { PatternProps } from './utils';

/**
 * Pattern E — Flat / Linear
 *
 * Used by: PDP pages, account pages, MDX content
 *
 *   ┌─────────────────────────────────┐
 *   │   Block 1 (full width / center) │
 *   │   Block 2                       │
 *   │   Block 3                       │
 *   └─────────────────────────────────┘
 *
 * No hero/sidebar choreography — blocks render in order, centered with
 * a comfortable max-width. Suits product detail, account flows, and
 * static MDX pages where the content drives the layout.
 */
export function DesktopPatternE({ blocks, store }: PatternProps) {
  return (
    <div className="mx-auto max-w-5xl">
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id ?? `${block.type}-${block.variant}`}
          block={block}
          store={store}
        />
      ))}
    </div>
  );
}
