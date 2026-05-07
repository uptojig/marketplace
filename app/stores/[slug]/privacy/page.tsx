/**
 * /stores/{slug}/privacy — Privacy policy (PDPA-compliant).
 * Required by payment-gateway merchant approval.
 */
import { renderSchemaPage } from "../_lib/render-schema-page";

export const dynamic = "force-dynamic";

export default async function PrivacyPage({
  params,
}: {
  params: { slug: string };
}) {
  return renderSchemaPage({
    storeSlug: params.slug,
    pageSlug: "privacy",
    fallbackTitle: "นโยบายความเป็นส่วนตัว",
    fallbackHint:
      "ยังไม่มีนโยบายความเป็นส่วนตัว — Regenerate landing page เพื่อเพิ่มเนื้อหาอัตโนมัติ",
  });
}
