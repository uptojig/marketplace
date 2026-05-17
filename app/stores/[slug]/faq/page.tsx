/**
 * /stores/{slug}/faq — คำถามที่พบบ่อย / How to buy / Terms of purchase.
 * Required by payment-gateway merchant approval.
 */
import { prisma } from "@/lib/prisma";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";
import { renderSchemaPage } from "../_lib/render-schema-page";

export const dynamic = "force-dynamic";

export default async function FaqPage({
  params,
}: {
  params: { slug: string };
}) {
  // ── Multi-page template dispatch ────────────────────────────
  // The TemplatePages contract doesn't have a dedicated `faq`
  // slot (per the BIKINI551 README route map, FAQ + size guide
  // live under `help / contact`), so we dispatch faq →
  // `pages.help` if the template ships one.
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      tagline: true,
      bannerUrl: true,
      logoUrl: true,
      primaryColor: true,
      templateId: true,
    },
  });
  if (store) {
    const effectiveTpl = effectiveTemplateId(store);
    const template = effectiveTpl && effectiveTpl in STORE_TEMPLATES
      ? STORE_TEMPLATES[effectiveTpl as TemplateId]
      : null;
    const TemplateHelpPage = template?.pages?.help;
    if (TemplateHelpPage) {
      return (
        <TemplateHelpPage
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
          pageSlug="faq"
        />
      );
    }
  }

  return renderSchemaPage({
    storeSlug: params.slug,
    pageSlug: "faq",
    fallbackTitle: "คำถามที่พบบ่อย",
    fallbackHint:
      "ยังไม่มีคำถามที่พบบ่อย — Regenerate landing page เพื่อเพิ่มคำถามอัตโนมัติ",
  });
}
