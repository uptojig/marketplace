/**
 * /stores/{slug}/category — store catalog with filter sidebar.
 *
 * Layout follows Tailwind UI Plus e-commerce "Product list with
 * filters" pattern:
 *   - Hero: page title + result count + sort dropdown
 *   - Sidebar: category checkboxes with per-category counts
 *   - Main grid: clean 2/3/4-col responsive product cards
 *   - URL state: ?cat=A&cat=B&sort=price-asc (server-side, no JS)
 *
 * Theme cascade still works — uses `var(--shop-*)` so each store's
 * design family carries through (no hard-coded brand colors).
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { RecentlyViewedRail } from "@/components/storefront/RecentlyViewed";
import { WishlistButton } from "@/components/storefront/Wishlist";
import { StoryQuickViewTrigger } from "@/components/storefront/StoryQuickView";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";
import { TrustCategoryGrid } from "@/components/storefront/themes/trust/TrustCategoryGrid";
import { BusinessModelCategoryGrid } from "@/components/storefront/themes/business-model/BusinessModelCategoryGrid";
import { LifestyleCategoryGrid } from "@/components/storefront/themes/lifestyle/LifestyleCategoryGrid";
import { ElectronicsTechCategoryGrid } from "@/components/storefront/themes/electronics-tech/ElectronicsTechCategoryGrid";

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

export const dynamic = "force-dynamic";

const SORT_OPTIONS: Record<string, { label: string; orderBy: { [k: string]: "asc" | "desc" } }> = {
  newest: { label: "ใหม่ล่าสุด", orderBy: { createdAt: "desc" } },
  "price-asc": { label: "ราคาต่ำ → สูง", orderBy: { priceTHB: "asc" } },
  "price-desc": { label: "ราคาสูง → ต่ำ", orderBy: { priceTHB: "desc" } },
};

const PAGE_SIZE = 12;

export default async function CategoryIndexPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { cat?: string | string[]; sort?: string; page?: string };
}) {
  // ── Resolve filter + sort + page from URL ──────────────────────
  const selectedCats = Array.isArray(searchParams.cat)
    ? searchParams.cat
    : searchParams.cat
      ? [searchParams.cat]
      : [];
  const sortKey =
    searchParams.sort && SORT_OPTIONS[searchParams.sort]
      ? searchParams.sort
      : "newest";
  const sort = SORT_OPTIONS[sortKey];
  const requestedPage = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  // ── Load store with filtered + sorted products ─────────────────
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { active: true },
        orderBy: sort.orderBy,
      },
      categories: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  if (!store) notFound();

  // Per-family branching. Trust gets the squared TrustCategoryGrid
  // with heritage SKU + serif titles + gold-rule frame. Business-model
  // renders the dense rectangular deal-card grid with amber discount
  // stickers + mono prices + savings chips. Lifestyle gets the warm
  // catalog LifestyleCategoryGrid with rounded-3xl cards, tag chips,
  // optimistic taglines, and a sage squiggle divider. Electronics-tech
  // gets the spec-sheet ElectronicsTechCategoryGrid with mono SKUs and
  // mint stock chips. FB and the default continue to render the
  // ProductCard markup below (FB's theme-fashion-beauty cascade
  // promotes that grid into 4/5 portrait via the data-fb-promote-
  // portrait CSS hook).
  const isFB = isFashionBeautyStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isTrust = !isFB && isTrustStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isBM = !isFB && !isTrust && isBusinessModelStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isLifestyle = !isFB && !isTrust && !isBM && isLifestyleStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isElectronicsTech = !isFB && !isTrust && !isBM && !isLifestyle && isElectronicsTechStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });

  // Counts per category — always derived from full set so filter UI
  // can show stable numbers regardless of which filters are on
  const categoryCounts: Record<string, number> = {};
  let uncatCount = 0;
  for (const p of store.products) {
    if (p.categoryName) {
      categoryCounts[p.categoryName] = (categoryCounts[p.categoryName] ?? 0) + 1;
    } else {
      uncatCount += 1;
    }
  }
  const categoryNames = Object.keys(categoryCounts).sort();

  // Apply category filter on top of sorted set
  const filtered = selectedCats.length
    ? store.products.filter((p) => {
        const key = p.categoryName ?? "uncategorized";
        return selectedCats.includes(key);
      })
    : store.products;

  // ── Pagination ────────────────────────────────────────────────
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  // Clamp to a valid page if URL had a stale page=N after filter narrowed
  // the result set (e.g. switching from "all" to a small category drops
  // page=10 → page=1 instead of showing an empty grid).
  const currentPage = Math.min(requestedPage, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageProducts = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  // Build URL helper — preserves sort + filters + page
  // Filter toggles always reset page to 1 (per TUI Plus convention —
  // changing filters means the user wants a fresh list, not a deep
  // page from the previous filter state).
  const buildUrl = (toggleCat?: string, page?: number) => {
    const params = new URLSearchParams();
    if (sortKey !== "newest") params.set("sort", sortKey);
    const next = toggleCat
      ? selectedCats.includes(toggleCat)
        ? selectedCats.filter((c) => c !== toggleCat)
        : [...selectedCats, toggleCat]
      : selectedCats;
    for (const c of next) params.append("cat", c);
    if (page && page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/stores/${store.slug}/category${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-8 sm:pt-10">
          <Breadcrumbs
            items={[
              { label: "หน้าแรก", href: `/stores/${store.slug}` },
              { label: "สินค้าทั้งหมด" },
            ]}
          />
        </div>

        {/* ── Page header ──────────────────────────────────────── */}
        <div
          className="flex items-baseline justify-between border-b pb-6 pt-2"
          style={{
            borderColor: isTrust
              ? "var(--shop-accent)"
              : isLifestyle
                ? "var(--shop-accent)"
                : "var(--shop-border)",
          }}
        >
          <div>
            {isTrust && (
              <p
                className="mb-2 text-xs uppercase"
                style={{
                  color: "var(--shop-accent)",
                  letterSpacing: "0.28em",
                  fontWeight: 600,
                }}
              >
                Maison · The Collection
              </p>
            )}
            {isBM && (
              <p
                className="mb-2 text-xs font-semibold uppercase"
                style={{
                  color: "var(--shop-primary)",
                  letterSpacing: "0.12em",
                }}
              >
                Deal Dashboard · ดีลทั้งหมด
              </p>
            )}
            {isLifestyle && (
              <p
                className="mb-2 text-xs uppercase"
                style={{
                  color: "var(--shop-accent)",
                  letterSpacing: "0.18em",
                  fontWeight: 600,
                }}
              >
                Shop the catalog
              </p>
            )}
            {isElectronicsTech && (
              <p
                data-tech-mono="true"
                className="mb-2 text-[11px] uppercase"
                style={{
                  color: "var(--shop-ink-muted)",
                  fontFamily: TECH_MONO_FONT,
                  letterSpacing: "0.16em",
                  fontWeight: 600,
                }}
              >
                Catalog · All Products
              </p>
            )}
            <h1
              className="text-3xl md:text-4xl tracking-tight"
              style={{
                color: "var(--shop-ink)",
                ...(isTrust
                  ? {
                      fontFamily: TRUST_DISPLAY_FONT,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }
                  : isLifestyle
                    ? {
                        fontFamily: LIFESTYLE_DISPLAY_FONT,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                      }
                    : isElectronicsTech
                      ? {
                          fontFamily: TECH_DISPLAY_FONT,
                          fontWeight: 700,
                          letterSpacing: "-0.015em",
                        }
                      : { fontWeight: 700 }),
              }}
            >
              {isTrust
                ? "The Collection"
                : isBM
                  ? "Catalog & Deals"
                  : isLifestyle
                    ? "All the good stuff"
                    : isElectronicsTech
                      ? "All products"
                      : "สินค้าทั้งหมด"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm" style={{ color: "var(--shop-ink-muted)" }}>
              พบ {filtered.length.toLocaleString()} รายการ
            </span>

            {/* Sort dropdown — native select for zero-JS server-side state */}
            <SortDropdown
              currentSort={sortKey}
              storeSlug={store.slug}
              selectedCats={selectedCats}
            />
          </div>
        </div>

        {/* ── Managed-category banner rail ───────────────────────
            Renders a horizontal strip of operator-curated categories
            with their banner images (when uploaded). Hidden when the
            store has no managed Categories yet — the catalog still
            works off the legacy categoryName sidebar below. */}
        {store.categories.length > 0 && (
          <div className="pt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {store.categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/stores/${store.slug}/category/${encodeURIComponent(c.slug)}`}
                  className="group relative overflow-hidden rounded-lg border transition hover:shadow-md"
                  style={{ borderColor: "var(--shop-border)" }}
                >
                  <div
                    className="aspect-[4/3] w-full"
                    style={{ background: "var(--shop-card)" }}
                  >
                    {c.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.bannerUrl}
                        alt={c.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-xs"
                        style={{ color: "var(--shop-ink-muted)" }}
                      >
                        {c.name}
                      </div>
                    )}
                  </div>
                  <div
                    className="absolute inset-x-0 bottom-0 px-3 py-2 text-sm font-medium"
                    style={{
                      color: "#fff",
                      background:
                        "linear-gradient(0deg, rgba(0,0,0,0.6), rgba(0,0,0,0))",
                    }}
                  >
                    {c.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <section
          aria-labelledby="products-heading"
          className="pb-20 pt-8"
        >
          <h2 id="products-heading" className="sr-only">
            รายการสินค้า
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-x-10 gap-y-6">
            {/* ── Filter sidebar ────────────────────────────────── */}
            <aside>
              <FilterSection
                title="หมวดหมู่"
                items={[
                  ...categoryNames.map((name) => ({
                    key: name,
                    label: name,
                    count: categoryCounts[name],
                    href: buildUrl(name),
                    active: selectedCats.includes(name),
                  })),
                  ...(uncatCount > 0
                    ? [
                        {
                          key: "uncategorized",
                          label: "อื่นๆ",
                          count: uncatCount,
                          href: buildUrl("uncategorized"),
                          active: selectedCats.includes("uncategorized"),
                        },
                      ]
                    : []),
                ]}
              />

              {selectedCats.length > 0 && (
                <Link
                  href={buildUrl()}
                  className="mt-3 inline-block text-xs font-medium hover:underline"
                  style={{ color: "var(--shop-primary)" }}
                >
                  ล้างตัวกรอง ✕
                </Link>
              )}
            </aside>

            {/* ── Product grid ─────────────────────────────────── */}
            <div>
              {filtered.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {isTrust ? (
                    <TrustCategoryGrid
                      storeSlug={store.slug}
                      products={pageProducts.map((p) => ({
                        id: p.id,
                        title: p.titleTh ?? p.title,
                        imageUrl: p.imageUrl,
                        priceTHB: Number(p.priceTHB),
                        compareAtPriceTHB: p.compareAtPriceTHB
                          ? Number(p.compareAtPriceTHB)
                          : null,
                      }))}
                    />
                  ) : isBM ? (
                    <BusinessModelCategoryGrid
                      storeSlug={store.slug}
                      products={pageProducts.map((p) => ({
                        id: p.id,
                        title: p.titleTh ?? p.title,
                        imageUrl: p.imageUrl,
                        priceTHB: Number(p.priceTHB),
                        compareAtPriceTHB: p.compareAtPriceTHB
                          ? Number(p.compareAtPriceTHB)
                          : null,
                        // stockLeft drives the amber low-stock chip
                        // on the card. Only pass when variants are
                        // absent — variant-heavy products handle
                        // stock on the PDP.
                        stockLeft: p.hasVariants ? null : p.stockTotal,
                      }))}
                    />
                  ) : isLifestyle ? (
                    <LifestyleCategoryGrid
                      storeSlug={store.slug}
                      products={pageProducts.map((p) => ({
                        id: p.id,
                        title: p.titleTh ?? p.title,
                        imageUrl: p.imageUrl,
                        priceTHB: Number(p.priceTHB),
                        compareAtPriceTHB: p.compareAtPriceTHB
                          ? Number(p.compareAtPriceTHB)
                          : null,
                        categoryName: p.categoryName,
                      }))}
                    />
                  ) : isElectronicsTech ? (
                    <ElectronicsTechCategoryGrid
                      storeSlug={store.slug}
                      products={pageProducts.map((p) => ({
                        id: p.id,
                        title: p.titleTh ?? p.title,
                        imageUrl: p.imageUrl,
                        priceTHB: Number(p.priceTHB),
                        compareAtPriceTHB: p.compareAtPriceTHB
                          ? Number(p.compareAtPriceTHB)
                          : null,
                        // hasVariants OR untracked stockTotal=null → assume in-stock
                        inStock: p.hasVariants
                          ? true
                          : p.stockTotal === null
                            ? true
                            : p.stockTotal > 0,
                      }))}
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                      {pageProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          storeSlug={store.slug}
                        />
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalCount={totalCount}
                      pageSize={PAGE_SIZE}
                      buildPageUrl={(p) => buildUrl(undefined, p)}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Recently-viewed rail at the very bottom of the catalog
              page. Renders only if the visitor has opened a PDP before
              on this store (localStorage gated). */}
          <RecentlyViewedRail storeSlug={store.slug} />
        </section>
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Filter section — collapsible disclosure (Tailwind UI Plus pattern)
 * Uses native <details> for zero-JS server rendering.
 * ────────────────────────────────────────────────────────────── */
function FilterSection({
  title,
  items,
}: {
  title: string;
  items: Array<{
    key: string;
    label: string;
    count: number;
    href: string;
    active: boolean;
  }>;
}) {
  return (
    <details
      open
      className="border-b py-6 group"
      style={{ borderColor: "var(--shop-border)" }}
    >
      <summary className="flex w-full items-center justify-between text-sm font-medium cursor-pointer list-none" style={{ color: "var(--shop-ink)" }}>
        <span>{title}</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" style={{ color: "var(--shop-ink-muted)" }} />
      </summary>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              scroll={false}
              className="flex items-center gap-3 text-sm transition-colors group/link"
            >
              {/* Checkbox visual — pure CSS, no state */}
              <span
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
                style={{
                  borderColor: item.active
                    ? "var(--shop-primary)"
                    : "var(--shop-border)",
                  background: item.active
                    ? "var(--shop-primary)"
                    : "transparent",
                }}
              >
                {item.active && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span
                className={`flex-1 truncate ${
                  item.active ? "font-semibold" : "group-hover/link:underline"
                }`}
                style={{
                  color: item.active ? "var(--shop-ink)" : "var(--shop-ink-muted)",
                }}
              >
                {item.label}
              </span>
              <span
                className="text-xs font-mono shrink-0"
                style={{ color: "var(--shop-ink-muted)" }}
              >
                {item.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Sort dropdown — server-side links rendered as <details> menu
 * ────────────────────────────────────────────────────────────── */
function SortDropdown({
  currentSort,
  storeSlug,
  selectedCats,
}: {
  currentSort: string;
  storeSlug: string;
  selectedCats: string[];
}) {
  const buildUrl = (sort: string) => {
    const params = new URLSearchParams();
    if (sort !== "newest") params.set("sort", sort);
    for (const c of selectedCats) params.append("cat", c);
    const qs = params.toString();
    return `/stores/${storeSlug}/category${qs ? `?${qs}` : ""}`;
  };

  return (
    <details className="relative group">
      <summary className="flex items-center gap-1 text-sm font-medium cursor-pointer list-none hover:opacity-80" style={{ color: "var(--shop-ink)" }}>
        <span>เรียงตาม: {SORT_OPTIONS[currentSort].label}</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div
        className="absolute right-0 mt-2 w-44 origin-top-right rounded-md shadow-lg z-10 ring-1 py-1"
        style={{
          background: "var(--shop-card)",
          // ring color
          boxShadow: "0 0 0 1px var(--shop-border), 0 4px 16px rgba(0,0,0,0.08)",
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
              color: currentSort === key ? "var(--shop-primary)" : "var(--shop-ink)",
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
 * Product card — Tailwind UI Plus exact markup
 *   <div class="group relative">
 *     <img class="aspect-square ... rounded-md group-hover:opacity-75 lg:aspect-auto lg:h-80">
 *     <div class="mt-4 flex justify-between">
 *       <div>
 *         <h3><a><span class="absolute inset-0" /> Title</a></h3>
 *         <p class="text-gray-500">subtitle</p>
 *       </div>
 *       <p class="text-gray-900">price</p>
 *     </div>
 *   </div>
 * Theme-aware via var(--shop-*) so each design family still drives accent.
 * ────────────────────────────────────────────────────────────── */
function ProductCard({
  product,
  storeSlug,
}: {
  product: any;
  storeSlug: string;
}) {
  const title = product.titleTh || product.title;
  const price = Number(product.priceTHB);
  const imageUrl = product.imageUrl;
  const subtitle = product.categoryName ?? null;

  return (
    <div className="group relative">
      {/* Wishlist heart — top-right of image, above the card link's
          absolute-inset overlay so the button is clickable. */}
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

      {/* Family C only — Story Quick-View trigger, mirror to wishlist
          at top-left.  CSS-gated to .theme-C; renders nothing visually
          on other families. */}
      <div className="absolute top-2 left-2 z-10">
        <StoryQuickViewTrigger
          storeSlug={storeSlug}
          product={{
            id: product.id,
            title: product.title,
            titleTh: product.titleTh ?? null,
            description: product.description ?? null,
            descriptionTh: product.descriptionTh ?? null,
            priceTHB: price,
            compareAtPriceTHB: product.compareAtPriceTHB
              ? Number(product.compareAtPriceTHB)
              : null,
            imageUrl: imageUrl ?? null,
            categoryName: product.categoryName ?? null,
          }}
        />
      </div>

      <div
        className="aspect-square w-full overflow-hidden rounded-md"
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
 * Pagination — Tailwind UI Plus pattern
 *   ← Previous   1 ... 4 [5] 6 ... 12   Next →
 * Page numbers logic: always show 1 + last; current ± 2; ellipsis
 * fills gaps so the strip stays compact even at 50+ pages.
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
      {/* Range summary — visible on desktop, hidden on mobile */}
      <p
        className="hidden sm:block text-sm pt-4"
        style={{ color: "var(--shop-ink-muted)" }}
      >
        แสดง <span className="font-medium" style={{ color: "var(--shop-ink)" }}>{startItem.toLocaleString()}</span>
        {" – "}
        <span className="font-medium" style={{ color: "var(--shop-ink)" }}>{endItem.toLocaleString()}</span>
        {" / "}
        <span className="font-medium" style={{ color: "var(--shop-ink)" }}>{totalCount.toLocaleString()}</span>{" "}
        รายการ
      </p>

      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-1 -mt-px">
        {/* Prev */}
        <PageLink
          href={currentPage > 1 ? buildPageUrl(currentPage - 1) : null}
          ariaLabel="หน้าก่อน"
          variant="prev"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">ก่อนหน้า</span>
        </PageLink>

        {/* Page numbers — desktop only */}
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

        {/* Mobile compact: "X / Y" */}
        <span
          className="md:hidden text-sm font-medium"
          style={{ color: "var(--shop-ink)" }}
        >
          {currentPage} / {totalPages}
        </span>

        {/* Next */}
        <PageLink
          href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : null}
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

/**
 * One page-strip link. Matches TUI Plus: top-border accent on the
 * active page (border-t-2 with primary color); muted text otherwise.
 * Accepts href=null to render a disabled lookalike (so first/last
 * page disables the prev/next without removing the visual slot).
 */
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
  const padding = variant === "number" ? "px-4" : variant === "prev" ? "pr-1" : "pl-1";

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

/**
 * Compact list of page numbers around the current page with leading/
 * trailing ellipsis. Always includes 1 and last.
 *
 *   total=12 current=5  → [1, "…", 4, 5, 6, "…", 12]
 *   total=4  current=2  → [1, 2, 3, 4]
 *   total=8  current=1  → [1, 2, 3, "…", 8]
 *   total=8  current=8  → [1, "…", 6, 7, 8]
 */
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

/* ──────────────────────────────────────────────────────────────
 * Empty state
 * ────────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div
      className="text-center py-24 rounded-xl border border-dashed"
      style={{ borderColor: "var(--shop-border)" }}
    >
      <p className="text-base font-medium" style={{ color: "var(--shop-ink)" }}>
        ไม่พบสินค้าตรงกับตัวกรอง
      </p>
      <p className="text-sm mt-2" style={{ color: "var(--shop-ink-muted)" }}>
        ลองปรับตัวกรองหรือล้างตัวกรองเพื่อดูสินค้าทั้งหมด
      </p>
    </div>
  );
}
