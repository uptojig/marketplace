import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
// TODO(cleanup): remove components/shop/ProductDetail.tsx once the new
// scaffold-aligned ProductDetailHero + ProductDetailTabs flow has shipped
// across all storefronts and there are no callers left.
import { ProductDetailHero } from "@/components/storefront/ProductDetailHero";
import { ProductDetailTabs } from "@/components/storefront/ProductDetailTabs";
import { FashionBeautyProductHero } from "@/components/storefront/themes/fashion-beauty/FashionBeautyProductHero";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { cleanDescription } from "@/lib/format/cleanDescription";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import {
  RecentlyViewedRail,
  RecentlyViewedTracker,
} from "@/components/storefront/RecentlyViewed";

export const dynamic = "force-dynamic";

export default async function ShopProductPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  // Accept either the internal cuid (`Product.id`) or the supplier's
  // `externalProductId`. Agent-generated landing blocks (เป็ด) historically
  // embedded externalProductId as the link param; querying by id only
  // produced 404s for those links. We scope by store slug so an external ID
  // colliding across stores can't leak across tenants.
  const product = await prisma.product.findFirst({
    where: {
      store: { slug: params.slug },
      OR: [{ id: params.id }, { externalProductId: params.id }],
    },
    include: { store: true, variants: { orderBy: { createdAt: "asc" } } },
  });
  if (!product || !product.active) notFound();

  const gallery = (Array.isArray(product.galleryUrls) ? (product.galleryUrls as string[]) : []).filter(Boolean);
  const images = [product.imageUrl, ...gallery].filter((x): x is string => !!x);

  const related = await prisma.product.findMany({
    where: { storeId: product.storeId, active: true, NOT: { id: product.id } },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // Per-template design family decision. fashion-beauty (lookbook /
  // beauty-swatch / boutique) gets the editorial portrait variant;
  // all other templates render the default hero untouched.
  const isFB = isFashionBeautyStore({
    templateId: product.store.templateId,
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const HeroComponent = isFB ? FashionBeautyProductHero : ProductDetailHero;

  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1">
        <div className="container mx-auto max-w-[1200px] space-y-6 px-4 py-6">
          <Breadcrumbs
            items={[
              { label: "หน้าแรก", href: `/stores/${params.slug}` },
              ...(product.categoryName
                ? [{ label: product.categoryName, href: `/stores/${params.slug}/category?cat=${encodeURIComponent(product.categoryName)}` }]
                : [{ label: "สินค้าทั้งหมด", href: `/stores/${params.slug}/category` }]),
              { label: product.titleTh ?? product.title },
            ]}
          />
          {/* Mobile back link (Breadcrumbs hidden on mobile to save space) */}
          <Link href={`/stores/${params.slug}`} className="sm:hidden inline-flex items-center gap-1 text-sm hover:underline" style={{ color: 'var(--shop-ink-muted)' }}>
            ← กลับ
          </Link>

      <HeroComponent
        product={{
          id: product.id,
          title: product.titleTh ?? product.title,
          description: cleanDescription(product.descriptionTh ?? product.description),
          priceTHB: Number(product.priceTHB),
          // Prisma stores the strikethrough price as `compareAtPriceTHB`;
          // the hero exposes it as `originalPriceTHB` (scaffold naming).
          originalPriceTHB: product.compareAtPriceTHB ? Number(product.compareAtPriceTHB) : null,
          imageUrl: product.imageUrl,
          images,
          // No free-form attributes blob on Prisma yet; the spec sheet
          // is rendered in the Tabs (passes the same empty object). The
          // hero itself does not surface attributes.
          attributes: {},
          // TODO(badges): wire hot/new/limited/official once Product has
          // a badges/flags field. For now no badges are surfaced.
          badges: [],
          variants: product.variants.map((v) => ({
            id: v.id,
            attributes: v.attributes as Record<string, string>,
            priceTHB: Number(v.priceTHB),
            imageUrl: v.imageUrl,
            inventory: v.inventory,
          })),
          // Use Prisma stockTotal as the catch-all stockLeft. When variants
          // exist, the hero prefers the selected variant's inventory.
          stockLeft: product.hasVariants ? null : product.stockTotal,
          // rating / reviewCount / soldCount intentionally omitted —
          // not in schema yet. Hero hides the meta row gracefully.
        }}
        store={{
          slug: product.store.slug,
          name: product.store.name,
          logoUrl: product.store.logoUrl,
          // rating / followers also not in schema — hero hides them.
        }}
      />

      <ProductDetailTabs
        product={{
          description: cleanDescription(product.descriptionTh ?? product.description),
          // No structured attributes column yet; pass an empty object
          // so the Specifications tab shows the "ยังไม่มีข้อมูลจำเพาะ"
          // placeholder rather than dying.
          // TODO(specs): wire Prisma `Product.attributes` Json blob once it lands.
          attributes: {},
        }}
        store={{ name: product.store.name }}
      />

      <RecentlyViewedTracker
        storeSlug={params.slug}
        product={{
          id: product.id,
          title: product.titleTh ?? product.title,
          priceTHB: Number(product.priceTHB),
          imageUrl: product.imageUrl ?? null,
        }}
      />

      <RecentlyViewedRail
        storeSlug={params.slug}
        excludeIds={[product.id]}
      />

      {related.length > 0 && (
        <section className={isFB ? "space-y-6 py-8" : "space-y-3"}>
          <h2
            className={isFB ? "text-3xl sm:text-4xl" : "text-lg font-semibold"}
            style={{
              color: 'var(--shop-ink)',
              ...(isFB
                ? {
                    fontFamily:
                      'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif',
                    fontWeight: 500,
                  }
                : {}),
            }}
          >
            {isFB ? 'You may also love' : 'สินค้าที่เกี่ยวข้อง'}
          </h2>
          <div
            className={
              isFB
                ? "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4"
                : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6"
            }
          >
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/stores/${params.slug}/products/${r.id}`}
                className={isFB ? "group block" : "group overflow-hidden rounded-lg border"}
                style={
                  isFB
                    ? undefined
                    : { background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }
                }
              >
                <div
                  className={
                    isFB
                      ? "overflow-hidden rounded-2xl border bg-white p-2 shadow-sm"
                      : "aspect-square overflow-hidden"
                  }
                  style={{
                    ...(isFB
                      ? { borderColor: 'var(--shop-border)' }
                      : { backgroundColor: 'var(--shop-bg)' }),
                  }}
                >
                  {r.imageUrl && (
                    <div
                      className={
                        isFB
                          ? "relative overflow-hidden rounded-xl"
                          : "h-full w-full"
                      }
                      style={
                        isFB
                          ? { aspectRatio: '4 / 5', backgroundColor: 'var(--shop-muted)' }
                          : undefined
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.imageUrl}
                        alt={r.titleTh ?? r.title}
                        className={
                          isFB
                            ? "absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            : "h-full w-full object-cover transition group-hover:scale-105"
                        }
                      />
                    </div>
                  )}
                </div>
                <div className={isFB ? "px-1 pt-3" : "p-3"}>
                  <div
                    className={
                      isFB
                        ? "line-clamp-2 text-sm"
                        : "line-clamp-2 text-sm font-medium"
                    }
                    style={{ color: 'var(--shop-ink, #1c1917)' }}
                  >
                    {r.titleTh ?? r.title}
                  </div>
                  <div
                    className="mt-1 text-sm font-semibold"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    ฿ {Number(r.priceTHB).toLocaleString("th-TH")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
        </div>
      </main>
    </div>
  );
}
