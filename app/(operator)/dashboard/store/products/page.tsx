// Vendor-side product catalog — /dashboard/store/products.
//
// Triage surface: search by title (Thai + English), filter by active/
// hidden, paginate. The previous version `findMany`-d every row with
// no `take` cap — stores with 500+ products were dragging the page
// query into multi-second territory plus fetching `_count.variants`
// per row, so this rewrite both adds operator filters AND puts a
// 50-row ceiling on the work the request does.

import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Search, X, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import { TranslateTitlesButton } from "@/components/dashboard/translate-titles-button";
import {
  DashboardTabs,
  type DashboardTab,
} from "@/components/dashboard/dashboard-tabs";
import {
  DashboardPagination,
  parsePageParam,
} from "@/components/dashboard/dashboard-pagination";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type ProductsTabKey = "all" | "active" | "hidden";

export default async function StoreProductsPage({
  searchParams,
}: {
  searchParams?: { storeSlug?: string; q?: string; tab?: string; page?: string };
}) {
  // Multi-store resolution (admin / multi-owner). Falls back to the
  // signed-in user's owned store; redirects home when neither admin
  // nor owner of any store. See lib/stores/resolve-dashboard-store.ts.
  const { store } = await resolveDashboardStore({
    requestedSlug: searchParams?.storeSlug,
  });

  const q = searchParams?.q?.trim() || undefined;
  const tab: ProductsTabKey =
    searchParams?.tab === "active"
      ? "active"
      : searchParams?.tab === "hidden"
        ? "hidden"
        : "all";
  const page = parsePageParam(searchParams?.page);

  // Composable WHERE: storeId is always set; search (case-insensitive
  // on title + Thai title); tab maps to the `active` boolean.
  const textWhere = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { titleTh: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined;
  const baseWhere = {
    storeId: store.id,
    ...(textWhere ?? {}),
  };
  const listWhere = {
    ...baseWhere,
    ...(tab === "active"
      ? { active: true }
      : tab === "hidden"
        ? { active: false }
        : {}),
  };

  const [activeCount, hiddenCount, totalForTab, untranslatedCount] =
    await Promise.all([
      prisma.product.count({ where: { ...baseWhere, active: true } }),
      prisma.product.count({ where: { ...baseWhere, active: false } }),
      prisma.product.count({ where: listWhere }),
      // Drives the "แปลชื่อ TH" button label so the operator sees how
      // many rows still fall back to English on category/PDP/search.
      // Counts the WHOLE store (not just the filtered page) so the
      // operator's choice of filter doesn't hide outstanding work.
      prisma.product.count({
        where: { storeId: store.id, active: true, titleTh: null },
      }),
    ]);
  const totalCount = activeCount + hiddenCount;
  const totalPages = Math.max(1, Math.ceil(totalForTab / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const products = await prisma.product.findMany({
    where: listWhere,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (safePage - 1) * PAGE_SIZE,
    include: {
      _count: { select: { variants: true } },
    },
  });

  // URL builder that preserves storeSlug + q + tab + page across nav
  // and tab/search submits. Tab switches reset to page 1; explicit
  // `page=1` is collapsed so the canonical URL stays tidy.
  function buildHref({
    q: qParam,
    tab: tabParam,
    page: pageParam,
  }: {
    q?: string;
    tab?: ProductsTabKey;
    page?: number;
  } = {}) {
    const params = new URLSearchParams();
    if (qParam) params.set("q", qParam);
    if (tabParam && tabParam !== "all") params.set("tab", tabParam);
    if (searchParams?.storeSlug)
      params.set("storeSlug", searchParams.storeSlug);
    if (pageParam && pageParam > 1) params.set("page", String(pageParam));
    const qs = params.toString();
    return qs ? `/dashboard/store/products?${qs}` : "/dashboard/store/products";
  }

  const slugSuffix = searchParams?.storeSlug
    ? `?storeSlug=${encodeURIComponent(searchParams.storeSlug)}`
    : "";

  const tabs: ReadonlyArray<DashboardTab<ProductsTabKey>> = [
    {
      key: "all",
      label: "ทั้งหมด",
      href: buildHref({ q, tab: "all" }),
      active: tab === "all",
      count: totalCount,
    },
    {
      key: "active",
      label: "กำลังขาย",
      href: buildHref({ q, tab: "active" }),
      active: tab === "active",
      count: activeCount,
    },
    {
      key: "hidden",
      label: "ซ่อน",
      href: buildHref({ q, tab: "hidden" }),
      active: tab === "hidden",
      count: hiddenCount,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">สินค้าของร้าน</h1>
          <p className="text-sm text-muted-foreground">
            จัดการสินค้าทั้งหมด — เพิ่ม / แก้ไข / ตั้งราคา / variants
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-start gap-2">
          <TranslateTitlesButton untranslatedCount={untranslatedCount} />
          <Link
            href={`/dashboard/store/products/bulk${slugSuffix}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent"
          >
            <Layers className="h-3.5 w-3.5" />
            เพิ่มทีละหลายรายการ
          </Link>
          <Link
            href={`/dashboard/store/products/new${slugSuffix}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่มสินค้า
          </Link>
        </div>
      </div>

      <DashboardTabs tabs={tabs} ariaLabel="กรองตามสถานะสินค้า" />

      <form className="relative flex gap-2" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="ค้นหาชื่อสินค้า (ไทย / English)"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-9 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="ค้นหาสินค้า"
          />
          {q && (
            <Link
              href={buildHref({ tab })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="ล้างคำค้น"
              prefetch={false}
            >
              <X className="h-4 w-4" />
            </Link>
          )}
        </div>
        {/* Preserve tab + storeSlug across submit */}
        {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
        {searchParams?.storeSlug && (
          <input
            type="hidden"
            name="storeSlug"
            value={searchParams.storeSlug}
          />
        )}
        <button
          type="submit"
          className="rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          ค้นหา
        </button>
      </form>

      {products.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed bg-muted px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {q || tab !== "all"
              ? "ไม่พบสินค้าตามเงื่อนไข"
              : "ยังไม่มีสินค้าในร้าน"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {q || tab !== "all"
              ? "ลองล้างตัวกรอง หรือเปลี่ยนคำค้น"
              : "เริ่มต้นเพิ่มสินค้าเข้าร้านได้ในหน้าเดียว"}
          </p>
          {!q && tab === "all" && (
            <Link
              href={`/dashboard/store/products/new${slugSuffix}`}
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              เพิ่มสินค้าแรก
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border bg-card sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">สินค้า</th>
                    <th className="px-4 py-3 text-right">ราคา</th>
                    <th className="px-4 py-3 text-center">Variants</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-muted">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/store/products/${p.id}${slugSuffix}`}
                          className="flex items-center gap-3"
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                            {p.imageUrl && (
                              <Image
                                src={p.imageUrl}
                                alt={p.titleTh ?? p.title}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                                unoptimized
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-medium text-foreground">
                              {p.titleTh ?? p.title}
                            </p>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {p.categoryName ?? "—"}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="font-semibold">
                          {formatTHB(Number(p.priceTHB))}
                        </span>
                        {p.compareAtPriceTHB && (
                          <span className="ml-1 text-xs text-muted-foreground line-through">
                            {formatTHB(Number(p.compareAtPriceTHB))}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p._count.variants > 0 ? (
                          <Badge variant="secondary" className="font-mono">
                            {p._count.variants}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.active ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            กำลังขาย
                          </Badge>
                        ) : (
                          <Badge variant="outline">ซ่อน</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/store/products/${p.id}${slugSuffix}`}
                          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-accent"
                        >
                          <Pencil className="h-3 w-3" />
                          แก้ไข
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card stack */}
          <div className="space-y-2 sm:hidden">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/store/products/${p.id}${slugSuffix}`}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 shadow-sm"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {p.imageUrl && (
                    <Image
                      src={p.imageUrl}
                      alt={p.titleTh ?? p.title}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {p.titleTh ?? p.title}
                  </p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {p.categoryName ?? "—"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatTHB(Number(p.priceTHB))}
                    </span>
                    {p._count.variants > 0 && (
                      <Badge variant="secondary" className="h-5 font-mono">
                        {p._count.variants}
                      </Badge>
                    )}
                    {p.active ? (
                      <Badge className="h-5 bg-green-100 text-green-800 hover:bg-green-100">
                        กำลังขาย
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="h-5">
                        ซ่อน
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <DashboardPagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={totalForTab}
            pageSize={PAGE_SIZE}
            hrefFor={(p) => buildHref({ q, tab, page: p })}
          />
        </>
      )}
    </div>
  );
}
