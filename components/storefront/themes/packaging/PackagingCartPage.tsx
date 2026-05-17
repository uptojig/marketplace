import type { Store } from '@prisma/client';
import { Sparkles } from 'lucide-react';
import { SimpleCartPage } from '../_shared/SimpleCartPage';
import { PACKAGING_TOKENS } from '@/lib/landing/packaging';

type StoreSlim = Pick<
  Store,
  'id' | 'slug' | 'name' | 'logoUrl' | 'primaryColor' | 'templateId' | 'landingThemeVariant'
>;

export function PackagingCartPage({ store }: { store: StoreSlim }) {
  return (
    <SimpleCartPage
      store={store}
      banner={
        <div
          className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 text-sm font-bold text-white"
          style={{ background: PACKAGING_TOKENS.primary }}
        >
          <Sparkles className="h-4 w-4" />
          <span className="uppercase tracking-[0.06em]">ตะกร้าขายส่ง</span>
          <span
            className="rounded-full px-3 py-1 text-xs"
            style={{ background: PACKAGING_TOKENS.accent, color: PACKAGING_TOKENS.ink }}
          >
            ส่งฟรี ฿590+
          </span>
          <span
            className="hidden rounded-full px-3 py-1 text-xs text-white sm:inline-flex"
            style={{ background: PACKAGING_TOKENS.savings }}
          >
            🚚 ส่งภายใน 24 ชม.
          </span>
        </div>
      }
    />
  );
}
