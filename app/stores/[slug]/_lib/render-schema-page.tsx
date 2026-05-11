/**
 * Shared renderer for schema-driven content pages
 * (faq / shipping / returns / privacy / terms / etc).
 *
 * Resolution order:
 *  1. v12 multi-page schema has a page with this slug → MultiPageRenderer
 *  2. Generic static fallback from lib/helpPages.ts (rendered with HelpContent)
 *  3. Bare "ยังไม่มี…" hint (only if no static content exists for this slug)
 *
 * The static fallback exists because these pages are linked from EVERY
 * store's footer and are required for payment-gateway merchant approval —
 * an empty placeholder fails that check.
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isV12Schema } from "@/lib/multi-page-migration";
import { MultiPageRenderer } from "@/components/storefront/MultiPageRenderer";
import { HelpContent } from "@/components/storefront/HelpContent";
import { getHelpPage } from "@/lib/helpPages";

// Route slug → lib/helpPages.ts slug.  Most are 1:1; "returns" maps to
// "refund" because the static catalog uses the latter name.
const STATIC_FALLBACK_SLUGS: Record<string, string> = {
  shipping: "shipping",
  returns: "refund",
  privacy: "privacy",
  terms: "terms",
  faq: "faq",
};

interface SchemaPageProps {
  storeSlug: string;
  pageSlug: string;
  fallbackTitle: string;
  fallbackHint?: string;
}

export async function renderSchemaPage({
  storeSlug,
  pageSlug,
  fallbackTitle,
  fallbackHint,
}: SchemaPageProps) {
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
  });
  if (!store) notFound();

  if (
    store.landingBlocks &&
    typeof store.landingBlocks === "object" &&
    isV12Schema(store.landingBlocks)
  ) {
    const hasPage = store.landingBlocks.pages.some(
      (p: { slug: string }) => p.slug === pageSlug,
    );
    if (hasPage) {
      // Same active-product filter as the homepage so deleted
      // product cards don't render on faq / shipping / returns
      // / privacy / terms (those pages mostly don't carry
      // OfferGrids, but cheap insurance).
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
          pageSlug={pageSlug}
          storeSlug={store.slug}
          storeName={store.name}
          // Apply the operator-uploaded banner so faq/shipping/etc.
          // hero panels swap their placeholder image too.
          storeBannerUrl={store.bannerUrl}
          activeProductIds={activeProductIds}
        />
      );
    }
  }

  const staticSlug = STATIC_FALLBACK_SLUGS[pageSlug];
  const staticPage = staticSlug ? getHelpPage(staticSlug) : undefined;
  if (staticPage) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--shop-ink)" }}>
          {staticPage.title}
        </h1>
        <article className="text-sm" style={{ color: "var(--shop-ink)" }}>
          <HelpContent content={staticPage.content} />
        </article>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--shop-ink)" }}>
        {fallbackTitle}
      </h1>
      <p className="text-base leading-relaxed" style={{ color: "var(--shop-ink-muted)" }}>
        {fallbackHint ??
          "ยังไม่มีเนื้อหาในหน้านี้ — สร้าง landing page ใหม่ใน admin เพื่อเพิ่มเนื้อหาอัตโนมัติ"}
      </p>
    </div>
  );
}
