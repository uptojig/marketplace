/**
 * Shared renderer for schema-driven content pages
 * (faq / shipping / returns / privacy / terms / etc).
 *
 * Reads the v12 multi-page schema, finds the page with the requested
 * slug, and hands it to MultiPageRenderer. Falls back to a default
 * body (rich React fallback OR plain hint text) when the agent hasn't
 * emitted that page yet.
 *
 * The fallback purposely doesn't 404 — these pages are linked from
 * the footer of EVERY store, so a 404 there breaks UX and fails
 * payment-gateway merchant approval.
 */
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isV12Schema } from "@/lib/multi-page-migration";
import { MultiPageRenderer } from "@/components/storefront/MultiPageRenderer";

interface SchemaPageProps {
  storeSlug: string;
  pageSlug: string;
  fallbackTitle: string;
  fallbackHint?: string;
  /** Optional rich fallback rendered when the store's schema doesn't
   *  emit this page. Use this for legally / commercially important
   *  pages (returns / shipping / privacy / terms) so the buyer always
   *  sees real content, not a "ยังไม่มีเนื้อหา" stub. */
  fallbackBody?: ReactNode;
}

export async function renderSchemaPage({
  storeSlug,
  pageSlug,
  fallbackTitle,
  fallbackHint,
  fallbackBody,
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

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--shop-ink)" }}>
        {fallbackTitle}
      </h1>
      {fallbackBody ?? (
        <p className="text-base leading-relaxed" style={{ color: "var(--shop-ink-muted)" }}>
          {fallbackHint ??
            "ยังไม่มีเนื้อหาในหน้านี้ — สร้าง landing page ใหม่ใน admin เพื่อเพิ่มเนื้อหาอัตโนมัติ"}
        </p>
      )}
    </div>
  );
}
