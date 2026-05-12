import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Store } from '@/lib/templates/types';

export function HeroBlock({ block, store }: BlockProps) {
  switch (block.variant) {
    case 'cover':
      return <CoverHero store={store} />;
    case 'large':
      return <LargeHero store={store} />;
    case 'portrait':
      return <PortraitHero store={store} />;
    case 'video':
      return <VideoHero store={store} />;
    case 'live-tile':
      return <LiveTileHero store={store} />;
    case 'none':
      return null;
    default:
      return <CoverHero store={store} />;
  }
}

function CoverHero({ store }: { store: Store }) {
  return (
    <AspectRatio ratio={4 / 1} className="bg-muted">
      {store.branding.bannerUrl && (
        <Image
          src={store.branding.bannerUrl}
          alt={`${store.name} banner`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
    </AspectRatio>
  );
}

function LargeHero({ store }: { store: Store }) {
  return (
    <AspectRatio ratio={16 / 9} className="bg-muted">
      {store.branding.bannerUrl && (
        <Image
          src={store.branding.bannerUrl}
          alt={`${store.name} banner`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
    </AspectRatio>
  );
}

function PortraitHero({ store }: { store: Store }) {
  const src = store.branding.portraitUrl ?? store.branding.bannerUrl;
  return (
    <AspectRatio ratio={3 / 4} className="bg-muted">
      {src && (
        <Image
          src={src}
          alt={`${store.name} hero`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
    </AspectRatio>
  );
}

function VideoHero({ store }: { store: Store }) {
  if (!store.branding.videoUrl) return <CoverHero store={store} />;
  return (
    <AspectRatio ratio={16 / 9} className="bg-muted">
      <video
        src={store.branding.videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
        poster={store.branding.bannerUrl}
      />
    </AspectRatio>
  );
}

function LiveTileHero({ store }: { store: Store }) {
  const live = store.liveStream;
  if (!live?.isLive) return <CoverHero store={store} />;

  return (
    <AspectRatio ratio={16 / 9} className="bg-zinc-900">
      <div className="relative h-full w-full">
        {live.thumbnailUrl && (
          <Image
            src={live.thumbnailUrl}
            alt="Live stream"
            fill
            className="object-cover opacity-80"
            sizes="100vw"
          />
        )}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          LIVE
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
          {live.viewerCount.toLocaleString()} watching
        </div>
      </div>
    </AspectRatio>
  );
}
