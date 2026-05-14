import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
// TODO(cleanup): remove components/shop/ProductDetail.tsx once the new
// scaffold-aligned ProductDetailHero + ProductDetailTabs flow has shipped
// across all storefronts and there are no callers left.
import { ProductDetailHero } from "@/components/storefront/ProductDetailHero";
import { ProductDetailTabs } from "@/components/storefront/ProductDetailTabs";
import { FashionBeautyProductHero } from "@/components/storefront/themes/fashion-beauty/FashionBeautyProductHero";
import { TrustProductHero } from "@/components/storefront/themes/trust/TrustProductHero";
import { BusinessModelProductHero } from "@/components/storefront/themes/business-model/BusinessModelProductHero";
import { LifestyleProductHero } from "@/components/storefront/themes/lifestyle/LifestyleProductHero";
import { ElectronicsTechProductHero } from "@/components/storefront/themes/electronics-tech/ElectronicsTechProductHero";
import { SpecialtyProductHero } from "@/components/storefront/themes/specialty/SpecialtyProductHero";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";
import { isSpecialtyStore } from "@/lib/landing/specialty";
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
    templateId: product.store.templateId,
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isTrust = !isFB && isTrustStore({
    templateId: product.store.templateId,
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isBM = !isFB && !isTrust && isBusinessModelStore({
    templateId: product.store.templateId,
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isLifestyle = !isFB && !isTrust && !isBM && isLifestyleStore({
    templateId: product.store.templateId,
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isElectronicsTech = !isFB && !isTrust && !isBM && !isLifestyle && isElectronicsTechStore({
    templateId: product.store.templateId,
    landingThemeVariant: product.store.landingThemeVariant,
  });
  const isSpecialty = !isFB && !isTrust && !isBM && !isLifestyle && !isElectronicsTech && isSpecialtyStore({
    templateId: product.store.templateId,
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
