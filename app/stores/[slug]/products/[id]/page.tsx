import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { cleanDescription } from "@/lib/format/cleanDescription";
import { GlobalHeader } from "@/components/storefront/GlobalHeader";
import { GlobalFooter } from "@/components/storefront/GlobalFooter";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import {
  RecentlyViewedRail,
  RecentlyViewedTracker,
} from "@/components/storefront/RecentlyViewed";
import { isV12Schema } from "@/lib/multi-page-migration";
import { resolveFamily, type ThemeVariant } from "@/lib/landing/families";
import { resolveStoreTemplate } from "@/lib/landing/template-dispatch";
import { BikiniProductDetailAdapter } from "@/components/storefront/themes/bikini-beach/adapters";
import { EcoPackProductDetailAdapter } from "@/components/storefront/themes/eco-pack/adapters";
import { MegaStoreProductDetailAdapter } from "@/components/storefront/themes/mega-store/adapters";
import { PetHouseProductPage } from "@/components/storefront/themes/pet-house/PetHouseProductPage";
import type { ProductDetailProps as ScaffoldProductDetailProps } from "@/lib/templates/types";

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

  const store = product.store;
  const blocksData = store.landingBlocks as any;
  const isAiMultiPage =
    blocksData &&
    typeof blocksData === "object" &&
    (isV12Schema(blocksData) ||
      (blocksData.globalHeader && Array.isArray(blocksData.pages)) ||
      blocksData.type === "block_registry_v1");
  const themeVal = (store.landingThemeVariant as ThemeVariant) || "A";

  const family = resolveFamily(blocksData?.designFamily || store.landingThemeVariant);
  const primaryColor = isAiMultiPage ? (family?.themeColor ?? store.primaryColor ?? "#008BF8") : (store.primaryColor ?? "#2563eb");

  // ── Per-template bespoke product pages ──────────────────────
  // Mirror of the homepage dispatcher in app/stores/[slug]/page.tsx.
  // Themes that ship a full ProductDetail page (not just a hero block)
  // get rendered here so visitors don't see the generic PDP after
  // clicking a card from the bespoke homepage.
  const tplId = resolveStoreTemplate(store);
  if (tplId === "pet-house") {
    return <PetHouseProductPage product={product} images={images} />;
  }
  if (
    tplId === "bikini-beach" ||
    tplId === "eco-pack" ||
    tplId === "mega-store"
  ) {
    const scaffoldProps: ScaffoldProductDetailProps = {
      store: {
        id: store.id,
        slug: store.slug,
        name: store.name,
        description: store.description,
        tagline: store.tagline,
        logoUrl: store.logoUrl,
        bannerUrl: store.bannerUrl,
        primaryColor: store.primaryColor,
      },
      product: {
        id: product.id,
        title: product.titleTh ?? product.title,
        description: cleanDescription(
          product.descriptionTh ?? product.description,
        ),
        priceTHB: Number(product.priceTHB),
        originalPriceTHB: product.compareAtPriceTHB
          ? Number(product.compareAtPriceTHB)
          : null,
        imageUrl: product.imageUrl ?? null,
        images,
        variants: product.variants.map((v) => ({
          id: v.id,
          attributes: (v.attributes as Record<string, string>) ?? {},
          priceTHB: Number(v.priceTHB),
          imageUrl: v.imageUrl ?? null,
          inventory: v.inventory,
        })),
        categoryName: product.categoryName ?? null,
      },
      related: related.map((r) => ({
        id: r.id,
        title: r.titleTh ?? r.title,
        imageUrl: r.imageUrl ?? null,
        priceTHB: Number(r.priceTHB),
        compareAtPriceTHB: r.compareAtPriceTHB
          ? Number(r.compareAtPriceTHB)
          : null,
        categoryName: r.categoryName ?? null,
      })),
    };

    if (tplId === "bikini-beach") {
      return <BikiniProductDetailAdapter {...scaffoldProps} />;
    }
    if (tplId === "eco-pack") {
      return <EcoPackProductDetailAdapter {...scaffoldProps} />;
    }
    return <MegaStoreProductDetailAdapter {...scaffoldProps} />;
  }

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

      <ProductDetail
        product={{
          id: product.id,
          title: product.titleTh ?? product.title,
          // Subtitle = category collection (matches reference's
          // "Balenciaga Fall Collection" position above the title)
          subtitle: product.categoryName ?? product.store.name,
          description: cleanDescription(product.descriptionTh ?? product.description),
          priceTHB: Number(product.priceTHB),
          imageUrl: product.imageUrl ?? undefined,
          images,
          storeName: product.store.name,
          storeSlug: product.store.slug,
          storePrimaryColor: primaryColor,
          // Supplier SKU exposed in the meta strip
          productCode: product.externalProductId,
          variants: product.variants.map((v) => ({
            id: v.id,
            externalVariantId: v.externalVariantId,
            attributes: v.attributes as Record<string, string>,
            priceTHB: Number(v.priceTHB),
            inventory: v.inventory,
            imageUrl: v.imageUrl ?? undefined,
          })),
        }}
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
        <section className="space-y-3">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--shop-ink)' }}>สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/stores/${params.slug}/products/${r.id}`}
                className="group overflow-hidden rounded-lg border"
                style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}
              >
                <div className="aspect-square overflow-hidden" style={{ backgroundColor: 'var(--shop-bg)' }}>
                  {r.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.imageUrl}
                      alt={r.titleTh ?? r.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-3">
                  <div className="line-clamp-2 text-sm font-medium" style={{ color: 'var(--shop-ink, #1c1917)' }}>{r.titleTh ?? r.title}</div>
                  <div className="text-sm font-semibold mt-1" style={{ color: "var(--shop-primary)" }}>฿ {Number(r.priceTHB).toLocaleString("th-TH")}</div>
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
