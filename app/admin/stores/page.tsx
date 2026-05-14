import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { StoreApprovalStatus } from "@prisma/client";
import { getStoreQualitySnapshot } from "@/lib/admin/enrich-products";
import { EnrichProductsButton } from "./enrich-products-button";
import { BackfillCJImagesButton } from "./backfill-cj-images-button";
import { RefetchCJMissingPayloadButton } from "./refetch-cj-missing-payload-button";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<StoreApprovalStatus, { label: string; cls: string }> = {
  PENDING: { label: "รอตรวจ", cls: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "อนุมัติ", cls: "bg-green-100 text-green-800" },
  REJECTED: { label: "ปฏิเสธ", cls: "bg-red-100 text-red-800" },
  SUSPENDED: { label: "ระงับ", cls: "bg-gray-200 text-gray-700" },
};

function ApprovalBadge({ status }: { status: StoreApprovalStatus }) {
  const { label, cls } = STATUS_BADGE[status];
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();
  const stores = await prisma.store.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { owner: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      customDomain: true,
      createdAt: true,
      approvalStatus: true,
      approvalNote: true,
      owner: { select: { email: true, name: true } },
      _count: { select: { products: true } },
    },
    take: 200,
  });

  // Per-store product-quality snapshot — counts of translated /
  // categorized / low-image. Fan-out is bounded (<= 200 stores per
  // the take above) and each snapshot is three count() queries, so
  // we accept the parallelism rather than wiring a custom join.
  //
  // DEFENSIVE: a single bad row (e.g. a galleryUrls column stored as
  // a malformed Json shape) would otherwise reject the whole
  // Promise.all and crash the page — fall back to `null` per-store
  // so the rest of the table still renders.
  const qualityById = new Map(
    await Promise.all(
      stores.map(async (s) => {
        try {
          return [s.id, await getStoreQualitySnapshot(s.id)] as const;
        } catch (err) {
          console.error(
            `[admin/stores] quality snapshot failed for ${s.slug}:`,
            err instanceof Error ? err.message : err,
          );
          return [s.id, null] as const;
        }
      }),
    ),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ร้านค้าทั้งหมด</h1>
          <p className="text-sm text-muted-foreground">{stores.length} ร้าน</p>
        </div>
        <Link
          href="/create-store"
          className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          สร้างร้านใหม่
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="ค้นหาชื่อร้าน, slug, หรืออีเมลเจ้าของ..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              <th className="px-4 py-3">ร้าน</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">เจ้าของ</th>
              <th className="px-4 py-3 text-center">สินค้า</th>
              <th className="px-4 py-3">คุณภาพข้อมูล</th>
              <th className="px-4 py-3">โดเมน</th>
              <th className="px-4 py-3">สร้างเมื่อ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stores.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  ไม่พบร้านค้า
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.logoUrl}
                          alt={s.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-500">
                          {s.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">/{s.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ApprovalBadge status={s.approvalStatus} />
                    {s.approvalNote && (
                      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                        {s.approvalNote}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p>{s.owner.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{s.owner.email}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {s._count.products}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {(() => {
                      const q = qualityById.get(s.id);
                      if (!q || q.total === 0) {
                        return <span className="text-muted-foreground">—</span>;
                      }
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={
                              q.translated === q.total
                                ? "text-green-700"
                                : "text-amber-700"
                            }
                          >
                            แปลไทย {q.translated}/{q.total}
                          </span>
                          <span
                            className={
                              q.categorized === q.total
                                ? "text-green-700"
                                : "text-amber-700"
                            }
                          >
                            Category {q.categorized}/{q.total}
                          </span>
                          <span
                            className={
                              q.lowImage === 0 ? "text-green-700" : "text-red-700"
                            }
                          >
                            รูปน้อย {q.lowImage}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {s.customDomain ? (
                      <code className="rounded bg-gray-100 px-1.5 py-0.5">{s.customDomain}</code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {s.createdAt.toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <EnrichProductsButton storeId={s.id} storeName={s.name} />
                      <RefetchCJMissingPayloadButton storeId={s.id} storeName={s.name} />
                      <BackfillCJImagesButton storeId={s.id} storeName={s.name} />
                      <Link
                        href={`/admin/stores/${s.id}`}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:underline"
                      >
                        แก้ไข
                      </Link>
                      <Link
                        href={`/stores/${s.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        ดูร้าน <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
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
