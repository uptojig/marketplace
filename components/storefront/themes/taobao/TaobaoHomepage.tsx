/**
 * TaobaoHomepage — bold marketplace homepage with the hot orange/red/
 * pink gradient hero. Pairs with TaobaoProductHero and the taobao
 * cssVars cascaded by app/stores/[slug]/layout.tsx.
 */

import type { Store } from '@prisma/client';
import { SimpleHomepage } from '../_shared/SimpleHomepage';
import { TAOBAO_TOKENS } from '@/lib/landing/taobao';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
}

export async function TaobaoHomepage({ store }: Props) {
  return (
    <SimpleHomepage
      store={store}
      Banner={TaobaoBanner}
      accentColor={TAOBAO_TOKENS.accent}
      primaryColor={TAOBAO_TOKENS.primary}
      featuredLabel="🔥 BEST DEALS"
      featuredTitle="ลดทุกวัน · ดีลสุดคุ้ม"
    />
  );
}

function TaobaoBanner({
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
      className="relative overflow-hidden px-4 py-12 sm:py-16 lg:py-24"
      style={{ background: TAOBAO_TOKENS.primaryGradient, color: '#ffffff' }}
    >
      <div className="mx-auto max-w-7xl text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] opacity-90">
          {storeName} · marketplace
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          {tagline || `${storeName} ตลาดออนไลน์ ลดทุกวัน`}
        </h1>
        <p className="mt-4 text-sm opacity-90 sm:text-base">
          แฟลชเซลทุกชั่วโมง · ดีลโรงงานตรง · ส่งทั่วไทย
        </p>
        <div
          className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-[0.08em]"
          style={{ background: TAOBAO_TOKENS.accent, color: '#1A1A1A' }}
        >
          ⚡ Flash deal · 02:34:17
        </div>
      </div>
    </section>
  );
}
