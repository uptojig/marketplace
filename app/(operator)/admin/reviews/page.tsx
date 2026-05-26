/**
 * /admin/reviews — operator moderation list of the most recent 100
 * product reviews across ALL stores. The "ซื้อจริง" (verified purchase)
 * badge is computed at read time by checking for an active
 * DigitalUnlock OR a paid OrderItem on the (userId, productId) pair —
 * mirroring lib/reviews/listReviews so the badge stays consistent
 * with what the storefront shows.
 *
 * Actions (hide / unhide) are delegated to a small client component
 * that PATCHes /api/admin/reviews/[id] and triggers router.refresh()
 * so this server component re-renders with the fresh state.
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
import { ReviewRowActions } from "./ReviewRowActions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;
const BODY_TRUNCATE = 200;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return `${s.slice(0, n).trimEnd()}…`;
}

function formatThaiDateTime(d: Date) {
  return d.toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function StarRating({ rating }: { rating: number }) {
  const safe = Math.max(0, Math.min(5, rating));
  return (
    <span
      aria-label={`${safe} ดาวจาก 5`}
      className="font-mono text-amber-500 select-none whitespace-nowrap"
    >
      {"★".repeat(safe)}
      <span className="text-muted-foreground">{"☆".repeat(5 - safe)}</span>
    </span>
  );
}

export default async function AdminReviewsPage() {
  const session = await requireAdmin();
  if (!session) redirect("/signin?callbackUrl=/admin/reviews");

  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      product: { select: { id: true, title: true } },
      store: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });

  // Compute verified-purchase flags in batch (matches lib/reviews
  // logic: DigitalUnlock OR paid OrderItem).
  const pairs = reviews.map((r) => ({ userId: r.userId, productId: r.productId }));
  const verifiedSet = new Set<string>();
  if (pairs.length > 0) {
    const userIds = Array.from(new Set(pairs.map((p) => p.userId)));
    const productIds = Array.from(new Set(pairs.map((p) => p.productId)));

    const [unlocks, orderItems] = await Promise.all([
      prisma.digitalUnlock.findMany({
        where: {
          userId: { in: userIds },
          productId: { in: productIds },
          revokedAt: null,
        },
        select: { userId: true, productId: true },
      }),
      prisma.orderItem.findMany({
        where: {
          productId: { in: productIds },
          order: { userId: { in: userIds }, status: "PAID" },
        },
        select: { productId: true, order: { select: { userId: true } } },
      }),
    ]);

    for (const u of unlocks) {
      verifiedSet.add(`${u.userId}::${u.productId}`);
    }
    for (const oi of orderItems) {
      verifiedSet.add(`${oi.order.userId}::${oi.productId}`);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <OperatorPageHeader
        title="รีวิวสินค้า"
        description={`รีวิวล่าสุด ${reviews.length.toLocaleString("th-TH")} รายการ — ซ่อนสแปม/รีวิวที่ไม่เหมาะสมได้จากที่นี่`}
      />

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-3 py-2 font-semibold whitespace-nowrap">
                วันที่
              </th>
              <th className="text-left px-3 py-2 font-semibold">ร้าน</th>
              <th className="text-left px-3 py-2 font-semibold">สินค้า</th>
              <th className="text-left px-3 py-2 font-semibold">ผู้รีวิว</th>
              <th className="text-left px-3 py-2 font-semibold whitespace-nowrap">
                คะแนน
              </th>
              <th className="text-left px-3 py-2 font-semibold">รีวิว</th>
              <th className="text-left px-3 py-2 font-semibold">สถานะ</th>
              <th className="text-left px-3 py-2 font-semibold">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => {
              const verified = verifiedSet.has(`${r.userId}::${r.productId}`);
              return (
                <tr
                  key={r.id}
                  className="border-b last:border-b-0 align-top hover:bg-muted/30"
                >
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatThaiDateTime(r.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/stores/${r.store.slug}`}
                      className="hover:underline font-medium"
                    >
                      {r.store.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 max-w-[200px]">
                    <Link
                      href={`/stores/${r.store.slug}/products/${r.product.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline line-clamp-2"
                    >
                      {r.product.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{r.user.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.user.email ?? "—"}
                    </div>
                    {verified ? (
                      <span className="mt-1 inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        ✓ ซื้อจริง
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <StarRating rating={r.rating} />
                  </td>
                  <td className="px-3 py-3 max-w-[360px]">
                    {r.title ? (
                      <div className="font-semibold text-foreground">
                        {r.title}
                      </div>
                    ) : null}
                    <div className="text-xs text-muted-foreground whitespace-pre-line">
                      {truncate(r.body, BODY_TRUNCATE)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <OperatorStatusBadge tone={r.hidden ? "danger" : "success"}>
                      {r.hidden ? "ซ่อนแล้ว" : "แสดง"}
                    </OperatorStatusBadge>
                  </td>
                  <td className="px-3 py-3">
                    <ReviewRowActions reviewId={r.id} hidden={r.hidden} />
                  </td>
                </tr>
              );
            })}
            {reviews.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  ยังไม่มีรีวิว
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
