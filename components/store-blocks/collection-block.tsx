import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Collection, Store } from '@/lib/templates/types';

export function CollectionBlock({ block, store }: BlockProps) {
  const collections = filterCollections(store.collections, block.data);

  switch (block.variant) {
    case 'featured-card':
      return <FeaturedCard collections={collections} store={store} />;
    case 'carousel':
      return <CarouselCollections collections={collections} store={store} />;
    case 'lookbook':
      return <LookbookCollections collections={collections} store={store} />;
    case 'scene':
      return <SceneCollections collections={collections} store={store} />;
    default:
      return <FeaturedCard collections={collections} store={store} />;
  }
}

function filterCollections(all: Collection[], data?: Record<string, unknown>): Collection[] {
  if (data?.source === 'featured') return all.filter((c) => c.featured);
  return all;
}

function FeaturedCard({ collections, store }: { collections: Collection[]; store: Store }) {
  const featured = collections[0];
  if (!featured) return null;

  return (
    <div className="px-3 py-4">
      <Card className="overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          {featured.imageUrl ? (
            <Image src={featured.imageUrl} alt={featured.name} fill className="object-cover" sizes="100vw" />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </AspectRatio>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold">{featured.name}</h2>
          {featured.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{featured.description}</p>
          )}
          <Link
            href={`/stores/${store.slug}/category/${encodeURIComponent(featured.name)}`}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function CarouselCollections({ collections, store }: { collections: Collection[]; store: Store }) {
  return (
    <div className="py-3">
      <div className="flex gap-3 overflow-x-auto px-3 pb-2">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/stores/${store.slug}/category/${encodeURIComponent(c.name)}`}
            className="w-40 shrink-0"
          >
            <Card className="overflow-hidden">
              <AspectRatio ratio={1}>
                {c.imageUrl ? (
                  <Image src={c.imageUrl} alt={c.name} fill className="object-cover" sizes="160px" />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </AspectRatio>
              <CardContent className="p-2">
                <h3 className="truncate text-sm font-medium">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.productIds.length} items</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function LookbookCollections({ collections, store }: { collections: Collection[]; store: Store }) {
  return (
    <div className="space-y-6 px-4 py-6">
      {collections.map((c, i) => (
        <Link key={c.id} href={`/stores/${store.slug}/category/${encodeURIComponent(c.name)}`} className="block">
          <div className={cn('grid gap-3', i % 2 === 0 ? 'grid-cols-1' : 'grid-cols-2')}>
            <AspectRatio ratio={i % 2 === 0 ? 4 / 3 : 3 / 4}>
              {c.imageUrl ? (
                <Image src={c.imageUrl} alt={c.name} fill className="object-cover" sizes="100vw" />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </AspectRatio>
            <div className={cn(i % 2 === 0 ? 'mt-2' : 'flex flex-col justify-center')}>
              <h2 className="text-xl tracking-wide">{c.name}</h2>
              {c.description && (
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SceneCollections({ collections, store }: { collections: Collection[]; store: Store }) {
  return (
    <div className="space-y-3 px-3 py-3">
      {collections.map((c) => (
        <Link key={c.id} href={`/stores/${store.slug}/category/${encodeURIComponent(c.name)}`} className="block">
          <Card className="overflow-hidden">
            <AspectRatio ratio={3 / 2}>
              {c.imageUrl ? (
                <Image src={c.imageUrl} alt={c.name} fill className="object-cover" sizes="100vw" />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </AspectRatio>
            <CardContent className="p-3">
              <h3 className="font-medium">{c.name}</h3>
              <p className="text-xs text-muted-foreground">
                {c.productIds.length} pieces in this room
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
