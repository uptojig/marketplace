/**
 * /admin/credit-topups — operator-facing list of all credit top-ups
 * across stores. Used for chargeback / dispute defense; clicking into
 * a row opens the full evidence pack at /admin/credit-topups/[ref].
 *
 * Latest-first; PAID and PENDING are interleaved (the operator usually
 * wants to find a specific buyer/transaction fast, not filter by
 * status). Pagination: simple 50-per-page server-rendered.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  OperatorPageHeader,
  OperatorStatusBadge,
} from "@/components/operator/operator-primitives";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

export default async function AdminCreditTopupsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const session = await requireAdmin();
  if (!session) redirect("/signin?callbackUrl=/admin/credit-topups");

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const q = searchParams.q?.trim();

  const where = q
    ? {
        OR: [
          { referenceNumber: { contains: q, mode: "insensitive" as const } },
          { anypayTransactionId: { contains: q, mode: "insensitive" as const } },
          { user: { email: { contains: q, mode: "insensitive" as const } } },
          { user: { name: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.creditTopup.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
        store: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.creditTopup.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <OperatorPageHeader
        title="Credit top-ups"
        description={`รายการเติมเครดิตทั้งหมด — ${total.toLocaleString()} รายการ`}
      />

      <form className="flex gap-2" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="ค้น TOP-..., anypay tx, อีเมล, ชื่อผู้ซื้อ"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          ค้นหา
        </button>
      </form>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-3 py-2 font-semibold">Reference</th>
              <th className="text-left px-3 py-2 font-semibold">ผู้ซื้อ</th>
              <th className="text-left px-3 py-2 font-semibold">ร้าน</th>
              <th className="text-right px-3 py-2 font-semibold">ยอด</th>
              <th className="text-left px-3 py-2 font-semibold">สถานะ</th>
              <th className="text-left px-3 py-2 font-semibold">วันที่</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-b-0 hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs">
                  {r.referenceNumber ? (
                    <Link
                      href={`/admin/credit-topups/${r.referenceNumber}`}
                      className="font-semibold underline hover:no-underline"
                    >
                      {r.referenceNumber}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">(legacy {r.id.slice(0, 8)})</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.user?.name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.user?.email ?? "—"}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/stores/${r.store.slug}`}
                    className="hover:underline"
                  >
                    {r.store.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold">
                  {formatTHB(Number(r.amountTHB))}
                </td>
                <td className="px-3 py-2">
                  <OperatorStatusBadge
                    tone={
                      r.status === "PAID"
                        ? "success"
                        : r.status === "PENDING"
                          ? "processing"
                          : "danger"
                    }
                  >
                    {r.status}
                  </OperatorStatusBadge>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {r.createdAt.toLocaleString("th-TH", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  ไม่พบรายการ
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            หน้า {page} จาก {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/admin/credit-topups?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  page: String(page - 1),
                }).toString()}`}
                className="rounded-md border px-3 py-1 hover:bg-muted"
              >
                ‹ ก่อนหน้า
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/admin/credit-topups?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  page: String(page + 1),
                }).toString()}`}
                className="rounded-md border px-3 py-1 hover:bg-muted"
              >
                ถัดไป ›
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
