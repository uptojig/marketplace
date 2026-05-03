/**
 * /stores/{slug}/about — Brand story page (v12 multi-page)
 *
 * Renders the "about" page from a v12 multi-page schema.
 * Falls back to a simple about section if the store has no v12 schema.
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isV12Schema } from "@/lib/multi-page-migration";
import { MultiPageRenderer } from "@/components/landing/MultiPageRenderer";

export const dynamic = "force-dynamic";

export default async function AboutPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

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
      return (
        <MultiPageRenderer
          schema={store.landingBlocks}
          pageSlug="about"
          storeSlug={store.slug}
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
