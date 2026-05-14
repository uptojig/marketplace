// Server component — fetches the signed-in user's orders from Prisma
// (lib/account/queries.getUserOrdersForPage) and hands them to the
// client list view for filtering/search.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserOrdersForPage } from "@/lib/account/queries";
import OrdersListView from "./OrdersListView";

export const dynamic = "force-dynamic";

export default async function OrdersListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/account/orders");
  }
  const orders = await getUserOrdersForPage();
  return <OrdersListView orders={orders} />;
}
