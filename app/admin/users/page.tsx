import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  VENDOR: "bg-blue-100 text-blue-700",
  CUSTOMER: "bg-gray-100 text-gray-700",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();
  const users = await prisma.user.findMany({
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

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">ผู้ใช้ทั้งหมด</h1>
        <p className="text-sm text-muted-foreground">{users.length} คน</p>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="ค้นหาชื่อหรืออีเมล..."
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          ค้นหา
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">อีเมล / ชื่อ</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">ร้าน</th>
              <th className="px-4 py-3 text-center">ออเดอร์</th>
              <th className="px-4 py-3">สมัครเมื่อ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  ไม่พบผู้ใช้
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.email ?? "—"}</p>
                    {u.name && <p className="text-xs text-muted-foreground">{u.name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role] ?? "bg-gray-100"}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.store ? (
                      <span>{u.store.name}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{u._count.orders}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.createdAt.toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
