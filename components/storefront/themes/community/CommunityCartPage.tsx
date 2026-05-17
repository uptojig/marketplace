import type { Store } from '@prisma/client';
import { Video } from 'lucide-react';
import { SimpleCartPage } from '../_shared/SimpleCartPage';
import { COMMUNITY_TOKENS } from '@/lib/landing/community';

type StoreSlim = Pick<
  Store,
  'id' | 'slug' | 'name' | 'logoUrl' | 'primaryColor' | 'templateId' | 'landingThemeVariant'
>;

export function CommunityCartPage({ store }: { store: StoreSlim }) {
  return (
    <SimpleCartPage
      store={store}
      banner={
        <div
          className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 text-sm font-bold text-white"
          style={{ background: COMMUNITY_TOKENS.primaryGradient }}
        >
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          <span className="uppercase tracking-[0.06em]">Live shopping cart</span>
          <Video className="h-4 w-4" />
          <span>ราคา KOL — ลด 15% ภายในไลฟ์เท่านั้น</span>
        </div>
      }
    />
  );
}
