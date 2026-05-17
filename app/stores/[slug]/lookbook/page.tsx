/**
 * /stores/{slug}/lookbook — editorial Lookbook page.
 *
 * Only resolves when the active template registers a bespoke
 * `pages.lookbook` component (currently `bikini-beach`). Stores
 * whose template doesn't ship a Lookbook fall through to a 404 — the
 * route is intentionally template-gated rather than a generic
 * marketplace surface, since Lookbook is a strong editorial commitment
 * not every brand wants.
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";

export const dynamic = "force-dynamic";

export default async function LookbookPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  const effectiveTpl = effectiveTemplateId(store);
  const template = effectiveTpl && effectiveTpl in STORE_TEMPLATES
    ? STORE_TEMPLATES[effectiveTpl as TemplateId]
    : null;
  const TemplateLookbookPage = template?.pages?.lookbook;
  if (!TemplateLookbookPage) notFound();

  // Same product data the catalog page pulls — Lookbook tiles render
  // off product imagery, so the contract is `TemplateProductCard[]`.
  // Match the homepage take=60 budget; the designer's Lookbook only
  // needs a handful of products for the "Shop the Look" section.
  const products = await prisma.product.findMany({
    where: { storeId: store.id, active: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <TemplateLookbookPage
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
      products={products.map((p) => ({
        id: p.id,
        title: p.titleTh ?? p.title,
        imageUrl: p.imageUrl,
        priceTHB: Number(p.priceTHB),
        compareAtPriceTHB: p.compareAtPriceTHB
          ? Number(p.compareAtPriceTHB)
          : null,
        categoryName: p.categoryName,
      }))}
    />
  );
}
