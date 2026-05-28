import { AccountSidebar } from '@/components/account/account-sidebar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { templates } from '@/lib/templates/registry';
import type { TemplateId } from '@/lib/templates/types';
import { unreadInboxCount } from '@/lib/inbox/queries';

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

  // Unread inbox badge — server-resolved here so the sidebar (client)
  // stays presentational. Static for the session; refreshes on nav.
  const session = await getServerSession(authOptions);
  let inboxUnread = 0;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) inboxUnread = await unreadInboxCount(user.id);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AccountSidebar
          storeSlug={slug}
          digitalOnly={digitalOnly}
          inboxUnread={inboxUnread}
        />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
