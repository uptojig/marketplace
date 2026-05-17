import type { Store } from '@prisma/client';
import { ShoppingCart } from 'lucide-react';
import { SimpleCartPage } from '../_shared/SimpleCartPage';

type StoreSlim = Pick<
  Store,
  'id' | 'slug' | 'name' | 'logoUrl' | 'primaryColor' | 'templateId' | 'landingThemeVariant'
>;

export function EverydayCartPage({ store }: { store: StoreSlim }) {
  return (
    <SimpleCartPage
      store={store}
      banner={
        <div
          className="flex flex-wrap items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white"
          style={{ background: '#DC2626' }}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>ตะกร้าของคุณ · ลดสูงสุด 30% เมื่อสั่งครบ ฿590</span>
        </div>
      }
    />
  );
}
