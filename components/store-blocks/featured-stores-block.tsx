import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { BlockProps } from '@/lib/templates/renderer';
import type { FeaturedStore } from '@/lib/templates/types';

function storeHref(slug: string): string {
  return `/stores/${slug}`;
}

export function FeaturedStoresBlock({ block }: BlockProps) {
  const stores = (block.data?.stores ?? []) as FeaturedStore[];
  if (stores.length === 0) return null;

  switch (block.variant) {
    case 'grid':
      return <Grid stores={stores} />;
    case 'carousel':
    default:
      return <Carousel stores={stores} />;
  }
}

function Carousel({ stores }: { stores: FeaturedStore[] }) {
  return (
    <div className="py-3">
      <div className="mb-2 flex items-baseline justify-between px-4">
        <h2 className="text-lg font-semibold">Featured stores</h2>
        <Link href="/stores" className="text-sm text-primary">
          See all
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2">
        {stores.map((s) => (
          <StoreCard key={s.id} store={s} width="w-44 lg:w-56" />
        ))}
      </div>
    </div>
  );
}

function Grid({ stores }: { stores: FeaturedStore[] }) {
  return (
    <div className="px-3 py-3">
      <h2 className="mb-3 px-1 text-lg font-semibold">Featured stores</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stores.map((s) => (
          <StoreCard key={s.id} store={s} />
        ))}
      </div>
    </div>
  );
}

function StoreCard({ store, width }: { store: FeaturedStore; width?: string }) {
  return (
    <Link
      href={storeHref(store.slug)}
      className={width ? `block shrink-0 ${width}` : 'block'}
    >
      <Card className="overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          {store.bannerUrl && (
            <Image
              src={store.bannerUrl}
              alt={store.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 224px"
            />
          )}
        </AspectRatio>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="-mt-7 h-8 w-8 shrink-0 border-2 border-background">
              <AvatarImage src={store.logoUrl} alt={store.name} />
              <AvatarFallback className="text-xs">{store.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <h3 className="flex-1 truncate text-sm font-medium">{store.name}</h3>
            {store.badges?.official && (
              <Badge className="bg-blue-600 px-1 text-[9px] hover:bg-blue-600">✓</Badge>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {store.rating.toFixed(1)} · {(store.followers / 1000).toFixed(1)}k
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
