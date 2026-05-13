import { AccountSidebar } from '@/components/account/account-sidebar';

// Per-store buyer account chrome. Customer of this store sees only
// data scoped to /stores/[slug]/* (orders, addresses, coupons, etc.).
// ShopHeader/ShopFooter from app/stores/[slug]/layout.tsx wraps us —
// no need for MarketplacePage here.
export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AccountSidebar storeSlug={slug} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
