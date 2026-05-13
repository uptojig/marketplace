import { AccountSidebar } from '@/components/account/account-sidebar';
import { MarketplacePage } from '@/components/layout/marketplace-page';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketplacePage>
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <AccountSidebar />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </MarketplacePage>
  );
}
