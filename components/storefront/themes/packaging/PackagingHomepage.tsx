/**
 * PackagingHomepage — cheerful packaging-supply homepage with the
 * pink-yellow-sky-white palette. Pairs with PackagingProductHero
 * and the packaging cssVars cascaded by app/stores/[slug]/layout.tsx.
 */

import type { Store } from '@prisma/client';
import { SimpleHomepage } from '../_shared/SimpleHomepage';
import { PACKAGING_TOKENS } from '@/lib/landing/packaging';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
}

export async function PackagingHomepage({ store }: Props) {
  return (
    <SimpleHomepage
      store={store}
      Banner={PackagingBanner}
      accentColor={PACKAGING_TOKENS.savings}
      primaryColor={PACKAGING_TOKENS.primary}
      featuredLabel="💝 NEW IN"
      featuredTitle="แพ็คเกจน่ารักประจำสัปดาห์"
    />
  );
}

function PackagingBanner({
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
      className="px-4 py-12 sm:py-16 lg:py-20"
      style={{ background: '#ffffff' }}
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p
            className="mb-3 text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: PACKAGING_TOKENS.savings }}
          >
            ✨ {storeName} · packaging supply
          </p>
          <h1
            className="text-3xl font-extrabold tracking-tight sm:text-5xl"
            style={{ color: PACKAGING_TOKENS.ink }}
          >
            {tagline || `บรรจุภัณฑ์โรงงานตรง สำหรับธุรกิจของคุณ`}
          </h1>
          <p className="mt-4 text-sm sm:text-base" style={{ color: PACKAGING_TOKENS.inkMuted }}>
            กล่อง · ถุง · ฉลาก · เทป — ครบในที่เดียว ส่งทั่วไทย
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className="rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.06em] text-white"
              style={{ background: PACKAGING_TOKENS.primary }}
            >
              💝 ลด 15% สำหรับสั่ง 100+ ชิ้น
            </span>
            <span
              className="rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.06em]"
              style={{ background: PACKAGING_TOKENS.accent, color: PACKAGING_TOKENS.ink }}
            >
              ⚡ ส่งฟรี ฿590+
            </span>
            <span
              className="rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.06em] text-white"
              style={{ background: PACKAGING_TOKENS.savings }}
            >
              🚚 ส่งภายใน 24 ชม.
            </span>
          </div>
        </div>
        <div
          className="hidden h-48 w-48 rounded-3xl lg:block"
          style={{ background: `linear-gradient(135deg, ${PACKAGING_TOKENS.primary} 0%, ${PACKAGING_TOKENS.accent} 100%)` }}
          aria-hidden
        />
      </div>
    </section>
  );
}
