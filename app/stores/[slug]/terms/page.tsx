/**
 * /stores/{slug}/terms — Terms of service / conditions of purchase.
 * Required by payment-gateway merchant approval.
 */
import { renderSchemaPage } from "../_lib/render-schema-page";

export const dynamic = "force-dynamic";

export default async function TermsPage({
  params,
}: {
  params: { slug: string };
}) {
  return renderSchemaPage({
    storeSlug: params.slug,
    pageSlug: "terms",
    fallbackTitle: "เงื่อนไขการให้บริการ",
    fallbackHint:
      "ยังไม่มีเงื่อนไขการให้บริการ — Regenerate landing page เพื่อเพิ่มเนื้อหาอัตโนมัติ",
  });
}
