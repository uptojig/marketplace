// /account/orders — buyer's order history (server-rendered).
//
// Wiring:
//  - getServerSession → user.id → getUserOrders(userId).
//  - Real Prisma data is mapped through toOrderViews (snapshot
//    fallbacks, Decimal → number, JSON address parsing).
//  - The interactive tab + search filter lives in the client
//    sub-component (./orders-list-client.tsx) — page itself stays
//    a Server Component so the order list isn't shipped twice.
//
// Auth: pages under /account assume an authenticated buyer. If the
// session is missing we redirect to /signin with a callbackUrl so
// they return here after login.

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserOrders } from '@/lib/orders/queries';
import { toOrderViews } from '@/lib/account/order-view';
import { OrdersListClient } from './orders-list-client';

export const dynamic = 'force-dynamic';

export default async function OrdersListPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/signin?callbackUrl=/account/orders');
  }

  // Limit to the most recent 50 — pagination comes later. The
  // search filter on the client searches over what we shipped here.
  const orders = await getUserOrders(userId, { limit: 50 });
  const views = toOrderViews(orders);

  return <OrdersListClient orders={views} />;
}
