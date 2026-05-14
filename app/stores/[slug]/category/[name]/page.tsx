import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ShopAddButton } from "@/components/shop/ShopAddButton";
import { SortSelect } from "@/components/shop/SortSelect";
import { Card } from "@/components/ui/card";
import { StatsBlock } from "@/components/blocks/stats";
import { TestimonialBlock } from "@/components/blocks/testimonial";
import ProductList, {
  type ProductItem,
} from "@/components/shadcn-studio/blocks/product-list-03/product-list-03";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { FashionBeautyCategoryGrid } from "@/components/storefront/themes/fashion-beauty/FashionBeautyCategoryGrid";
import { isSpecialtyStore } from "@/lib/landing/specialty";
import { SpecialtyCategoryGrid } from "@/components/storefront/themes/specialty/SpecialtyCategoryGrid";

export const dynamic = "force-dynamic";

/**
 * /stores/<slug>/category/<name-or-slug>
 *
 * Two lookup strategies, in order:
 *
 *   1. Treat the URL segment as a vendor-defined Category.slug.
 *      Found → display the Category's banner + description, and
 *      filter products by Category.id (not categoryName) so renames
 *      don't break old URLs.
 *
 *   2. Fall back to the legacy free-form categoryName match for
 *      products that haven't been bucketed into a real Category yet
 *      (e.g. supplier-imported rows that arrive with a CJ category
 *      string).
 */
export default async function StoreCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string; name: string };
  searchParams: { sort?: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  const segment = decodeURIComponent(params.name);
  const sort = searchParams.sort ?? "";

  // Strategy 1: vendor-managed Category by slug
  const managedCategory = await prisma.category.findUnique({
    where: { storeId_slug: { storeId: store.id, slug: segment } },
  });

  // Strategy 2: legacy categoryName fallback
  const headerName = managedCategory?.name ?? segment;
  const productWhere = managedCategory
    ? { storeId: store.id, active: true, categoryId: managedCategory.id }
    : { storeId: store.id, active: true, categoryName: segment };

  const [
    products,
    totalInCategory,
    managedCategoryRows,
    legacyCategoryRows,
    totalAllProducts,
    managedCounts,
  ] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      orderBy:
        sort === "low-to-high"
          ? { priceTHB: "asc" }
          : sort === "high-to-low"
            ? { priceTHB: "desc" }
            : { createdAt: "desc" },
      take: 200,
    }),
    prisma.product.count({ where: productWhere }),
    prisma.category.findMany({
      where: { storeId: store.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.product.findMany({
      where: {
        storeId: store.id,
        active: true,
        categoryId: null,
        categoryName: { not: null },
      },
      select: { categoryName: true },
      distinct: ["categoryName"],
      orderBy: { categoryName: "asc" },
    }),
    prisma.product.count({ where: { storeId: store.id, active: true } }),
    // Per-managed-category active product counts. Computed separately
    // so we don't need Prisma's filteredRelationCount preview feature
    // (the schema generator block stays vanilla).
    prisma.product.groupBy({
      by: ["categoryId"],
      where: {
        storeId: store.id,
        active: true,
        categoryId: { not: null },
      },
      _count: { _all: true },
    }),
  ]);

  const managedCountMap = new Map(
    managedCounts.map((g) => [g.categoryId ?? "", g._count._all]),
  );
  const managedCategories = managedCategoryRows.map((c) => ({
    ...c,
    activeProductCount: managedCountMap.get(c.id) ?? 0,
  }));

  const legacyCategories = legacyCategoryRows
    .map((r) => r.categoryName)
    .filter((c): c is string => !!c);

  // Counts for the legacy (non-managed) labels — only used for the
  // sidebar; managed categories already have their counts inlined
  // via _count.products above.
  const legacyCounts = await prisma.product.groupBy({
    by: ["categoryName"],
    where: {
      storeId: store.id,
      active: true,
      categoryId: null,
      categoryName: { not: null },
    },
    _count: { _all: true },
  });
  const legacyCountMap = new Map(
    legacyCounts.map((g) => [g.categoryName ?? "", g._count._all]),
  );

  // Stats block inputs — average price across the active category, in
  // round THB. Rating is placeholder until per-product reviews exist.
  const avgPrice =
    products.length > 0
      ? Math.round(
          products.reduce((sum, p) => sum + Number(p.priceTHB), 0) /
            products.length,
        )
      : 0;

  // Per-template design family. fashion-beauty (lookbook /
  // beauty-swatch / boutique) renders an editorial portrait grid
  // and a serif display headline; specialty (handmade / vintage)
  // renders a kraft-paper masonry grid with handwritten subtitles;
  // the default keeps the dense shadcn-studio product-list-03.
  //
  // FB wins ties so a store can't accidentally render two grids.
  const isFB = isFashionBeautyStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isSpecialty = !isFB && isSpecialtyStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });

  // Adapter for shadcn-studio product-list-03. Seller chip surfaces
  // the store name + logo so every card carries the same brand row
  // regardless of whether per-product authors exist.
  const productListItems: ProductItem[] = products.map((p) => ({
    productSrc:
      p.imageUrl ?? "https://placehold.co/640x640/png?text=No+Image",
    productAlt: p.titleTh ?? p.title,
    name: p.titleTh ?? p.title,
    price: Number(p.priceTHB),
    productLink: `/stores/${store.slug}/products/${p.id}`,
    sellerName: store.name,
    avatarSrc: store.logoUrl ?? undefined,
    avatarFallback: (store.name ?? "S").slice(0, 1).toUpperCase(),
    avatarAlt: store.name,
    category: headerName,
  }));

  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-6">
      <Link
        href={`/stores/${store.slug}`}
        className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
        style={{ color: "var(--shop-ink)" }}
      >
        <ChevronLeft className="h-4 w-4" />
        กลับหน้าร้าน
      </Link>

      {/* Hero banner — only when the operator has uploaded one for this
          managed category. Legacy categoryName paths render plain text. */}
      {managedCategory?.bannerUrl && (
        <div
          className="mt-3 overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--shop-border)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={managedCategory.bannerUrl}
            alt={managedCategory.name}
            className="h-48 w-full object-cover sm:h-60 md:h-72"
          />
        </div>
      )}

      <div className={isFB || isSpecialty ? "mt-8 flex flex-wrap items-end justify-between gap-4" : "mt-3 flex flex-wrap items-end justify-between gap-4"}>
        <div>
          <p
            className={
              isFB
                ? "text-xs uppercase tracking-[0.22em]"
                : isSpecialty
                  ? "text-lg italic"
                  : "text-xs uppercase tracking-wide opacity-60"
            }
            style={
              isSpecialty
                ? {
                    color: "var(--shop-accent)",
                    fontFamily:
                      'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive',
                  }
                : { color: isFB ? "var(--shop-ink-muted)" : "var(--shop-ink)" }
            }
          >
            {isFB
              ? "Edit / Collection"
              : isSpecialty
                ? "the maker's market"
                : "หมวดหมู่"}
          </p>
          <h1
            className={
              isFB || isSpecialty
                ? "mt-2 text-4xl sm:text-5xl md:text-6xl"
                : "mt-0.5 text-2xl font-bold"
            }
            style={
              isFB
                ? {
                    color: "var(--shop-ink)",
                    fontFamily:
                      'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif',
                    fontWeight: 500,
                    letterSpacing: '-0.005em',
                  }
                : isSpecialty
                  ? {
                      color: "var(--shop-ink)",
                      fontFamily:
                        'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif',
                      fontWeight: 500,
                      letterSpacing: '-0.005em',
                    }
                  : { color: "var(--shop-ink)" }
            }
          >
            {headerName}
          </h1>
          {managedCategory?.description && (
            <p
              className="mt-1 max-w-2xl text-sm"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              {managedCategory.description}
            </p>
          )}
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--shop-ink-muted)" }}
          >
            {totalInCategory.toLocaleString()} สินค้า
          </p>
        </div>
        <SortSelect defaultValue={sort} />
      </div>

      {/* shadcn-studio Stats — category-level numbers across the band.
          Different from PDP (Reviews) + Cart (Countdown) so each page
          type carries its own visual signature. */}
      {totalInCategory > 0 && (
        <div className="mt-4">
          <StatsBlock
            items={[
              { value: totalInCategory.toLocaleString(), label: "สินค้าในหมวดนี้" },
              {
                value: avgPrice > 0 ? `฿${avgPrice.toLocaleString()}` : "—",
                label: "ราคาเฉลี่ย",
              },
              { value: "4.8★", label: "เรตติ้งร้าน" },
              { value: "1-3", label: "วันจัดส่ง" },
            ]}
          />
        </div>
      )}

      {/* Horizontal category chip bar — replaces the legacy sidebar.
          Scrolls horizontally on mobile so all categories stay reachable
          without consuming vertical space above the polished ProductList. */}
      <nav className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-2 pb-2 text-sm">
          <li>
            <Link
              href={`/stores/${store.slug}`}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 opacity-80 hover:opacity-100"
              style={{
                color: "var(--shop-ink)",
                borderColor: "var(--shop-border)",
                background: "var(--shop-card)",
              }}
            >
              <span>ทั้งหมด</span>
              <span className="text-xs opacity-60">{totalAllProducts}</span>
            </Link>
          </li>
          {managedCategories.map((c) => {
            const isActive = managedCategory?.id === c.id;
            return (
              <li key={c.id}>
                <Link
                  href={`/stores/${store.slug}/category/${encodeURIComponent(c.slug)}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5"
                  style={{
                    color: isActive ? "#fff" : "var(--shop-ink)",
                    borderColor: isActive
                      ? "var(--shop-primary)"
                      : "var(--shop-border)",
                    background: isActive
                      ? "var(--shop-primary)"
                      : "var(--shop-card)",
                  }}
                >
                  <span>{c.name}</span>
                  <span
                    className={`text-xs ${
                      isActive ? "text-white/80" : "opacity-60"
                    }`}
                  >
                    {c.activeProductCount}
                  </span>
                </Link>
              </li>
            );
          })}
          {legacyCategories.map((c) => {
            const isActive = !managedCategory && c === segment;
            return (
              <li key={c}>
                <Link
                  href={`/stores/${store.slug}/category/${encodeURIComponent(c)}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5"
                  style={{
                    color: isActive ? "#fff" : "var(--shop-ink)",
                    borderColor: isActive
                      ? "var(--shop-primary)"
                      : "var(--shop-border)",
                    background: isActive
                      ? "var(--shop-primary)"
                      : "var(--shop-card)",
                  }}
                >
                  <span>{c}</span>
                  <span
                    className={`text-xs ${
                      isActive ? "text-white/80" : "opacity-60"
                    }`}
                  >
                    {legacyCountMap.get(c) ?? 0}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* shadcn-studio product-list-03 — polished 4-up grid with
          image, name, price, store-as-seller chip, verified tick.
          Renders full-width below the chip bar; falls back to a soft
          empty state when the category has no products. */}
      {products.length === 0 ? (
        <Card
          className="mt-6 rounded-lg p-10 text-center shadow-none"
          style={{
            background: "var(--shop-card)",
            borderColor: "var(--shop-border)",
          }}
        >
          <p style={{ color: "var(--shop-ink-muted)" }}>
            ยังไม่มีสินค้าในหมวดนี้
          </p>
          <Link
            href={`/stores/${store.slug}`}
            className="mt-3 inline-block text-sm hover:underline"
            style={{ color: "var(--shop-primary)" }}
          >
            ดูสินค้าทั้งหมด
          </Link>
        </Card>
      ) : isFB ? (
        <div className="mt-10">
          <FashionBeautyCategoryGrid
            storeSlug={store.slug}
            products={products.map((p) => ({
              id: p.id,
              title: p.titleTh ?? p.title,
              imageUrl: p.imageUrl,
              priceTHB: Number(p.priceTHB),
              compareAtPriceTHB: p.compareAtPriceTHB
                ? Number(p.compareAtPriceTHB)
                : null,
            }))}
          />
        </div>
      ) : isSpecialty ? (
        <div className="mt-10">
          <SpecialtyCategoryGrid
            storeSlug={store.slug}
            products={products.map((p) => ({
              id: p.id,
              title: p.titleTh ?? p.title,
              imageUrl: p.imageUrl,
              priceTHB: Number(p.priceTHB),
              compareAtPriceTHB: p.compareAtPriceTHB
                ? Number(p.compareAtPriceTHB)
                : null,
            }))}
          />
        </div>
      ) : (
        <div className="mt-2 -mx-4 sm:mx-0">
          <ProductList
            title={headerName}
            currency="฿"
            products={productListItems}
          />
        </div>
      )}

      {/* shadcn-studio Testimonial — featured customer quotes specific
          to the category's typical shopping motivation. */}
      <TestimonialBlock
        title="ลูกค้าพูดถึงร้านนี้"
        layoutStyle="grid"
        quotes={[
          {
            text: "ของหลากหลาย ราคาดี แพ็คดี ส่งเร็วทันใจ",
            author: "คุณนัท",
            location: "กรุงเทพฯ",
            rating: 5,
          },
          {
            text: "สั่งหลายครั้งแล้ว ของไม่เคยพลาด แอดมินตอบเร็ว",
            author: "คุณจอย",
            location: "ขอนแก่น",
            rating: 5,
          },
          {
            text: "ตรงตามรูป คุ้มราคา ใช้งานได้ดีตามที่คาดหวัง",
            author: "คุณบี",
            location: "ภูเก็ต",
            rating: 4,
          },
        ]}
      />
    </div>
  );
}
