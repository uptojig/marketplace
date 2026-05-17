import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
// TODO(cleanup): remove components/shop/ProductDetail.tsx once the new
// scaffold-aligned ProductDetailHero + ProductDetailTabs flow has shipped
// across all storefronts and there are no callers left.
import { ProductDetailHero } from "@/components/storefront/ProductDetailHero";
import { ProductDetailTabs } from "@/components/storefront/ProductDetailTabs";
import { FashionBeautyProductHero } from "@/components/storefront/themes/fashion-beauty/FashionBeautyProductHero";
import { FashionBeautyBrandStory } from "@/components/storefront/themes/fashion-beauty/FashionBeautyBrandStory";
import { TrustBrandStory } from "@/components/storefront/themes/trust/TrustBrandStory";
import { BusinessModelBrandStory } from "@/components/storefront/themes/business-model/BusinessModelBrandStory";
import { LifestyleBrandStory } from "@/components/storefront/themes/lifestyle/LifestyleBrandStory";
import { ElectronicsTechBrandStory } from "@/components/storefront/themes/electronics-tech/ElectronicsTechBrandStory";
import { SpecialtyBrandStory } from "@/components/storefront/themes/specialty/SpecialtyBrandStory";
import { FashionBeautyRelatedProducts } from "@/components/storefront/themes/fashion-beauty/FashionBeautyRelatedProducts";
import { TrustRelatedProducts } from "@/components/storefront/themes/trust/TrustRelatedProducts";
import { BusinessModelRelatedProducts } from "@/components/storefront/themes/business-model/BusinessModelRelatedProducts";
import { LifestyleRelatedProducts } from "@/components/storefront/themes/lifestyle/LifestyleRelatedProducts";
import { ElectronicsTechRelatedProducts } from "@/components/storefront/themes/electronics-tech/ElectronicsTechRelatedProducts";
import { SpecialtyRelatedProducts } from "@/components/storefront/themes/specialty/SpecialtyRelatedProducts";
import { TrustProductHero } from "@/components/storefront/themes/trust/TrustProductHero";
import { BusinessModelProductHero } from "@/components/storefront/themes/business-model/BusinessModelProductHero";
import { LifestyleProductHero } from "@/components/storefront/themes/lifestyle/LifestyleProductHero";
import { ElectronicsTechProductHero } from "@/components/storefront/themes/electronics-tech/ElectronicsTechProductHero";
import { SpecialtyProductHero } from "@/components/storefront/themes/specialty/SpecialtyProductHero";
import { EverydayProductHero } from "@/components/storefront/themes/everyday/EverydayProductHero";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";
import { isSpecialtyStore } from "@/lib/landing/specialty";
import { isEverydayStore } from "@/lib/landing/everyday";
import { isPetHouseStore } from "@/lib/landing/pet-house";
import { PetHouseProductPage } from "@/components/storefront/themes/pet-house/PetHouseProductPage";
import { cleanDescription } from "@/lib/format/cleanDescription";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import {
  RecentlyViewedRail,
  RecentlyViewedTracker,
} from "@/components/storefront/RecentlyViewed";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";

export const dynamic = "force-dynamic";

/**
 * Coerce a Prisma JSON column to a string→string record, dropping any
 * non-string values. Used for `Product.materials` because the column
 * is Json? at the schema layer.
 */
function coerceMaterials(raw: unknown): Record<string, string> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim().length > 0) out[k] = v.trim();
    else if (typeof v === "number" || typeof v === "boolean") out[k] = String(v);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

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
  // Importers + the legacy form sometimes save the main imageUrl into
  // galleryUrls too, which then renders the cover photo twice in the
  // PDP carousel. Dedup so each unique URL only shows once.
  const images = Array.from(
    new Set([product.imageUrl, ...gallery].filter((x): x is string => !!x)),
  );

  const related = await prisma.product.findMany({
    where: { storeId: product.storeId, active: true, NOT: { id: product.id } },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // ── Multi-page template dispatch ────────────────────────────
  // When the active template ships a bespoke PDP, it wins over
  // the pet-house / family-bespoke heroes below. Same data
  // pipeline (product + variants + related list) is forwarded
  // via the `ProductDetailProps` contract in
  // lib/templates/types.ts.
  const tplStore = product.store;
  const effectiveTpl =
    tplStore.templateId ??
    (tplStore.slug ? null /* legacy slug remapping handled by family helpers */ : null);
  const template = effectiveTpl && effectiveTpl in STORE_TEMPLATES
    ? STORE_TEMPLATES[effectiveTpl as TemplateId]
    : null;
  const TemplatePdpPage = template?.pages?.pdp;
  if (TemplatePdpPage) {
    return (
      <TemplatePdpPage
        store={{
          id: tplStore.id,
          slug: tplStore.slug,
          name: tplStore.name,
          description: tplStore.description,
          tagline: tplStore.tagline,
          logoUrl: tplStore.logoUrl,
          bannerUrl: tplStore.bannerUrl,
          primaryColor: tplStore.primaryColor,
        }}
        product={{
          id: product.id,
          title: product.titleTh ?? product.title,
          description: cleanDescription(product.descriptionTh ?? product.description),
          priceTHB: Number(product.priceTHB),
          originalPriceTHB: product.compareAtPriceTHB
            ? Number(product.compareAtPriceTHB)
            : null,
          imageUrl: product.imageUrl,
          images,
          variants: product.variants.map((v) => ({
            id: v.id,
            attributes: v.attributes as Record<string, string>,
            colorLabel: v.colorLabel,
            sizeLabel: v.sizeLabel,
            materialLabel: v.materialLabel,
            priceTHB: Number(v.priceTHB),
            imageUrl: v.imageUrl,
            inventory: v.inventory,
          })),
          stockLeft: product.hasVariants
            ? null
            : product.stockTotal > 0
              ? product.stockTotal
              : null,
          videoUrl: product.videoUrl,
          categoryName: product.categoryName,
        }}
        related={related.map((r) => ({
          id: r.id,
          title: r.titleTh ?? r.title,
          imageUrl: r.imageUrl,
          priceTHB: Number(r.priceTHB),
          compareAtPriceTHB: r.compareAtPriceTHB
            ? Number(r.compareAtPriceTHB)
            : null,
          categoryName: r.categoryName,
        }))}
      />
    );
  }

  // ── pet-house custom PDP (fluffyhouse) ──────────────────────
  // Bespoke product detail layout for the pet-supplies store. Gated by
  // the same `isPetHouseStore()` detection used for the homepage — slug
  // match for fluffyhouse, with templateId / landingThemeVariant escape
  // hatches so an operator can later attach this PDP to a sibling pet
  // store. Renders inside the shared ShopHeader / ShopFooter chrome
  // that `app/stores/[slug]/layout.tsx` already wraps around every
  // store sub-page. Early-return is placed BEFORE the existing
  // HeroComponent ternary chain so it short-circuits the default flow
  // for matching stores only — non-pet-house stores stay on the
  // unchanged FB/trust/BM/lifestyle/ET/specialty/default cascade.
  if (
    isPetHouseStore({
      slug: product.store.slug,
      templateId: product.store.templateId,
      landingThemeVariant: product.store.landingThemeVariant,
    })
  ) {
    return (
      <PetHouseProductPage
        product={product}
        images={images}
      />
    );
  }

  // Per-template design family decision. Order matters — FB is
  // checked first, then trust, then specialty. In practice the
  // template→group mapping is disjoint so only one detector matches
  // per store; the explicit precedence keeps things safe.
  // fashion-beauty (lookbook / beauty-swatch / boutique) renders
  // the editorial portrait variant; trust (classic /
  // official-brand / premium-luxury) renders the squared heritage
  // hero; business-model (wholesale-b2b / flash-deal / subscription)
  // renders the rectangular deal-dashboard hero; lifestyle (home-living /
  // sport-active / kids-toys) renders the warm catalog hero;
  // electronics-tech (catalog-dense / tech-compare / single-product)
  // renders the spec-sheet square hero; specialty (handmade / vintage)
  // renders the artisan kraft hero; everything else renders the
  // default hero untouched.
  const isFB = isFashionBeautyStore({
    templateId: effectiveTemplateId(product.store),
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isTrust = !isFB && isTrustStore({
    templateId: effectiveTemplateId(product.store),
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isBM = !isFB && !isTrust && isBusinessModelStore({
    templateId: effectiveTemplateId(product.store),
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isLifestyle = !isFB && !isTrust && !isBM && isLifestyleStore({
    templateId: effectiveTemplateId(product.store),
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isElectronicsTech = !isFB && !isTrust && !isBM && !isLifestyle && isElectronicsTechStore({
    templateId: effectiveTemplateId(product.store),
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isSpecialty = !isFB && !isTrust && !isBM && !isLifestyle && !isElectronicsTech && isSpecialtyStore({
    templateId: effectiveTemplateId(product.store),
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isEveryday = !isFB && !isTrust && !isBM && !isLifestyle && !isElectronicsTech && !isSpecialty && isEverydayStore({
    templateId: effectiveTemplateId(product.store),
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const HeroComponent = isFB
    ? FashionBeautyProductHero
    : isTrust
      ? TrustProductHero
      : isBM
        ? BusinessModelProductHero
        : isLifestyle
          ? LifestyleProductHero
          : isElectronicsTech
            ? ElectronicsTechProductHero
            : isSpecialty
              ? SpecialtyProductHero
              : isEveryday
                ? EverydayProductHero
                : ProductDetailHero;

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
            // Split-axis variant labels — populated from CJ via
            // lib/suppliers/cj/adapter.fetchVariants. The default
            // ProductDetailHero picker renders Color + Size + Material
            // as separate rows when all variants carry the labels.
            colorLabel: v.colorLabel,
            sizeLabel: v.sizeLabel,
            materialLabel: v.materialLabel,
            priceTHB: Number(v.priceTHB),
            imageUrl: v.imageUrl,
            inventory: v.inventory,
          })),
          // Use Prisma stockTotal as stockLeft. For dropshipping products
          // (CJ / AliExpress) stockTotal often stays 0 because real stock
          // lives on the supplier side — treat 0 as "stock unknown" (null)
          // so the Add to Cart button stays enabled instead of locking
          // the buyer out. Variants override this via their own inventory.
          stockLeft: product.hasVariants
            ? null
            : product.stockTotal > 0
              ? product.stockTotal
              : null,
          // CJ promo video — surfaced as a "ดูวิดีโอ" link under the
          // gallery (no inline embed, see hero comment for rationale).
          videoUrl: product.videoUrl,
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

      {/* Each family gets its bespoke brand-story panel between the
          PDP hero and the spec/description tabs. Renders nothing when
          the store has no tagline or description, so unfilled stores
          see no empty frame. */}
      {isFB && (
        <FashionBeautyBrandStory
          storeSlug={product.store.slug}
          storeName={product.store.name}
          tagline={product.store.tagline}
          description={product.store.description}
        />
      )}
      {isTrust && (
        <TrustBrandStory
          storeSlug={product.store.slug}
          storeName={product.store.name}
          tagline={product.store.tagline}
          description={product.store.description}
        />
      )}
      {isBM && (
        <BusinessModelBrandStory
          storeSlug={product.store.slug}
          storeName={product.store.name}
          tagline={product.store.tagline}
          description={product.store.description}
        />
      )}
      {isLifestyle && (
        <LifestyleBrandStory
          storeSlug={product.store.slug}
          storeName={product.store.name}
          tagline={product.store.tagline}
          description={product.store.description}
        />
      )}
      {isElectronicsTech && (
        <ElectronicsTechBrandStory
          storeSlug={product.store.slug}
          storeName={product.store.name}
          tagline={product.store.tagline}
          description={product.store.description}
        />
      )}
      {isSpecialty && (
        <SpecialtyBrandStory
          storeSlug={product.store.slug}
          storeName={product.store.name}
          tagline={product.store.tagline}
          description={product.store.description}
        />
      )}

      <ProductDetailTabs
        product={{
          description: cleanDescription(product.descriptionTh ?? product.description),
          // No structured attributes column yet; pass an empty object
          // so the Specifications tab merges only with `materials` (CJ's
          // explicit spec sheet) when it has content.
          // TODO(specs): wire Prisma `Product.attributes` Json blob once it lands.
          attributes: {},
          // Rich CJ fields (PR ⟪cj-rich-product-data⟫) — bullet list
          // under the description tab + spec table under the
          // specifications tab. Both are nullable JSON columns so we
          // defensively coerce here.
          keyAttributes: Array.isArray(product.keyAttributes)
            ? (product.keyAttributes as unknown[]).filter(
                (x): x is string => typeof x === 'string' && x.trim().length > 0,
              )
            : undefined,
          materials:
            product.materials && typeof product.materials === 'object' && !Array.isArray(product.materials)
              ? coerceMaterials(product.materials)
              : undefined,
        }}
        store={{ slug: product.store.slug, name: product.store.name }}
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

      {/* Per-family bespoke RelatedProducts. Each family ships a
          fully bespoke component matching the family's category-page
          visual language. When the store is in a family, render the
          bespoke section and SKIP the legacy shared inline grid below.
          Stores without a family fall through to the legacy section. */}
      {related.length > 0 && isFB && (
        <FashionBeautyRelatedProducts
          storeSlug={params.slug}
          storeName={product.store.name}
          products={related.map((r) => ({
            id: r.id,
            title: r.title,
            titleTh: r.titleTh,
            imageUrl: r.imageUrl,
            priceTHB: Number(r.priceTHB),
            compareAtPriceTHB: r.compareAtPriceTHB ? Number(r.compareAtPriceTHB) : null,
          }))}
        />
      )}
      {related.length > 0 && isTrust && (
        <TrustRelatedProducts
          storeSlug={params.slug}
          storeName={product.store.name}
          products={related.map((r) => ({
            id: r.id,
            title: r.title,
            titleTh: r.titleTh,
            imageUrl: r.imageUrl,
            priceTHB: Number(r.priceTHB),
            compareAtPriceTHB: r.compareAtPriceTHB ? Number(r.compareAtPriceTHB) : null,
          }))}
        />
      )}
      {related.length > 0 && isBM && (
        <BusinessModelRelatedProducts
          storeSlug={params.slug}
          storeName={product.store.name}
          products={related.map((r) => ({
            id: r.id,
            title: r.title,
            titleTh: r.titleTh,
            imageUrl: r.imageUrl,
            priceTHB: Number(r.priceTHB),
            compareAtPriceTHB: r.compareAtPriceTHB ? Number(r.compareAtPriceTHB) : null,
          }))}
        />
      )}
      {related.length > 0 && isLifestyle && (
        <LifestyleRelatedProducts
          storeSlug={params.slug}
          storeName={product.store.name}
          products={related.map((r) => ({
            id: r.id,
            title: r.title,
            titleTh: r.titleTh,
            imageUrl: r.imageUrl,
            priceTHB: Number(r.priceTHB),
            compareAtPriceTHB: r.compareAtPriceTHB ? Number(r.compareAtPriceTHB) : null,
          }))}
        />
      )}
      {related.length > 0 && isElectronicsTech && (
        <ElectronicsTechRelatedProducts
          storeSlug={params.slug}
          storeName={product.store.name}
          products={related.map((r) => ({
            id: r.id,
            title: r.title,
            titleTh: r.titleTh,
            imageUrl: r.imageUrl,
            priceTHB: Number(r.priceTHB),
            compareAtPriceTHB: r.compareAtPriceTHB ? Number(r.compareAtPriceTHB) : null,
          }))}
        />
      )}
      {related.length > 0 && isSpecialty && (
        <SpecialtyRelatedProducts
          storeSlug={params.slug}
          storeName={product.store.name}
          products={related.map((r) => ({
            id: r.id,
            title: r.title,
            titleTh: r.titleTh,
            imageUrl: r.imageUrl,
            priceTHB: Number(r.priceTHB),
            compareAtPriceTHB: r.compareAtPriceTHB ? Number(r.compareAtPriceTHB) : null,
          }))}
        />
      )}

      {related.length > 0 && !isFB && !isTrust && !isBM && !isLifestyle && !isElectronicsTech && !isSpecialty && (
        <section
          className={
            isFB || isTrust || isLifestyle || isElectronicsTech || isSpecialty
              ? "space-y-6 py-8"
              : isBM
                ? "space-y-4 py-6"
                : "space-y-3"
          }
        >
          {/* Section eyebrow + heading. Trust adds a heritage caps
              eyebrow above the serif headline; FB renders a serif
              headline only; business-model uses a tight-caps utility
              label; lifestyle adds an optimistic sage caps tagline
              above the geometric sans headline; electronics-tech adds
              a mono "Related products" eyebrow; default keeps its
              compact sans label. */}
          {isTrust && (
            <p
              className="text-xs uppercase"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.28em',
                fontWeight: 600,
              }}
            >
              From the Collection
            </p>
          )}
          {isBM && (
            <p
              className="text-xs font-semibold uppercase"
              style={{
                color: 'var(--shop-primary)',
                letterSpacing: '0.12em',
              }}
            >
              Related deals
            </p>
          )}
          {isLifestyle && (
            <p
              className="text-xs uppercase"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              More from the basket
            </p>
          )}
          {isElectronicsTech && (
            <p
              data-tech-mono="true"
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily:
                  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace',
                letterSpacing: '0.16em',
                fontWeight: 600,
              }}
            >
              Related products
            </p>
          )}
          <h2
            className={
              isFB || isTrust || isLifestyle || isSpecialty
                ? "text-3xl sm:text-4xl"
                : isBM
                  ? "text-xl sm:text-2xl"
                  : isElectronicsTech
                    ? "text-2xl sm:text-3xl"
                    : "text-lg font-semibold"
            }
            style={{
              color: 'var(--shop-ink)',
              ...(isFB
                ? {
                    fontFamily:
                      'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif',
                    fontWeight: 500,
                  }
                : isTrust
                  ? {
                      fontFamily:
                        'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }
                  : isLifestyle
                    ? {
                        fontFamily:
                          'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif',
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                      }
                    : isElectronicsTech
                      ? {
                          fontFamily:
                            'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif',
                          fontWeight: 700,
                          letterSpacing: '-0.015em',
                        }
                      : isSpecialty
                        ? {
                            fontFamily:
                              'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif',
                            fontWeight: 500,
                            letterSpacing: '-0.005em',
                          }
                        : {}),
            }}
          >
            {isFB
              ? 'You may also love'
              : isTrust
                ? 'You may also like'
                : isBM
                  ? 'ดีลใกล้เคียง'
                  : isLifestyle
                    ? 'You may also love'
                    : isElectronicsTech
                      ? 'Compare similar products'
                      : isSpecialty
                        ? 'Other works from this maker'
                        : 'สินค้าที่เกี่ยวข้อง'}
          </h2>
          <div
            className={
              isFB
                ? "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4"
                : isTrust
                  ? "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4"
                  : isLifestyle
                    ? "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-3"
                    : isElectronicsTech
                      ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
                      : isSpecialty
                        ? "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4"
                        : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6"
            }
          >
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/stores/${params.slug}/products/${r.id}`}
                className={
                  isFB || isTrust || isLifestyle || isElectronicsTech || isSpecialty
                    ? "group block"
                    : "group overflow-hidden rounded-lg border"
                }
                style={
                  isFB || isTrust || isLifestyle || isElectronicsTech || isSpecialty
                    ? undefined
                    : { background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }
                }
              >
                <div
                  data-lifestyle-frame={isLifestyle ? 'true' : undefined}
                  {...(isSpecialty ? { 'data-specialty-kraft': 'true' } : {})}
                  className={
                    isFB
                      ? "overflow-hidden rounded-2xl border bg-white p-2 shadow-sm"
                      : isTrust
                        ? "overflow-hidden rounded-sm border bg-white"
                        : isLifestyle
                          ? "overflow-hidden rounded-3xl bg-white"
                          : isElectronicsTech
                            ? "overflow-hidden rounded-md border bg-white"
                            : isSpecialty
                              ? "overflow-hidden rounded-md border p-2 shadow-sm"
                              : "aspect-square overflow-hidden"
                  }
                  style={{
                    ...(isFB
                      ? { borderColor: 'var(--shop-border)' }
                      : isTrust
                        ? { borderColor: 'var(--shop-accent)' }
                        : isLifestyle
                          ? {}
                          : isElectronicsTech
                            ? { borderColor: 'var(--shop-border)' }
                            : isSpecialty
                              ? { borderColor: 'var(--shop-border)' }
                              : { backgroundColor: 'var(--shop-bg)' }),
                  }}
                >
                  {r.imageUrl && (
                    <div
                      {...(isSpecialty ? { 'data-specialty-sepia': 'true' } : {})}
                      className={
                        isFB
                          ? "relative overflow-hidden rounded-xl"
                          : isTrust
                            ? "relative overflow-hidden"
                            : isLifestyle
                              ? "relative overflow-hidden"
                              : isElectronicsTech
                                ? "relative overflow-hidden"
                                : isSpecialty
                                  ? "relative overflow-hidden rounded-md"
                                  : "h-full w-full"
                      }
                      style={
                        isFB
                          ? { aspectRatio: '4 / 5', backgroundColor: 'var(--shop-muted)' }
                          : isTrust
                            ? { aspectRatio: '1 / 1', backgroundColor: 'var(--shop-muted)' }
                            : isLifestyle
                              ? { aspectRatio: '1 / 1', backgroundColor: 'var(--shop-muted)' }
                              : isElectronicsTech
                                ? { aspectRatio: '1 / 1', backgroundColor: 'var(--shop-muted)' }
                                : isSpecialty
                                  ? { aspectRatio: '1 / 1', backgroundColor: 'var(--shop-muted)' }
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
                            : isTrust
                              ? "absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                              : isLifestyle
                                ? "absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                : isElectronicsTech
                                  ? "absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                  : isSpecialty
                                    ? "absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                    : "h-full w-full object-cover transition group-hover:scale-105"
                        }
                      />
                    </div>
                  )}
                </div>
                <div
                  className={
                    isFB
                      ? "px-1 pt-3"
                      : isTrust
                        ? "px-1 pt-4"
                        : isLifestyle
                          ? "px-1 pt-4"
                          : isElectronicsTech
                            ? "px-1 pt-3"
                            : isSpecialty
                              ? "px-1 pt-3"
                              : "p-3"
                  }
                >
                  <div
                    className={
                      isFB
                        ? "line-clamp-2 text-sm"
                        : isTrust
                          ? "line-clamp-2 text-sm leading-tight"
                          : isLifestyle
                            ? "line-clamp-2 text-base leading-tight"
                            : isElectronicsTech
                              ? "line-clamp-2 text-sm leading-tight"
                              : isSpecialty
                                ? "line-clamp-2 text-sm"
                                : "line-clamp-2 text-sm font-medium"
                    }
                    style={{
                      color: 'var(--shop-ink, #1c1917)',
                      ...(isTrust
                        ? {
                            fontFamily:
                              'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif',
                            fontWeight: 600,
                          }
                        : isLifestyle
                          ? {
                              fontFamily:
                                'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif',
                              fontWeight: 600,
                            }
                          : isElectronicsTech
                            ? {
                                fontFamily:
                                  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif',
                                fontWeight: 600,
                                letterSpacing: '-0.005em',
                              }
                            : isSpecialty
                              ? {
                                  fontFamily:
                                    'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif',
                                  fontWeight: 500,
                                }
                              : {}),
                    }}
                  >
                    {r.titleTh ?? r.title}
                  </div>
                  <div
                    className={
                      isElectronicsTech
                        ? "mt-1 text-sm font-bold"
                        : "mt-1 text-sm font-semibold"
                    }
                    data-tech-mono={isElectronicsTech ? 'true' : undefined}
                    style={{
                      color: isTrust ? 'var(--shop-ink)' : 'var(--shop-primary)',
                      ...(isLifestyle
                        ? {
                            fontFamily:
                              'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif',
                          }
                        : isElectronicsTech
                          ? {
                              fontFamily:
                                'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace',
                              letterSpacing: '-0.01em',
                            }
                          : {}),
                    }}
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
