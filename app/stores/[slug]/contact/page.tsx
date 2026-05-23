/**
 * /stores/{slug}/contact — Contact page
 *
 * Dispatches to the template's bespoke contact page when one is
 * registered (e.g. neon-festival). Falls back to the v12 multi-page
 * renderer if the store schema includes a "contact" page, then to a
 * minimal fallback that surfaces the store's existing contact info
 * (email / phone / LINE / socials) so the route is never a dead end.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isV12Schema } from "@/lib/multi-page-migration";
import { MultiPageRenderer } from "@/components/storefront/MultiPageRenderer";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";
import {
  StoreContactRows,
  StoreSocialIcons,
} from "@/components/shop/StoreSocialIcons";

export const dynamic = "force-dynamic";

export default async function ContactPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  // 1. Bespoke template.pages.contact wins
  const effectiveTpl = effectiveTemplateId(store);
  const template = effectiveTpl && effectiveTpl in STORE_TEMPLATES
    ? STORE_TEMPLATES[effectiveTpl as TemplateId]
    : null;
  const TemplateContactPage = template?.pages?.contact;
  if (TemplateContactPage) {
    return (
      <TemplateContactPage
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

  // 2. v12 multi-page schema with a "contact" page
  if (
    store.landingBlocks &&
    typeof store.landingBlocks === "object" &&
    isV12Schema(store.landingBlocks)
  ) {
    const hasContactPage = store.landingBlocks.pages.some(
      (p: { slug: string }) => p.slug === "contact",
    );
    if (hasContactPage) {
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
          pageSlug="contact"
          storeSlug={store.slug}
          storeName={store.name}
          storeBannerUrl={store.bannerUrl}
          activeProductIds={activeProductIds}
        />
      );
    }
  }

  // 3. Fallback — surface whatever contact info we have so the route
  //    isn't a dead end. Plain styling so it inherits the active
  //    family palette (--shop-bg / --shop-ink / etc.).
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--shop-ink)] mb-6">
        ติดต่อ {store.name}
      </h1>
      <p className="text-[var(--shop-ink-muted)] mb-8">
        ติดต่อเราได้ตามช่องทางด้านล่าง — ตอบกลับเร็วในเวลา 9:00–21:00 ทุกวัน
      </p>
      <div className="space-y-4">
        <StoreContactRows store={store} />
      </div>
      <div className="mt-8">
        <StoreSocialIcons store={store} />
      </div>
      <div className="mt-12">
        <Link
          href={`/stores/${store.slug}`}
          className="text-sm text-[var(--shop-primary)] hover:underline"
        >
          ← กลับหน้าร้าน
        </Link>
      </div>
    </div>
  );
}
