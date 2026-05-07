import { notFound } from "next/navigation";
import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Clock } from "lucide-react";
import { ShopAddButton } from "@/components/shop/ShopAddButton";
import { SortSelect } from "@/components/shop/SortSelect";
import {
  LandingPage,
  type Block,
  type ThemeVariant,
} from "@/components/storefront/BlockRenderer";
import { MultiPageRenderer } from "@/components/storefront/MultiPageRenderer";
import { HtmlRenderer, isHtmlSchema } from "@/components/storefront/HtmlRenderer";
import { isValidThemeVariant } from "@/lib/landing/families";
import { isV12Schema } from "@/lib/multi-page-migration";
import { DynamicBlockRenderer } from "@/components/DynamicBlockRenderer";
import {
  MiniMopsTemplate,
  type MiniMopsProduct,
  type MiniMopsStore,
} from "@/components/storefront/templates/MiniMopsTemplate";
import {
  isReactTemplateSchema,
  type ReactTemplateSchema,
} from "@/components/storefront/templates/registry";

export const dynamic = "force-dynamic";

type TabId = "all" | "hot" | "new" | "sale";
type Tab = { id: TabId; label: string };
const ALL_TABS: Tab[] = [
  { id: "all", label: "สินค้าทั้งหมด" },
  { id: "hot", label: "ขายดี" },
  { id: "new", label: "มาใหม่" },
  { id: "sale", label: "ลดราคา" },
];

const SOLD_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.SUPPLIER_PLACED,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

function formatThaiDate(d: Date) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

type StoreWithRelations = Awaited<
  ReturnType<typeof prisma.store.findUnique<{ where: { slug: string } }>>
>;

async function renderReactTemplate(
  store: NonNullable<StoreWithRelations>,
  schema: ReactTemplateSchema,
) {
  // Pull approved + active products for this store
  const dbProducts = await prisma.product.findMany({
    where: { storeId: store.id, active: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  // Sold counts → reviews proxy
  const soldGroups = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      storeId: store.id,
      order: { status: { in: SOLD_STATUSES } },
    },
    _sum: { qty: true },
  });
  const soldMap = new Map(
    soldGroups.map((g) => [g.productId, g._sum.qty ?? 0]),
  );

  const products: MiniMopsProduct[] = dbProducts.map((p) => ({
    id: p.id,
    title: p.titleTh ?? p.title,
    priceTHB: Number(p.priceTHB),
    compareAtPriceTHB: p.compareAtPriceTHB ? Number(p.compareAtPriceTHB) : null,
    imageUrl: p.imageUrl,
    category: p.categoryName,
    rating: 5.0, // we don't track ratings yet — surface a default
    reviews: soldMap.get(p.id) ?? 0,
  }));

  const featured = schema.featuredProductId
    ? products.find((p) => p.id === schema.featuredProductId) ?? null
    : null;

  // Auto-derive nav categories from product data if admin didn't supply any
  const autoCategories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => !!c)),
  )
    .slice(0, 4)
    .map((c) => ({ label: c, category: c }));

  const navCategories =
    schema.navCategories && schema.navCategories.length > 0
      ? schema.navCategories
      : autoCategories;

  const templateStore: MiniMopsStore = {
    slug: store.slug,
    name: store.name,
    tagline: store.tagline,
    description: store.description,
    bannerUrl: store.bannerUrl,
    primaryColor: store.primaryColor ?? "#10b981",
  };

  // Currently we only have one template id; future ids switch on schema.template
  if (schema.template === "mini-mops-v1") {
    return (
      <MiniMopsTemplate
        store={templateStore}
        products={products}
        featuredProduct={featured}
        navCategories={navCategories}
        gridHeading={schema.gridHeading}
        gridSubheading={schema.gridSubheading}
      />
    );
  }

  // Unknown template id — fall back gracefully
  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">ไม่รู้จัก template</h1>
      <p className="text-gray-600">
        Template id <code>{schema.template}</code> ไม่ได้อยู่ใน registry
      </p>
    </div>
  );
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { q?: string; sort?: string; tab?: string; category?: string };
}) {
  const tab = searchParams.tab ?? "all";
  const sort = searchParams.sort ?? (tab === "hot" ? "best-selling" : tab === "new" ? "newest" : "");

  const baseStore = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!baseStore) notFound();

  // ── HTML schema (new: unique designs) ────────────────────────
  if (baseStore.landingBlocks && isHtmlSchema(baseStore.landingBlocks)) {
    return (
      <HtmlRenderer
        schema={baseStore.landingBlocks}
        pageSlug=""
        storeSlug={baseStore.slug}
      />
    );
  }

  // ── React template (curated designs, e.g. Mini Mops) ────────
  if (baseStore.landingBlocks && isReactTemplateSchema(baseStore.landingBlocks)) {
    return renderReactTemplate(baseStore, baseStore.landingBlocks);
  }

  // ── block_registry_v1 (AI block system) ─────────────────────
  if (
    baseStore.landingBlocks &&
    typeof baseStore.landingBlocks === "object" &&
    (baseStore.landingBlocks as any).type === "block_registry_v1"
  ) {
    const data = baseStore.landingBlocks as any;
    let blocks = Array.isArray(data.blocks) ? data.blocks : [];
    if (blocks.length === 0 && Array.isArray(data.pages) && data.pages.length > 0) {
      const homePage = data.pages.find((p: any) => p.slug === "home") || data.pages[0];
      if (homePage && Array.isArray(homePage.blocks)) {
        blocks = homePage.blocks;
      }
    }
    
    return (
      <div className="flex flex-col min-h-screen" style={data.themeColor ? { "--primary": data.themeColor } as React.CSSProperties : {}}>
        {blocks.map((block: any, index: number) => {
          if (block.type === "Nav" || block.type === "Footer") return null;
          return <DynamicBlockRenderer key={index} block={block} themeColor={data.themeColor} storeSlug={baseStore.slug} />;
        })}
      </div>
    );
  }

  // ── v12 multi-page schema (legacy) ─────────────────────────
  if (baseStore.landingBlocks && typeof baseStore.landingBlocks === "object" && isV12Schema(baseStore.landingBlocks)) {
    // Single query gives us BOTH the activeProductIds Set (filter
    // input) AND the fallbackProducts list (substitution material
    // when an OfferGrid empties because the schema references rows
    // that no longer exist). Take=12 caps the substitution to
    // typical OfferGrid size; we don't need the whole catalog here.
    const activeRows = await prisma.product.findMany({
      where: { storeId: baseStore.id, active: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        externalProductId: true,
        title: true,
        titleTh: true,
        priceTHB: true,
        imageUrl: true,
      },
    });
    const activeProductIds = new Set(
      activeRows.map((r) => r.externalProductId).filter((s): s is string => !!s),
    );
    const fallbackProducts = activeRows.map((r) => ({
      externalProductId: r.externalProductId,
      title: r.title,
      titleTh: r.titleTh,
      priceTHB: Number(r.priceTHB),
      imageUrl: r.imageUrl,
    }));
    return (
      <MultiPageRenderer
        schema={baseStore.landingBlocks}
        pageSlug=""
        storeSlug={baseStore.slug}
        storeName={baseStore.name}
        // Operator-uploaded banner overrides the agent's placehold.co
        // hero image across every page in the schema.
        storeBannerUrl={baseStore.bannerUrl}
        activeProductIds={activeProductIds}
        fallbackProducts={fallbackProducts}
      />
    );
  }

  // ── v11 single-page landing blocks ──────────────────────────
  // When เป็ด has designed a unique landing page for this store, we
  // render those blocks INSTEAD of the generic product grid below.
  // The generic grid stays as the fallback for stores whose admin
  // hasn't triggered a generation yet.
  //
  // Drop "Nav" and "Footer" blocks: ShopLayout already renders the store's
  // canonical header (logo / search / cart / categories) and footer (5-column
  // shipping / contact / policies). Agent-generated chrome is redundant and
  // showed up as duplicate headers/footers on production.
  //
  // Agent 01 v3 emits `type` (not `blockType`) — we accept either for
  // forward compat. BlockRenderer also handles either internally.
  const landingBlocks = Array.isArray(baseStore.landingBlocks)
    ? (baseStore.landingBlocks as unknown[])
        .map((b): Block | null => {
          if (!b || typeof b !== "object") return null;
          const obj = b as Record<string, unknown>;
          const t =
            typeof obj.blockType === "string"
              ? obj.blockType
              : typeof obj.type === "string"
                ? obj.type
                : null;
          if (!t) return null;
          return { ...(obj as Block), blockType: t };
        })
        .filter(
          (b): b is Block =>
            !!b && b.blockType !== "Nav" && b.blockType !== "Footer",
        )
    : [];
  if (landingBlocks.length > 0) {
    // Accept any v3 design family (A-I) plus legacy "minimal"/"cute" — fall
    // back to "A" (Editorial Minimal Warm) for unknown / unset values.
    const stored = baseStore.landingThemeVariant;
    const theme: ThemeVariant = isValidThemeVariant(stored ?? "")
      ? (stored as ThemeVariant)
      : "A";
    return (
      <LandingPage
        blocks={landingBlocks}
        theme={theme}
        storeSlug={baseStore.slug}
      />
    );
  }

  const q = searchParams.q;
  const category = searchParams.category;
  const productWhere = {
    storeId: baseStore.id,
    active: true,
    ...(category ? { categoryName: category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { titleTh: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const soldGroups = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      storeId: baseStore.id,
      order: { status: { in: SOLD_STATUSES } },
    },
    _sum: { qty: true },
  });
  const soldMap = new Map(soldGroups.map((g) => [g.productId, g._sum.qty ?? 0]));

  let products = await prisma.product.findMany({
    where: productWhere,
    orderBy:
      sort === "low-to-high"
        ? { priceTHB: "asc" }
        : sort === "high-to-low"
          ? { priceTHB: "desc" }
          : sort === "newest"
            ? { createdAt: "desc" }
            : { createdAt: "desc" },
    take: 200,
  });

  if (sort === "best-selling") {
    products = products
      .map((p) => ({ p, sold: soldMap.get(p.id) ?? 0 }))
      .sort((a, b) => b.sold - a.sold || b.p.createdAt.getTime() - a.p.createdAt.getTime())
      .map((x) => x.p);
  } else if (sort === "order-by-stock") {
    // best-effort placeholder; later: join via ProductVariant.inventory
  }

  const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
  const tabCounts: Record<TabId, number> = {
    all: products.length,
    hot: products.filter((p) => (soldMap.get(p.id) ?? 0) > 0).length,
    new: products.filter((p) => p.createdAt.getTime() >= thirtyDaysAgo).length,
    sale: products.filter(
      (p) =>
        p.compareAtPriceTHB && Number(p.compareAtPriceTHB) > Number(p.priceTHB),
    ).length,
  };

  const tabs: Tab[] = ALL_TABS.filter(
    (t) => t.id === "all" || tabCounts[t.id] > 0,
  );

  if (tab === "hot") {
    products = products.filter((p) => (soldMap.get(p.id) ?? 0) > 0);
  } else if (tab === "new") {
    products = products.filter((p) => p.createdAt.getTime() >= thirtyDaysAgo);
  } else if (tab === "sale") {
    products = products.filter(
      (p) =>
        p.compareAtPriceTHB && Number(p.compareAtPriceTHB) > Number(p.priceTHB),
    );
  }

  products = products.slice(0, 60);

  const store = { ...baseStore, products };

  const primary = store.primaryColor ?? "#008BF8";
  const updatedAt = formatThaiDate(store.createdAt);

  return (
    <>
      {/* Banner area */}
      <section style={{ background: 'var(--shop-card)' }}>
        <div className="container mx-auto max-w-[1200px] px-4 pt-4">
          <div className="overflow-hidden rounded-lg">
            {store.bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.bannerUrl}
                alt={store.name}
                className="h-auto w-full object-cover"
              />
            ) : (
              <div
                className="flex aspect-[1179/476] w-full items-center justify-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${primary}33, ${primary}cc)`,
                }}
              >
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold drop-shadow md:text-5xl">{store.name}</h2>
                  {store.tagline && <p className="mt-2 text-lg drop-shadow">{store.tagline}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Shop intro — description only, follower/rating stats hidden until real */}
      {(store.description || store.tagline) && (
        <section className="container mx-auto max-w-[1200px] px-4 mt-6">
          <p style={{ color: 'var(--shop-ink)' }}>
            {store.description ?? store.tagline}
          </p>
          <div className="mt-2 flex items-center text-xs" style={{ color: 'var(--shop-ink-muted)' }}>
            <Clock className="mr-1 h-3 w-3" />
            ปรับปรุงล่าสุด {updatedAt}
          </div>
        </section>
      )}

      {/* Tabs + sort */}
      <section className="container mx-auto max-w-[1200px] px-4 mt-10">
        <div className="grid gap-3 lg:grid-cols-12 items-end">
          <div className="lg:col-span-10">
            <div className="flex items-end gap-6 overflow-x-auto pb-1">
              {tabs.map((t) => {
                const active = (searchParams.tab ?? "all") === t.id;
                const count = tabCounts[t.id];
                const params = new URLSearchParams();
                if (t.id !== "all") params.set("tab", t.id);
                if (category) params.set("category", category);
                if (q) params.set("q", q);
                const href = `/stores/${store.slug}${params.toString() ? `?${params}` : ""}`;
                return (
                  <Link
                    key={t.id}
                    href={href}
                    scroll={false}
                    className={`group text-nowrap text-base transition ${
                      active ? "text-2xl font-bold" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {t.label}
                    <span className={`ml-1 text-xs ${active ? "text-gray-500" : "text-gray-400"}`}>
                      ({count})
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-2">
            <SortSelect defaultValue={searchParams.sort ?? ""} />
          </div>
        </div>

        {/* Product grid */}
        <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {store.products.map((p) => {
            const compare = p.compareAtPriceTHB ? Number(p.compareAtPriceTHB) : null;
            const price = Number(p.priceTHB);
            const salePct = compare && compare > price ? Math.round(((compare - price) / compare) * 100) : 0;
            const sold = soldMap.get(p.id) ?? 0;
            return (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-lg border transition hover:shadow"
                style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}
              >
                <Link
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="relative block aspect-square overflow-hidden bg-gray-100"
                >
                  {p.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.titleTh ?? p.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                  {salePct > 0 && (
                    <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                      -{salePct}%
                    </span>
                  )}
                  {sold > 0 && (
                    <span className="absolute right-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                      🔥 ขายแล้ว {sold.toLocaleString("th-TH")}
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <Link
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="line-clamp-2 text-sm hover:underline"
                  >
                    {p.titleTh ?? p.title}
                  </Link>
                  <div className="mt-auto flex items-baseline gap-2 pt-2">
                    <span className="text-base font-bold" style={{ color: salePct > 0 ? "#dc2626" : primary }}>
                      ฿ {price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </span>
                    {compare && compare > price && (
                      <span className="text-xs text-gray-400 line-through">
                        ฿ {compare.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  {sold > 0 && (
                    <div className="text-[11px] text-gray-500">ขายแล้ว {sold.toLocaleString("th-TH")} ชิ้น</div>
                  )}
                  <div className="mt-1">
                    <ShopAddButton
                      product={{
                        id: p.id,
                        title: p.titleTh ?? p.title,
                        priceTHB: price,
                        imageUrl: p.imageUrl ?? undefined,
                        storeName: store.name,
                        storeSlug: store.slug,
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
          {store.products.length === 0 && (
            <p className="col-span-full text-center text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
              ยังไม่มีสินค้าในร้านนี้
            </p>
          )}
        </div>
      </section>
    </>
  );
}
