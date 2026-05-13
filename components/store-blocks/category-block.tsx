import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Collection, Store } from '@/lib/templates/types';

export function CategoryBlock({ block, store }: BlockProps) {
  const collections = store.collections;

  switch (block.variant) {
    case 'anchor-circles':
      return <AnchorCircles collections={collections} />;
    case 'colored-tiles':
      return <ColoredTiles collections={collections} store={store} />;
    case 'chips':
      return <Chips collections={collections} store={store} />;
    case 'hidden':
      return null;
    default:
      return <AnchorCircles collections={collections} />;
  }
}

function AnchorCircles({ collections }: { collections: Collection[] }) {
  return (
    <div className="overflow-x-auto py-3">
      <div className="flex gap-4 px-4">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`#col-${c.id}`}
            className="flex w-16 shrink-0 flex-col items-center gap-1"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-muted">
              {c.imageUrl && (
                <Image src={c.imageUrl} alt={c.name} fill className="object-cover" sizes="56px" />
              )}
            </div>
            <span className="line-clamp-1 text-center text-xs">{c.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ColoredTiles({ collections, store }: { collections: Collection[]; store: Store }) {
  const colors = [
    'bg-pink-200 text-pink-900',
    'bg-blue-200 text-blue-900',
    'bg-yellow-200 text-yellow-900',
    'bg-green-200 text-green-900',
    'bg-purple-200 text-purple-900',
    'bg-orange-200 text-orange-900',
  ];

  return (
    <div className="grid grid-cols-3 gap-2 p-3">
      {collections.slice(0, 6).map((c, i) => (
        <Link
          key={c.id}
          href={`/stores/${store.slug}/category/${encodeURIComponent(c.name)}`}
          className={cn(
            'flex aspect-square flex-col items-center justify-center rounded-2xl p-3 text-center transition-transform active:scale-95',
            colors[i % colors.length],
          )}
        >
          <span className="text-sm font-semibold leading-tight">{c.name}</span>
          <span className="mt-1 text-xs opacity-70">{c.productIds.length} items</span>
        </Link>
      ))}
    </div>
  );
}

function Chips({ collections, store }: { collections: Collection[]; store: Store }) {
  return (
    <div className="overflow-x-auto py-2">
      <div className="flex gap-2 px-4">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/stores/${store.slug}/category/${encodeURIComponent(c.name)}`}
            className="shrink-0 rounded-full border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/80"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
