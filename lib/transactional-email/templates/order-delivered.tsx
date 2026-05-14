// Sent when carrier signals delivery (Phase 2A markOrderDelivered).
// Includes a CTA back to the buyer's order detail page for review.

import * as React from "react";
import { Link, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import {
  type EmailBuyerDTO,
  type EmailOrderDTO,
  type EmailStoreDTO,
  formatTHB,
  getEmailBaseUrl,
} from "./types";

export interface OrderDeliveredEmailProps {
  order: EmailOrderDTO;
  store: EmailStoreDTO;
  buyer: EmailBuyerDTO;
}

export default function OrderDeliveredEmail({
  order,
  store,
  buyer,
}: OrderDeliveredEmailProps) {
  const accent = store.brandColor || "#2563eb";
  const buyerName = buyer.name || "ลูกค้า";
  const orderUrl = `${getEmailBaseUrl()}/stores/${store.slug}/account/orders/${order.id}`;

  return (
    <EmailLayout
      preview={`คำสั่งซื้อ #${order.orderRef} จัดส่งสำเร็จแล้ว`}
      storeName={store.name}
      storeLogoUrl={store.logoUrl}
      brandColor={store.brandColor}
    >
      <Text style={emailStyles.heading}>คำสั่งซื้อจัดส่งสำเร็จแล้ว</Text>
      <Text style={emailStyles.paragraph}>
        สวัสดีคุณ {buyerName} คำสั่งซื้อ <strong>#{order.orderRef}</strong>{" "}
        จัดส่งถึงคุณเรียบร้อยแล้ว ขอขอบคุณที่อุดหนุน {store.name}
      </Text>

      <table style={emailStyles.table}>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td style={emailStyles.tableCell}>
                {item.title}
                {item.variantName ? (
                  <span style={{ display: "block", color: "#64748b", fontSize: "12px" }}>
                    {item.variantName}
                  </span>
                ) : null}
              </td>
              <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
                ×{item.qty}
              </td>
              <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
                {formatTHB(item.unitPriceTHB * item.qty)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link href={orderUrl} style={emailStyles.ctaButton(accent)}>
        รีวิวคำสั่งซื้อนี้
      </Link>

      <Text style={emailStyles.paragraph}>
        หากสินค้ามีปัญหาใดๆ คุณสามารถติดต่อร้านค้าได้ภายใน 7 วันหลังจากได้รับ
      </Text>
    </EmailLayout>
  );
}
