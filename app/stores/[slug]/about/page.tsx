/**
 * /stores/{slug}/about — Brand story page (v12 multi-page)
 *
 * Renders the "about" page from a v12 multi-page schema.
 * Falls back to a simple about section if the store has no v12 schema.
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isV12Schema } from "@/lib/multi-page-migration";
import { MultiPageRenderer } from "@/components/storefront/MultiPageRenderer";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";

export const dynamic = "force-dynamic";

export default async function AboutPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  // ── Multi-page template dispatch ────────────────────────────
  // Bespoke about page from the template registry beats the v12
  // schema renderer + the simple fallback below.
  const effectiveTpl = effectiveTemplateId(store);
  const template = effectiveTpl && effectiveTpl in STORE_TEMPLATES
    ? STORE_TEMPLATES[effectiveTpl as TemplateId]
    : null;
  const TemplateAboutPage = template?.pages?.about;
  if (TemplateAboutPage) {
    return (
      <TemplateAboutPage
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
      />
    );
  }

  // Only render if store has v12 multi-page schema with an "about" page
  if (
    store.landingBlocks &&
    typeof store.landingBlocks === "object" &&
    isV12Schema(store.landingBlocks)
  ) {
    const hasAboutPage = store.landingBlocks.pages.some(
      (p: { slug: string }) => p.slug === "about"
    );
    if (hasAboutPage) {
      const activeRows = await prisma.product.findMany({
        where: { storeId: store.id, active: true },
        select: { externalProductId: true },
      });
      const activeProductIds = new Set(
        activeRows
          .map((r) => r.externalProductId)
          .filter((s): s is string => !!s),
      );
      return (
        <MultiPageRenderer
          schema={store.landingBlocks}
          pageSlug="about"
          storeSlug={store.slug}
          storeName={store.name}
          storeBannerUrl={store.bannerUrl}
          activeProductIds={activeProductIds}
        />
      );
    }
  }

  // Fallback: simple about page for stores without v12
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">เกี่ยวกับ {store.name}</h1>
      {store.description ? (
        <p className="text-lg text-stone-600 leading-relaxed">{store.description}</p>
      ) : (
        <p className="text-stone-500">ยังไม่มีข้อมูลเกี่ยวกับร้านนี้</p>
      )}
    </div>
  );
}
