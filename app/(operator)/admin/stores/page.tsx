import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma, StoreApprovalStatus } from "@prisma/client";
import {
  Button,
  OperatorPageHeader,
} from "@/components/operator/operator-primitives";
import { getStoresQualitySnapshotBatch } from "@/lib/admin/enrich-products";

import { KpiStrip } from "./_kpi-strip";
import { StoresListClient } from "./_stores-list-client";
import type { StoreRow } from "./_columns";

export const dynamic = "force-dynamic";

const APPROVAL_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const satisfies readonly StoreApprovalStatus[];

/** Stores with more than this many low-image products count as
 *  "คุณภาพต่ำ" for the KPI strip + filter. */
const LOW_QUALITY_THRESHOLD = 5;

function parseStatuses(raw: string | undefined): StoreApprovalStatus[] {
  if (!raw) return [];
  const set = new Set<StoreApprovalStatus>();
  for (const part of raw.split(",")) {
    const s = part.trim().toUpperCase();
    if ((APPROVAL_STATUSES as readonly string[]).includes(s)) {
      set.add(s as StoreApprovalStatus);
    }
  }
  return Array.from(set);
}

function parseTri(raw: string | undefined): "yes" | "no" | null {
  if (raw === "yes" || raw === "no") return raw;
  return null;
}

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    status?: string;
    domain?: string;
    landing?: string;
    quality?: string;
  };
}) {
  const q = searchParams.q?.trim() || undefined;
  const statuses = parseStatuses(searchParams.status);
  const domainFilter = parseTri(searchParams.domain);
  const landingFilter = parseTri(searchParams.landing);
  const qualityFilter = searchParams.quality === "low" ? "low" : null;

  // ── Build the WHERE clause from URL state ───────────────────────
  const where: Prisma.StoreWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { owner: { email: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (statuses.length > 0) {
    where.approvalStatus = { in: statuses };
  }
  if (domainFilter === "yes") {
    where.customDomain = { not: null };
  } else if (domainFilter === "no") {
    where.customDomain = null;
  }
  if (landingFilter === "yes") {
    where.landingContent = { isNot: null };
  } else if (landingFilter === "no") {
    where.landingContent = { is: null };
  }

  // ── Fetch list + KPI counters in parallel ───────────────────────
  // KPI counters are independent of the active filter so the operator
  // always sees the marketplace-wide queue depth.
  const [stores, totalForFilter, kpiPending, kpiTotalStores, kpiTotalProducts] =
    await Promise.all([
      prisma.store.findMany({
        where,
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
          landingThemeVariant: true,
          landingContent: { select: { storeId: true } },
          owner: { select: { email: true, name: true } },
          _count: { select: { products: true } },
        },
        take: 200,
      }),
      prisma.store.count({ where }),
      prisma.store.count({ where: { approvalStatus: "PENDING" } }),
      prisma.store.count(),
      prisma.product.count({ where: { active: true } }),
    ]);

  // ── Batch quality snapshot — single query for ALL listed stores ─
  // Previously this was an N+1 (one findMany per store inside
  // Promise.all). The batched helper pulls every active product for
  // the listed stores in one SELECT and aggregates per-store in Node.
  const qualityById = await getStoresQualitySnapshotBatch(
    stores.map((s) => s.id),
  );

  // KPI #3 — stores in the listing with > LOW_QUALITY_THRESHOLD
  // low-image products. Approximate; precise marketplace-wide
  // computation would need a second pass over products. The list page
  // is capped at 200 so it's a directional indicator anyway.
  const lowQualityForListing = stores.reduce((acc, s) => {
    const qq = qualityById[s.id];
    if (qq && qq.lowImage > LOW_QUALITY_THRESHOLD) acc += 1;
    return acc;
  }, 0);

  // Apply the quality filter post-fetch so we can use the snapshot
  // computed above. Without a denormalized column on Store we'd
  // otherwise need a complex SQL groupBy join — keeping the filter
  // in-memory is fine for the 200-row cap.
  let visibleStores = stores;
  if (qualityFilter === "low") {
    visibleStores = stores.filter((s) => {
      const qq = qualityById[s.id];
      return qq && qq.lowImage > LOW_QUALITY_THRESHOLD;
    });
  }

  // Project to the serializable row shape consumed by the columns.
  const rows: StoreRow[] = visibleStores.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    logoUrl: s.logoUrl,
    customDomain: s.customDomain,
    createdAt: s.createdAt,
    approvalStatus: s.approvalStatus,
    approvalNote: s.approvalNote,
    landingThemeVariant: s.landingThemeVariant,
    hasLandingContent: s.landingContent !== null,
    owner: s.owner,
    productCount: s._count.products,
    quality: qualityById[s.id] ?? null,
  }));

  const truncated = stores.length === 200;
  const anyFilterActive =
    !!q ||
    statuses.length > 0 ||
    !!domainFilter ||
    !!landingFilter ||
    !!qualityFilter;
  const emptyMessage = anyFilterActive
    ? "ไม่พบร้านค้าตามเงื่อนไข — ลองล้างตัวกรอง"
    : "ยังไม่มีร้านค้า — กด “สร้างร้านใหม่” ด้านบนเพื่อเริ่มต้น";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <OperatorPageHeader
        title="ร้านค้าทั้งหมด"
        description={
          <>
            จัดการ ร้าน, ธีม, สถานะ และคุณภาพข้อมูลสินค้า ·{" "}
            {rows.length === totalForFilter
              ? `${rows.length} ร้าน`
              : `แสดง ${rows.length} จาก ${totalForFilter} ร้าน`}
            {truncated && (
              <span className="ml-1 text-primary">
                (แสดง 200 ล่าสุด — ใช้ค้นหาเพื่อกรอง)
              </span>
            )}
          </>
        }
        actions={
          <Button asChild>
            <Link href="/create-store">
              <Plus />
              สร้างร้านใหม่
            </Link>
          </Button>
        }
      />

      {/* ── KPI strip (4 OperatorStatCard) ───────────────────────── */}
      <KpiStrip
        total={kpiTotalStores}
        pending={kpiPending}
        lowQuality={lowQualityForListing}
        totalProducts={kpiTotalProducts}
      />

      {/* ── OperatorDataTable + bulk actions + filter popovers ──── */}
      <StoresListClient stores={rows} emptyMessage={emptyMessage} />
    </div>
  );
}
