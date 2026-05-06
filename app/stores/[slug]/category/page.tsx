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
import { ChevronDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SORT_OPTIONS: Record<string, { label: string; orderBy: { [k: string]: "asc" | "desc" } }> = {
  newest: { label: "ใหม่ล่าสุด", orderBy: { createdAt: "desc" } },
  "price-asc": { label: "ราคาต่ำ → สูง", orderBy: { priceTHB: "asc" } },
  "price-desc": { label: "ราคาสูง → ต่ำ", orderBy: { priceTHB: "desc" } },
};

export default async function CategoryIndexPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { cat?: string | string[]; sort?: string };
}) {
  // ── Resolve filter + sort from URL ─────────────────────────────
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

  // ── Load store with filtered + sorted products ─────────────────
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { active: true },
        orderBy: sort.orderBy,
      },
    },
  });
  if (!store) notFound();

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

  // Build URL helper — preserves sort, toggles cat
  const buildUrl = (toggleCat?: string) => {
    const params = new URLSearchParams();
    if (sortKey !== "newest") params.set("sort", sortKey);
    const next = toggleCat
      ? selectedCats.includes(toggleCat)
        ? selectedCats.filter((c) => c !== toggleCat)
        : [...selectedCats, toggleCat]
      : selectedCats;
    for (const c of next) params.append("cat", c);
    const qs = params.toString();
    return `/stores/${store.slug}/category${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Page header ──────────────────────────────────────── */}
        <div className="flex items-baseline justify-between border-b pb-6 pt-12 lg:pt-16" style={{ borderColor: "var(--shop-border)" }}>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "var(--shop-ink)" }}>
            สินค้าทั้งหมด
          </h1>
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
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                  {filtered.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      storeSlug={store.slug}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  storeSlug: string;
}) {
  const title = product.titleTh || product.title;
  const price = Number(product.priceTHB);
  const imageUrl = product.imageUrl;
  const subtitle = product.categoryName ?? null;

  return (
    <div className="group relative">
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
