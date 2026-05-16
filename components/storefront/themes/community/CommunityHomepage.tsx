/**
 * CommunityHomepage — live-commerce / video-feed homepage with vivid
 * purple-pink gradient hero + simulated LIVE chip.
 */

import type { Store } from '@prisma/client';
import { SimpleHomepage } from '../_shared/SimpleHomepage';
import { COMMUNITY_TOKENS } from '@/lib/landing/community';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
}

export async function CommunityHomepage({ store }: Props) {
  return (
    <SimpleHomepage
      store={store}
      Banner={CommunityBanner}
      accentColor={COMMUNITY_TOKENS.accent}
      primaryColor={COMMUNITY_TOKENS.primary}
      featuredLabel="📺 NOW TRENDING"
      featuredTitle="สินค้าที่ KOL กำลังพรีวิว"
    />
  );
}

function CommunityBanner({
  storeName,
  tagline,
}: {
  storeSlug: string;
  storeName: string;
  bannerUrl: string | null;
  tagline: string | null;
}) {
  return (
    <section
      className="relative overflow-hidden px-4 py-12 sm:py-16 lg:py-20"
      style={{ background: COMMUNITY_TOKENS.primaryGradient, color: '#ffffff' }}
    >
      <div className="mx-auto max-w-7xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          LIVE now · 1.2K viewers
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          {tagline || `${storeName} live-commerce`}
        </h1>
        <p className="mt-4 text-sm opacity-90 sm:text-base">
          KOL พรีวิวสด · video feed ของจริง · ช้อปได้ในไลฟ์
        </p>
      </div>
    </section>
  );
}
