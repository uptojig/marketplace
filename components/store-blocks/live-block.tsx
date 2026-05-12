import Image from 'next/image';
import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Store } from '@/lib/templates/types';

export function LiveBlock({ block, store }: BlockProps) {
  if (!store.liveStream) return null;

  switch (block.variant) {
    case 'tile':
      return <LiveTile store={store} />;
    case 'replay-carousel':
      return <ReplayCarousel store={store} />;
    default:
      return null;
  }
}

function LiveTile({ store }: { store: Store }) {
  const live = store.liveStream!;
  if (!live.isLive) return null;

  return (
    <div className="p-3">
      <Card className="overflow-hidden">
        <AspectRatio ratio={16 / 9} className="relative">
          {live.thumbnailUrl ? (
            <Image src={live.thumbnailUrl} alt="Live now" fill className="object-cover" sizes="100vw" />
          ) : (
            <div className="h-full w-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge className="absolute left-3 top-3 bg-red-600 hover:bg-red-600">
            <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </Badge>
          <div className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
            👁 {live.viewerCount.toLocaleString()}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            <Avatar className="h-9 w-9 border-2 border-white">
              <AvatarImage src={live.hostAvatarUrl} />
              <AvatarFallback>{live.hostName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{live.hostName}</div>
            </div>
          </div>
        </AspectRatio>
      </Card>
    </div>
  );
}

function ReplayCarousel({ store }: { store: Store }) {
  const replays = store.liveStream?.replays ?? [];
  if (replays.length === 0) return null;

  return (
    <div className="py-3">
      <h3 className="mb-2 px-4 text-sm font-semibold">Past lives</h3>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2">
        {replays.map((r) => (
          <div key={r.id} className="w-32 shrink-0">
            <Card className="overflow-hidden">
              <AspectRatio ratio={9 / 16} className="relative">
                <Image src={r.thumbnailUrl} alt={r.title} fill className="object-cover" sizes="128px" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="h-8 w-8 fill-white text-white" />
                </div>
                <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                  {Math.floor(r.duration / 60)}:
                  {(r.duration % 60).toString().padStart(2, '0')}
                </div>
              </AspectRatio>
              <CardContent className="p-2">
                <p className="line-clamp-2 text-xs">{r.title}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
