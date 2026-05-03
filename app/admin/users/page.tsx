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
