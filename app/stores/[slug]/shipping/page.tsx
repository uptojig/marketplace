/**
 * /stores/{slug}/shipping — Shipping policy.
 * Required by payment-gateway merchant approval.
 */
import { renderSchemaPage } from "../_lib/render-schema-page";

export const dynamic = "force-dynamic";

export default async function ShippingPage({
  params,
}: {
  params: { slug: string };
}) {
  return renderSchemaPage({
    storeSlug: params.slug,
    pageSlug: "shipping",
    fallbackTitle: "นโยบายการจัดส่ง",
    fallbackHint:
      "ยังไม่มีนโยบายการจัดส่ง — Regenerate landing page เพื่อเพิ่มเนื้อหาอัตโนมัติ",
  });
}
