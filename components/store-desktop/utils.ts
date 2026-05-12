import type { Block, DesktopPattern, Store, Template } from '@/lib/templates/types';

export interface PatternProps {
  blocks: Block[];
  store: Store;
  template: Template;
}

/**
 * Find the first block of given type, optionally filtered by variant.
 */
export function findBlock(
  blocks: Block[],
  type: Block['type'],
  variant?: string,
): Block | undefined {
  return blocks.find((b) => b.type === type && (variant ? b.variant === variant : true));
}

/**
 * Find all blocks of a given type.
 */
export function findBlocks(blocks: Block[], type: Block['type']): Block[] {
  return blocks.filter((b) => b.type === type);
}

/**
 * Remap a mobile block to its desktop-appropriate variant.
 *
 * - product.grid-2 → product.grid-4-desktop  (4-col on lg+)
 * - product.grid-3-dense stays (already dense)
 * - video-feed.grid-2-portrait → grid-3-portrait-desktop (3-col on lg+)
 */
export function remapForDesktop(block: Block, _pattern?: DesktopPattern): Block {
  if (block.type === 'product') {
    if (block.variant === 'grid-2') {
      return { ...block, variant: 'grid-4-desktop' };
    }
  }

  if (block.type === 'video-feed' && block.variant === 'grid-2-portrait') {
    return { ...block, variant: 'grid-3-portrait-desktop' };
  }

  return block;
}
