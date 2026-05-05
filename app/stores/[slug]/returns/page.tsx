/**
 * /stores/{slug}/returns — Returns / refund policy.
 * Required by payment-gateway merchant approval.
 */
import { renderSchemaPage } from "../_lib/render-schema-page";

export const dynamic = "force-dynamic";

export default async function ReturnsPage({
  params,
}: {
  params: { slug: string };
}) {
  return renderSchemaPage({
    storeSlug: params.slug,
    pageSlug: "returns",
    fallbackTitle: "นโยบายการคืนสินค้า",
    fallbackHint:
      "ยังไม่มีนโยบายการคืนสินค้า — Regenerate landing page เพื่อเพิ่มเนื้อหาอัตโนมัติ",
  });
}
