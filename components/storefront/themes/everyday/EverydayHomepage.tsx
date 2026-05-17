/**
 * EverydayHomepage — clean Shopee-style consumer-retail homepage.
 * Bold red hero with store name + tagline, then the shared
 * SimpleHomepage scaffold (featured grid + brand-story stripe).
 */

import type { Store } from '@prisma/client';
import { SimpleHomepage } from '../_shared/SimpleHomepage';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
}

export async function EverydayHomepage({ store }: Props) {
  return (
    <SimpleHomepage
      store={store}
      Banner={EverydayBanner}
      accentColor="#DC2626"
      primaryColor="#DC2626"
      featuredLabel="★ ใหม่ล่าสุด"
      featuredTitle="สินค้ามาใหม่"
    />
  );
}

function EverydayBanner({
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
      className="px-4 py-10 sm:py-14 lg:py-20"
      style={{ background: '#0A0A0A', color: '#ffffff' }}
    >
      <div className="mx-auto max-w-7xl text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300">
          {storeName}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          {tagline || `ยินดีต้อนรับสู่ ${storeName}`}
        </h1>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] sm:text-sm">
          ⚡ Flash sale · ลดสูงสุด 30%
        </div>
      </div>
    </section>
  );
}
