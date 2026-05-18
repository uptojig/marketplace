import type { Store } from '@prisma/client';
import { Flame } from 'lucide-react';
import { SimpleCartPage } from '../_shared/SimpleCartPage';
import { TAOBAO_TOKENS } from '@/lib/landing/taobao';

type StoreSlim = Pick<
  Store,
  'id' | 'slug' | 'name' | 'logoUrl' | 'primaryColor' | 'templateId' | 'landingThemeVariant'
>;

export function TaobaoCartPage({ store }: { store: StoreSlim }) {
  return (
    <SimpleCartPage
      store={store}
      banner={
        <div
          className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white"
          style={{ background: TAOBAO_TOKENS.primaryGradient }}
        >
          <Flame className="h-4 w-4" />
          <span>Flash deal · เช็คเอาท์ก่อนหมดเวลา</span>
          <span
            className="rounded px-2 py-0.5 text-xs"
            style={{ background: TAOBAO_TOKENS.accent, color: '#1A1A1A' }}
          >
            ลด 20% สำหรับลูกค้าใหม่
          </span>
        </div>
      }
    />
  );
}
