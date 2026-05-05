/**
 * Shared renderer for schema-driven content pages
 * (faq / shipping / returns / privacy / terms / etc).
 *
 * Reads the v12 multi-page schema, finds the page with the requested
 * slug, and hands it to MultiPageRenderer. Falls back to a friendly
 * "ยังไม่มีเนื้อหา" message when the agent hasn't emitted that page
 * yet (e.g. older schemas pre-SKILL-update, or briefs that explicitly
 * skipped the page).
 *
 * The fallback purposely doesn't 404 — these pages are linked from
 * the footer of EVERY store, so a 404 there breaks UX and fails
 * payment-gateway merchant approval.
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isV12Schema } from "@/lib/multi-page-migration";
import { MultiPageRenderer } from "@/components/storefront/MultiPageRenderer";

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
      return (
        <MultiPageRenderer
          schema={store.landingBlocks}
          pageSlug={pageSlug}
          storeSlug={store.slug}
        />
      );
    }
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
