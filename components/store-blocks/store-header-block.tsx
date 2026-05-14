import Image from 'next/image';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Store } from '@/lib/templates/types';

export function StoreHeaderBlock({ block, store }: BlockProps) {
  switch (block.variant) {
    case 'standard':
      return <StandardHeader store={store} />;
    case 'compact':
      return <CompactHeader store={store} />;
    case 'with-badge':
      return <WithBadgeHeader store={store} badgeType={block.data?.badgeType as string} />;
    case 'with-portrait':
      return <WithPortraitHeader store={store} />;
    default:
      return <StandardHeader store={store} />;
  }
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function StandardHeader({ store }: { store: Store }) {
  const hasLogo = !!store.branding.logoUrl;
  return (
    <div className="relative -mt-8 flex items-end gap-3 px-4">
      <Avatar className="h-16 w-16 border-4 border-background shadow-sm">
        <AvatarImage src={store.branding.logoUrl} alt={store.name} />
        <AvatarFallback>{store.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 pb-1">
        {!hasLogo && (
          <h1 className="text-lg font-semibold truncate">{store.name}</h1>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {store.rating.toFixed(1)}
          </span>
          <span>·</span>
          <span>{formatFollowers(store.followers)} followers</span>
        </div>
      </div>
      <Button size="sm" className="mb-1">+ Follow</Button>
    </div>
  );
}

function CompactHeader({ store }: { store: Store }) {
  const hasLogo = !!store.branding.logoUrl;
  return (
    <div className="flex items-center gap-2 border-b px-4 py-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={store.branding.logoUrl} alt={store.name} />
        <AvatarFallback className="text-xs">{store.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      {!hasLogo && (
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium">{store.name}</div>
        </div>
      )}
      {hasLogo && <div className="flex-1 min-w-0" />}
      <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        {store.rating.toFixed(1)}
      </div>
    </div>
  );
}

function WithBadgeHeader({ store, badgeType }: { store: Store; badgeType?: string }) {
  const hasLogo = !!store.branding.logoUrl;
  return (
    <div className="relative -mt-8 flex items-end gap-3 px-4">
      <Avatar className="h-16 w-16 rounded-lg border-4 border-background shadow-sm">
        <AvatarImage src={store.branding.logoUrl} alt={store.name} />
        <AvatarFallback className="rounded-lg">{store.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center gap-2">
          {!hasLogo && (
            <h1 className="truncate text-lg font-semibold">{store.name}</h1>
          )}
          {badgeType === 'official' && (
            <Badge className="bg-blue-600 hover:bg-blue-700">Official</Badge>
          )}
          {badgeType === 'b2b' && (
            <Badge className="bg-purple-600 hover:bg-purple-700">B2B</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {store.rating.toFixed(1)}
          </span>
          <span>·</span>
          <span>{formatFollowers(store.followers)} followers</span>
        </div>
      </div>
      <Button size="sm" className="mb-1">+ Follow</Button>
    </div>
  );
}

function WithPortraitHeader({ store }: { store: Store }) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-4">
      {store.branding.portraitUrl && (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
          <Image
            src={store.branding.portraitUrl}
            alt={store.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {!store.branding.portraitUrl && (
          <h1 className="truncate text-base font-semibold">{store.name}</h1>
        )}
        {store.description && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{store.description}</p>
        )}
      </div>
      <Button size="sm" variant="outline">Follow</Button>
    </div>
  );
}
