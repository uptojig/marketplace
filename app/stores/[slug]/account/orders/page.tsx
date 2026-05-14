// /stores/[slug]/account/orders — per-store order history.
//
// Per Shopify-like architecture, the customer only sees orders placed
// at this specific store. getUserOrders is scoped by both userId and
// storeSlug.

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserOrders } from '@/lib/orders/queries';
import { toOrderViews } from '@/lib/account/order-view';
import { OrdersListClient } from './orders-list-client';

export const dynamic = 'force-dynamic';

export default async function OrdersListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect(`/stores/${slug}/signin?callbackUrl=/stores/${slug}/account/orders`);
  }

  const orders = await getUserOrders(userId, { limit: 50, storeSlug: slug });
  const views = toOrderViews(orders);

  return <OrdersListClient orders={views} storeSlug={slug} />;
}
