import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Shield, ExternalLink } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "store.approve": "อนุมัติร้าน",
  "store.reject": "ปฏิเสธร้าน",
  "store.suspend": "ระงับร้าน",
  "store.reset_to_pending": "ย้อนเป็นรอตรวจ",
  "store.delete": "ลบร้าน",
  "product.approve": "อนุมัติสินค้า",
  "product.reject": "ปฏิเสธสินค้า",
  "product.delete": "ลบสินค้า",
  "user.create": "สร้างผู้ใช้",
  "user.role_change": "เปลี่ยน role",
  "user.delete": "ลบผู้ใช้",
  "landing.regenerate": "Generate landing ใหม่",
  "landing.clear": "ลบ landing",
};

function actionColor(action: string): string {
  if (action.endsWith(".approve")) return "bg-green-100 text-green-800";
  if (action.endsWith(".reject")) return "bg-red-100 text-red-800";
  if (action.endsWith(".suspend")) return "bg-amber-100 text-amber-800";
  if (action.endsWith(".delete")) return "bg-red-100 text-red-800";
  if (action.endsWith(".create")) return "bg-blue-100 text-blue-800";
  if (action.endsWith(".role_change")) return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-700";
}

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: { actor?: string; action?: string; target?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (me?.role !== "ADMIN") redirect("/");

  const where: Record<string, unknown> = {};
  if (searchParams.actor)
    where.actorEmail = { contains: searchParams.actor, mode: "insensitive" };
  if (searchParams.action) where.action = { startsWith: searchParams.action };
  if (searchParams.target) where.targetId = searchParams.target;

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-stone-500" />
        <div>
          <h1 className="text-2xl font-bold">Audit log</h1>
          <p className="text-sm text-muted-foreground">
            บันทึกทุกการกระทำของ admin — ใครทำอะไรเมื่อไหร่ ({logs.length}{" "}
            รายการล่าสุด)
          </p>
        </div>
      </div>

      <form className="flex flex-wrap gap-2">
        <input
          name="actor"
          defaultValue={searchParams.actor ?? ""}
          placeholder="อีเมลของ admin ที่ทำ"
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <input
          name="action"
          defaultValue={searchParams.action ?? ""}
          placeholder="action prefix เช่น store, product, user"
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <input
          name="target"
          defaultValue={searchParams.target ?? ""}
          placeholder="target id (cuid)"
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          กรอง
        </button>
        {(searchParams.actor || searchParams.action || searchParams.target) && (
          <Link
            href="/admin/audit-log"
            className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ล้าง
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">เวลา</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">ผู้ทำ</th>
              <th className="px-4 py-3">เป้าหมาย</th>
              <th className="px-4 py-3">รายละเอียด</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  ไม่พบ audit log ที่ตรงกับเงื่อนไข
                </td>
              </tr>
            ) : (
              logs.map((l) => {
                const meta =
                  l.metadata && typeof l.metadata === "object"
                    ? (l.metadata as Record<string, unknown>)
                    : null;
                const note =
                  meta && typeof meta === "object"
                    ? typeof (meta.after as Record<string, unknown>)?.note ===
                      "string"
                      ? ((meta.after as Record<string, unknown>).note as string)
                      : null
                    : null;

                return (
                  <tr key={l.id} className="align-top hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString("th-TH", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-medium ${actionColor(l.action)}`}
                      >
                        {ACTION_LABELS[l.action] ?? l.action}
                      </span>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        {l.action}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs">{l.actorEmail}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {l.actorRole}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {l.targetType && l.targetId ? (
                        <>
                          <p className="text-xs">{l.targetType}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {l.targetId.slice(0, 14)}…
                          </p>
                          {l.targetType === "Store" && (
                            <Link
                              href={`/admin/stores/${l.targetId}`}
                              className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                            >
                              ดู <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          )}
                          {l.targetType === "User" && (
                            <Link
                              href="/admin/users"
                              className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                            >
                              ดู <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {note && (
                        <p className="line-clamp-2 italic text-stone-700">
                          “{note}”
                        </p>
                      )}
                      {meta?.slug ? (
                        <p className="text-[11px] text-muted-foreground">
                          slug: {String(meta.slug)}
                        </p>
                      ) : null}
                      {meta?.name ? (
                        <p className="text-[11px] text-muted-foreground">
                          {String(meta.name)}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
