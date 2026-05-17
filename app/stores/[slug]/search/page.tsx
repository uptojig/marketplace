/**
 * /stores/{slug}/search — full search results page.
 *
 * Companion to the SearchOverlay quick-search. The overlay shows up
 * to 10 results inline; this page gives the full list with pagination,
 * sort, and a prominent input to refine the query.
 *
 * Search is server-side (Prisma OR-contains across title/titleTh/
 * description/descriptionTh/categoryName) — same query as
 * /api/stores/[slug]/search but rendered on the page directly so the
 * URL is shareable and the result count appears immediately.
 *
 * Theme cascade through var(--shop-*) — adopts each store's family.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Search as SearchIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { RecentlyViewedRail } from "@/components/storefront/RecentlyViewed";
import { WishlistButton } from "@/components/storefront/Wishlist";
import { StoryQuickViewTrigger } from "@/components/storefront/StoryQuickView";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";

export const dynamic = "force-dynamic";

const SORT_OPTIONS: Record<
  string,
  { label: string; orderBy: { [k: string]: "asc" | "desc" } }
> = {
  relevance: { label: "ตรงที่สุด", orderBy: { createdAt: "desc" } },
  newest: { label: "ใหม่ล่าสุด", orderBy: { createdAt: "desc" } },
  "price-asc": { label: "ราคาต่ำ → สูง", orderBy: { priceTHB: "asc" } },
  "price-desc": { label: "ราคาสูง → ต่ำ", orderBy: { priceTHB: "desc" } },
};

const PAGE_SIZE = 12;

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { q?: string; sort?: string; page?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const sortKey =
    searchParams.sort && SORT_OPTIONS[searchParams.sort]
      ? searchParams.sort
      : "relevance";
  const sort = SORT_OPTIONS[sortKey];
  const requestedPage = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      tagline: true,
      bannerUrl: true,
      logoUrl: true,
      primaryColor: true,
      templateId: true,
      products: {
        where: { active: true },
        select: { categoryName: true },
      },
    },
  });
  if (!store) notFound();

  // ── Multi-page template dispatch ────────────────────────────
  // The TemplatePages contract doesn't have a dedicated `search`
  // slot (search is structurally a catalog of products matching
  // a query), so we dispatch search → `pages.catalog` if the
  // template ships one. The catalog template receives the search
  // query as a single "selected category" so it can render the
  // current query in its filter UI without reshuffling its
  // existing prop interface. Templates that don't want this
  // dispatch simply omit `pages.catalog`.
  const effectiveTpl = effectiveTemplateId(store);
  const template = effectiveTpl && effectiveTpl in STORE_TEMPLATES
    ? STORE_TEMPLATES[effectiveTpl as TemplateId]
    : null;
  const TemplateCatalogPage = template?.pages?.catalog;
  if (TemplateCatalogPage && q) {
    const totalCountForTpl = await prisma.product.count({
      where: {
        storeId: store.id,
        active: true,
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { titleTh: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { descriptionTh: { contains: q, mode: "insensitive" as const } },
          { categoryName: { contains: q, mode: "insensitive" as const } },
        ],
      },
    });
    const totalPagesForTpl = Math.max(1, Math.ceil(totalCountForTpl / PAGE_SIZE));
    const currentPageForTpl = Math.min(requestedPage, totalPagesForTpl);
    const tplProducts = await prisma.product.findMany({
      where: {
        storeId: store.id,
        active: true,
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { titleTh: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { descriptionTh: { contains: q, mode: "insensitive" as const } },
          { categoryName: { contains: q, mode: "insensitive" as const } },
        ],
      },
      orderBy: sort.orderBy,
      skip: (currentPageForTpl - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
    const distinctCatsRows = await prisma.product.findMany({
      where: { storeId: store.id, active: true, categoryName: { not: null } },
      select: { categoryName: true },
      distinct: ["categoryName"],
    });
    const categoryNames = distinctCatsRows
      .map((r) => r.categoryName)
      .filter((c): c is string => !!c)
      .sort();
    const categoryCounts: Record<string, number> = {};
    for (const p of store.products) {
      if (p.categoryName)
        categoryCounts[p.categoryName] =
          (categoryCounts[p.categoryName] ?? 0) + 1;
    }
    return (
      <TemplateCatalogPage
        store={{
          id: store.id,
          slug: store.slug,
          name: store.name,
          description: store.description,
          tagline: store.tagline,
          logoUrl: store.logoUrl,
          bannerUrl: store.bannerUrl,
          primaryColor: store.primaryColor,
        }}
        pageProducts={tplProducts.map((p) => ({
          id: p.id,
          title: p.titleTh ?? p.title,
          imageUrl: p.imageUrl,
          priceTHB: Number(p.priceTHB),
          compareAtPriceTHB: p.compareAtPriceTHB
            ? Number(p.compareAtPriceTHB)
            : null,
          categoryName: p.categoryName,
        }))}
        categoryNames={categoryNames}
        categoryCounts={categoryCounts}
        selectedCats={[q]}
        sortKey={sortKey}
        currentPage={currentPageForTpl}
        totalPages={totalPagesForTpl}
        filteredCount={totalCountForTpl}
        buildUrl={(toggleCat, page) => {
          const sp = new URLSearchParams();
          sp.set("q", toggleCat ?? q);
          if (sortKey !== "relevance") sp.set("sort", sortKey);
          if (page && page > 1) sp.set("page", String(page));
          return `/stores/${store.slug}/search?${sp.toString()}`;
        }}
        buildSortUrl={(s) => {
          const sp = new URLSearchParams();
          sp.set("q", q);
          if (s && s !== "relevance") sp.set("sort", s);
          return `/stores/${store.slug}/search?${sp.toString()}`;
        }}
      />
    );
  }

  // Top-3 most-stocked categories — used in the empty/no-query state
  // as quick-jump links so the page is still useful with no search yet.
  const categoryCounts: Record<string, number> = {};
  for (const p of store.products) {
    if (p.categoryName) {
      categoryCounts[p.categoryName] = (categoryCounts[p.categoryName] ?? 0) + 1;
    }
  }
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // Build the OR clause across the searchable fields. Repeats are fine
  // — Prisma dedupes them at the SQL level.
  const where = q
    ? {
        storeId: store.id,
        active: true,
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { titleTh: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { descriptionTh: { contains: q, mode: "insensitive" as const } },
          { categoryName: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : null;

  let totalCount = 0;
  let pageProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  if (where) {
    totalCount = await prisma.product.count({ where });
    const totalPagesCalc = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPage = Math.min(requestedPage, totalPagesCalc);
    pageProducts = await prisma.product.findMany({
      where,
      orderBy: sort.orderBy,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  // URL helper — preserves q + sort, optionally swaps page
  const buildUrl = (overrides: { sort?: string; page?: number; q?: string } = {}) => {
    const sp = new URLSearchParams();
    const nextQ = overrides.q ?? q;
    if (nextQ) sp.set("q", nextQ);
    const nextSort = overrides.sort ?? sortKey;
    if (nextSort && nextSort !== "relevance") sp.set("sort", nextSort);
    const nextPage = overrides.page ?? currentPage;
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return `/stores/${store.slug}/search${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-8 sm:pt-10">
          <Breadcrumbs
            items={[
              { label: "หน้าแรก", href: `/stores/${store.slug}` },
              { label: q ? `ค้นหา "${q}"` : "ค้นหา" },
            ]}
          />
        </div>

        {/* ── Search input header ──────────────────────────────── */}
        <div
          className="border-b pb-6 pt-2"
          style={{ borderColor: "var(--shop-border)" }}
        >
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ color: "var(--shop-ink)" }}
          >
            {q ? `ผลการค้นหา` : "ค้นหาสินค้า"}
          </h1>

          {/* Refine query — GET form keeps the URL shareable */}
          <form
            method="GET"
            action={`/stores/${store.slug}/search`}
            className="relative max-w-xl"
          >
            <SearchIcon
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--shop-ink-muted)" }}
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="พิมพ์คำที่ต้องการค้นหา…"
              autoFocus={!q}
              className="w-full rounded-full border bg-[var(--shop-card)] pl-10 pr-24 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "var(--shop-border)",
                color: "var(--shop-ink)",
                // @ts-expect-error -- CSS custom property
                "--tw-ring-color": "var(--shop-primary)",
              }}
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-xs font-medium"
              style={{
                background: "var(--shop-primary)",
                color: "var(--shop-card)",
              }}
            >
              ค้นหา
            </button>
          </form>

          {q && (
            <div className="mt-4 flex items-baseline justify-between gap-3 flex-wrap">
              <p className="text-sm" style={{ color: "var(--shop-ink-muted)" }}>
                พบ{" "}
                <span className="font-semibold" style={{ color: "var(--shop-ink)" }}>
                  {totalCount.toLocaleString()}
                </span>{" "}
                รายการสำหรับ &ldquo;{q}&rdquo;
              </p>
              {totalCount > 0 && (
                <SortDropdown
                  currentSort={sortKey}
                  buildUrl={(s) => buildUrl({ sort: s, page: 1 })}
                />
              )}
            </div>
          )}
        </div>

        {/* ── Body: pre-search empty state OR results grid ──────── */}
        <section aria-labelledby="results-heading" className="pb-20 pt-8">
          <h2 id="results-heading" className="sr-only">
            ผลการค้นหา
          </h2>

          {!q ? (
            <PreSearchHints
              storeSlug={store.slug}
              topCategories={topCategories}
            />
          ) : totalCount === 0 ? (
            <NoResults storeSlug={store.slug} query={q} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                {pageProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    storeSlug={store.slug}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={PAGE_SIZE}
                  buildPageUrl={(p) => buildUrl({ page: p })}
                />
              )}
            </>
          )}

          <RecentlyViewedRail storeSlug={store.slug} />
        </section>
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Sort dropdown — same pattern as /category
 * ────────────────────────────────────────────────────────────── */
function SortDropdown({
  currentSort,
  buildUrl,
}: {
  currentSort: string;
  buildUrl: (sort: string) => string;
}) {
  return (
    <details className="relative group">
      <summary
        className="flex items-center gap-1 text-sm font-medium cursor-pointer list-none hover:opacity-80"
        style={{ color: "var(--shop-ink)" }}
      >
        <span>เรียงตาม: {SORT_OPTIONS[currentSort].label}</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div
        className="absolute right-0 mt-2 w-44 origin-top-right rounded-md shadow-lg z-10 ring-1 py-1"
        style={{
          background: "var(--shop-card)",
          boxShadow:
            "0 0 0 1px var(--shop-border), 0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        {Object.entries(SORT_OPTIONS).map(([key, opt]) => (
          <Link
            key={key}
            href={buildUrl(key)}
            scroll={false}
            className={`block px-4 py-2 text-sm transition-colors hover:opacity-100 ${
              currentSort === key ? "font-bold" : "opacity-75"
            }`}
            style={{
              color:
                currentSort === key
                  ? "var(--shop-primary)"
                  : "var(--shop-ink)",
            }}
          >
            {opt.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Product card — same markup as /category for visual consistency
 * ────────────────────────────────────────────────────────────── */
type ProductCardData = {
  id: string;
  title: string;
  titleTh: string | null;
  description: string | null;
  descriptionTh: string | null;
  priceTHB: unknown;
  compareAtPriceTHB: unknown;
  imageUrl: string | null;
  categoryName: string | null;
};

function ProductCard({
  product,
  storeSlug,
}: {
  product: ProductCardData;
  storeSlug: string;
}) {
  const title = product.titleTh || product.title;
  const price = Number(product.priceTHB);
  const imageUrl = product.imageUrl;
  const subtitle = product.categoryName ?? null;

  return (
    <div className="group relative">
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton
          storeSlug={storeSlug}
          product={{
            id: product.id,
            title,
            priceTHB: price,
            imageUrl: imageUrl ?? null,
          }}
        />
      </div>

      {/* Family C only — Story Quick-View trigger (CSS-gated to theme-C) */}
      <div className="absolute top-2 left-2 z-10">
        <StoryQuickViewTrigger
          storeSlug={storeSlug}
          product={{
            id: product.id,
            title: product.title,
            titleTh: product.titleTh,
            description: product.description,
            descriptionTh: product.descriptionTh,
            priceTHB: price,
            compareAtPriceTHB: product.compareAtPriceTHB
              ? Number(product.compareAtPriceTHB)
              : null,
            imageUrl,
            categoryName: product.categoryName,
          }}
        />
      </div>

      <div
        className="aspect-square w-full overflow-hidden rounded-md lg:aspect-auto lg:h-80"
        style={{
          background:
            "color-mix(in srgb, var(--shop-card) 88%, transparent)",
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center group-hover:opacity-75"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center text-xs"
            style={{ color: "var(--shop-ink-muted)" }}
          >
            ไม่มีรูปภาพ
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between gap-2">
        <div className="min-w-0">
          <h3
            className="text-sm line-clamp-2"
            style={{ color: "var(--shop-ink-muted)" }}
          >
            <Link
              href={`/stores/${storeSlug}/products/${product.id}`}
              className="hover:underline"
              style={{ color: "var(--shop-ink)" }}
            >
              <span aria-hidden="true" className="absolute inset-0" />
              {title}
            </Link>
          </h3>
          {subtitle && (
            <p
              className="mt-1 text-sm truncate"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <p
          className="text-sm font-medium whitespace-nowrap shrink-0"
          style={{ color: "var(--shop-ink)" }}
        >
          {formatTHB(price)}
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Empty state — when q is set but no products match
 * ────────────────────────────────────────────────────────────── */
function NoResults({
  storeSlug,
  query,
}: {
  storeSlug: string;
  query: string;
}) {
  return (
    <div
      className="text-center py-20 rounded-xl border border-dashed"
      style={{ borderColor: "var(--shop-border)" }}
    >
      <p
        className="text-base font-medium"
        style={{ color: "var(--shop-ink)" }}
      >
        ไม่พบสินค้าตรงกับ &ldquo;{query}&rdquo;
      </p>
      <p
        className="text-sm mt-2"
        style={{ color: "var(--shop-ink-muted)" }}
      >
        ลองปรับคำค้นหา หรือดูสินค้าทั้งหมดในร้าน
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="inline-block mt-6 rounded-full px-5 py-2 text-sm font-semibold"
        style={{
          background: "var(--shop-primary)",
          color: "var(--shop-card)",
        }}
      >
        ดูสินค้าทั้งหมด
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Pre-search hints — when no q yet
 * ────────────────────────────────────────────────────────────── */
function PreSearchHints({
  storeSlug,
  topCategories,
}: {
  storeSlug: string;
  topCategories: Array<{ name: string; count: number }>;
}) {
  if (topCategories.length === 0) {
    return (
      <div
        className="text-center py-20"
        style={{ color: "var(--shop-ink-muted)" }}
      >
        <p className="text-sm">เริ่มพิมพ์คำที่ต้องการค้นหาด้านบน</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          หมวดหมู่ยอดนิยมในร้านนี้
        </h3>
        <ul className="flex flex-wrap gap-2">
          {topCategories.map((cat) => (
            <li key={cat.name}>
              <Link
                href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(cat.name)}`}
                className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors hover:opacity-80"
                style={{
                  borderColor: "var(--shop-border)",
                  color: "var(--shop-ink)",
                }}
              >
                {cat.name}
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--shop-ink-muted)" }}
                >
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Link
          href={`/stores/${storeSlug}/category`}
          className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
          style={{ color: "var(--shop-primary)" }}
        >
          หรือดูสินค้าทั้งหมด <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Pagination — TUI Plus pattern (identical to /category)
 * ────────────────────────────────────────────────────────────── */
function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  buildPageUrl,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  buildPageUrl: (page: number) => string;
}) {
  const pages = computePageNumbers(currentPage, totalPages);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <nav
      className="mt-16 border-t flex flex-col items-center gap-3 px-4 sm:px-0 sm:flex-row sm:justify-between"
      style={{ borderColor: "var(--shop-border)" }}
      aria-label="Pagination"
    >
      <p
        className="hidden sm:block text-sm pt-4"
        style={{ color: "var(--shop-ink-muted)" }}
      >
        แสดง{" "}
        <span className="font-medium" style={{ color: "var(--shop-ink)" }}>
          {startItem.toLocaleString()}
        </span>
        {" – "}
        <span className="font-medium" style={{ color: "var(--shop-ink)" }}>
          {endItem.toLocaleString()}
        </span>
        {" / "}
        <span className="font-medium" style={{ color: "var(--shop-ink)" }}>
          {totalCount.toLocaleString()}
        </span>{" "}
        รายการ
      </p>

      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-1 -mt-px">
        <PageLink
          href={currentPage > 1 ? buildPageUrl(currentPage - 1) : null}
          ariaLabel="หน้าก่อน"
          variant="prev"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">ก่อนหน้า</span>
        </PageLink>

        <div className="hidden md:flex items-center -mt-px">
          {pages.map((p, i) =>
            p === "…" ? (
              <span
                key={`gap-${i}`}
                className="inline-flex items-center px-4 pt-4 text-sm"
                style={{ color: "var(--shop-ink-muted)" }}
              >
                …
              </span>
            ) : (
              <PageLink
                key={p}
                href={p === currentPage ? null : buildPageUrl(p)}
                ariaLabel={`หน้า ${p}`}
                ariaCurrent={p === currentPage ? "page" : undefined}
                variant="number"
                active={p === currentPage}
              >
                {p}
              </PageLink>
            ),
          )}
        </div>

        <span
          className="md:hidden text-sm font-medium"
          style={{ color: "var(--shop-ink)" }}
        >
          {currentPage} / {totalPages}
        </span>

        <PageLink
          href={
            currentPage < totalPages ? buildPageUrl(currentPage + 1) : null
          }
          ariaLabel="หน้าถัดไป"
          variant="next"
        >
          <span className="hidden sm:inline">ถัดไป</span>
          <ArrowRight className="h-4 w-4" />
        </PageLink>
      </div>
    </nav>
  );
}

function PageLink({
  href,
  children,
  ariaLabel,
  ariaCurrent,
  variant,
  active,
}: {
  href: string | null;
  children: React.ReactNode;
  ariaLabel: string;
  ariaCurrent?: "page";
  variant: "prev" | "next" | "number";
  active?: boolean;
}) {
  const baseClasses =
    "inline-flex items-center gap-2 border-t-2 pt-4 text-sm font-medium transition-colors";
  const padding =
    variant === "number" ? "px-4" : variant === "prev" ? "pr-1" : "pl-1";
  const inactiveStyle = {
    borderColor: "transparent",
    color: "var(--shop-ink-muted)",
  };
  const activeStyle = {
    borderColor: "var(--shop-primary)",
    color: "var(--shop-primary)",
  };

  if (href === null) {
    return (
      <span
        aria-disabled
        aria-current={ariaCurrent}
        className={`${baseClasses} ${padding} cursor-default`}
        style={active ? activeStyle : { ...inactiveStyle, opacity: 0.4 }}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      scroll
      className={`${baseClasses} ${padding} hover:border-current`}
      style={active ? activeStyle : inactiveStyle}
    >
      {children}
    </Link>
  );
}

function computePageNumbers(
  current: number,
  total: number,
): Array<number | "…"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const out: Array<number | "…"> = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) out.push("…");
  for (let p = left; p <= right; p++) out.push(p);
  if (right < total - 1) out.push("…");
  out.push(total);
  return out;
}
