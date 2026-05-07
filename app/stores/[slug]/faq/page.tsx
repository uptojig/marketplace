/**
 * /stores/{slug}/faq — คำถามที่พบบ่อย / How to buy / Terms of purchase.
 * Required by payment-gateway merchant approval.
 */
import { renderSchemaPage } from "../_lib/render-schema-page";

export const dynamic = "force-dynamic";

export default async function FaqPage({
  params,
}: {
  params: { slug: string };
}) {
  return renderSchemaPage({
    storeSlug: params.slug,
    pageSlug: "faq",
    fallbackTitle: "คำถามที่พบบ่อย",
    fallbackHint:
      "ยังไม่มีคำถามที่พบบ่อย — Regenerate landing page เพื่อเพิ่มคำถามอัตโนมัติ",
  });
}
