import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUsersClient, type AdminUserRow } from "./users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  // Resolve current admin (for self-id, used by client to disable
  // self-demotion / self-delete UI controls). Server still enforces
  // the same guards in /api/admin/users/[id], so this is purely for
  // ergonomics — flipping a CSS class doesn't grant anyone access.
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!me || me.role !== "ADMIN") redirect("/");

  const q = searchParams.q?.trim();
  const rows = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      store: { select: { slug: true, name: true } },
      _count: { select: { orders: true } },
    },
    take: 200,
  });

  // Resolve the "ร้าน" column for CUSTOMER rows by walking
  // Order → storeId. Vendors already have an owned `store`; customers
  // get the (potentially multiple) stores they've purchased from.
  //
  // Done as two batched queries instead of per-row to avoid an N+1:
  //   1. groupBy (userId, storeId) over all order rows for this page's users
  //   2. one store lookup keyed by the distinct storeIds we found
  const userIds = rows.map((r) => r.id);
  const purchaseStoresByUser = new Map<string, { slug: string; name: string }[]>();

  if (userIds.length > 0) {
    const orderGroups = await prisma.order.groupBy({
      by: ["userId", "storeId"],
      where: {
        userId: { in: userIds },
        storeId: { not: null },
      },
    });

    const storeIds = Array.from(
      new Set(
        orderGroups
          .map((g) => g.storeId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const stores = storeIds.length
      ? await prisma.store.findMany({
          where: { id: { in: storeIds } },
          select: { id: true, slug: true, name: true },
        })
      : [];
    const storeById = new Map(stores.map((s) => [s.id, s]));

    for (const g of orderGroups) {
      if (!g.storeId) continue;
      const store = storeById.get(g.storeId);
      if (!store) continue;
      const list = purchaseStoresByUser.get(g.userId) ?? [];
      list.push({ slug: store.slug, name: store.name });
      purchaseStoresByUser.set(g.userId, list);
    }
  }

  const initialUsers: AdminUserRow[] = rows.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    // Date isn't directly serializable across the server/client
    // boundary in older Next.js setups — toISOString keeps things
    // simple and the client formats with toLocaleDateString.
    createdAt: u.createdAt.toISOString(),
    store: u.store,
    purchaseStores: purchaseStoresByUser.get(u.id) ?? [],
    orderCount: u._count.orders,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <AdminUsersClient
        initialUsers={initialUsers}
        meId={me.id}
        query={q ?? ""}
      />
    </div>
  );
}
