// Abandoned cart reminder. No automated trigger wired in this PR —
// a future cron / Inngest job will call sendAbandonedCartEmail().

import * as React from "react";
import { Link, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import {
  type EmailBuyerDTO,
  type EmailCartItemDTO,
  type EmailStoreDTO,
  formatTHB,
  getEmailBaseUrl,
} from "./types";

export interface AbandonedCartEmailProps {
  buyer: EmailBuyerDTO;
  store: EmailStoreDTO;
  cartItems: EmailCartItemDTO[];
}

export default function AbandonedCartEmail({
  buyer,
  store,
  cartItems,
}: AbandonedCartEmailProps) {
  const accent = store.brandColor || "#2563eb";
  const buyerName = buyer.name || "คุณ";
  const cartUrl = `${getEmailBaseUrl()}/stores/${store.slug}/cart`;
  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.unitPriceTHB * i.qty,
    0,
  );

  return (
    <EmailLayout
      preview={`คุณลืมของในตะกร้าที่ ${store.name}`}
      storeName={store.name}
      storeLogoUrl={store.logoUrl}
      brandColor={store.brandColor}
    >
      <Text style={emailStyles.heading}>คุณลืมของในตะกร้า</Text>
      <Text style={emailStyles.paragraph}>
        สวัสดีคุณ {buyerName} เรายังเก็บสินค้าในตะกร้าของคุณไว้
        กลับมาดูสินค้าเหล่านี้ได้ก่อนสต็อกหมด
      </Text>

      <table style={emailStyles.table}>
        <thead>
          <tr style={emailStyles.tableHeaderRow}>
            <th style={emailStyles.tableCell}>สินค้า</th>
            <th style={{ ...emailStyles.tableCell, textAlign: "right" }}>จำนวน</th>
            <th style={{ ...emailStyles.tableCell, textAlign: "right" }}>ราคา</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item, idx) => (
            <tr key={idx}>
              <td style={emailStyles.tableCell}>{item.title}</td>
              <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
                {item.qty}
              </td>
              <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
                {formatTHB(item.unitPriceTHB * item.qty)}
              </td>
            </tr>
          ))}
          <tr style={emailStyles.totalRow}>
            <td colSpan={2} style={emailStyles.tableCell}>
              ยอดสินค้า
            </td>
            <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
              {formatTHB(subtotal)}
            </td>
          </tr>
        </tbody>
      </table>

      <Link href={cartUrl} style={emailStyles.ctaButton(accent)}>
        กลับไปดูตะกร้า
      </Link>

      <Text style={emailStyles.paragraph}>
        หรือกดลิงก์นี้:{" "}
        <Link href={cartUrl} style={{ color: accent }}>
          {cartUrl}
        </Link>
      </Text>
    </EmailLayout>
  );
}
