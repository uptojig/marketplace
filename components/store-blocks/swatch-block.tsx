import type { BlockProps } from '@/lib/templates/renderer';
import type { Store } from '@/lib/templates/types';

export function SwatchBlock({ block, store }: BlockProps) {
  if (block.variant !== 'row') return null;

  const swatches = extractSwatches(store);

  return (
    <div className="overflow-x-auto border-b py-3">
      <div className="flex gap-3 px-4">
        {swatches.map((s) => (
          <button
            key={s.id}
            className="group flex shrink-0 flex-col items-center gap-1.5"
            type="button"
          >
            <div
              className="h-12 w-12 rounded-full ring-2 ring-transparent transition-all group-hover:ring-foreground group-active:scale-95"
              style={{ backgroundColor: s.color }}
              title={s.name}
            />
            <span className="line-clamp-1 max-w-[64px] text-center text-xs">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function extractSwatches(store: Store): { id: string; name: string; color: string }[] {
  const seen = new Map<string, { id: string; name: string; color: string }>();

  for (const product of store.products) {
    if (!product.variants) continue;
    for (const v of product.variants) {
      if (v.type === 'color' && v.swatch && !seen.has(v.id)) {
        seen.set(v.id, { id: v.id, name: v.name, color: v.swatch });
      }
    }
  }

  // Fallback demo palette (beauty shades)
  if (seen.size === 0) {
    return [
      { id: 's1', name: 'Nude', color: '#D4A89A' },
      { id: 's2', name: 'Rose', color: '#D17B7B' },
      { id: 's3', name: 'Coral', color: '#E89C6C' },
      { id: 's4', name: 'Berry', color: '#8B3A5C' },
      { id: 's5', name: 'Plum', color: '#5B3756' },
      { id: 's6', name: 'Wine', color: '#6B1F2C' },
    ];
  }

  return Array.from(seen.values());
}
