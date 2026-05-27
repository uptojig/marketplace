import { AccountSidebar } from '@/components/account/account-sidebar';
import { prisma } from '@/lib/prisma';
import { templates } from '@/lib/templates/registry';
import type { TemplateId } from '@/lib/templates/types';

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
  // Look up the store's template to surface flags like `digitalOnly`
  // that shape the sidebar (e.g. hide /addresses for sheetlab where no
  // parcel ever ships).
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { templateId: true },
  });
  const template = store?.templateId
    ? templates[store.templateId as TemplateId]
    : undefined;
  const digitalOnly = template?.behavior.digitalOnly === true;
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AccountSidebar storeSlug={slug} digitalOnly={digitalOnly} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
