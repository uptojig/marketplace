// Sent immediately after a successful PAID transition (anypay webhook
// or markOrderPaid). Confirms receipt, lists items, sets expectation
// for the next email (shipping notification).

import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import {
  type EmailBuyerDTO,
  type EmailOrderDTO,
  type EmailStoreDTO,
  formatTHB,
} from "./types";

export interface OrderPaidEmailProps {
  order: EmailOrderDTO;
  store: EmailStoreDTO;
  buyer: EmailBuyerDTO;
}

export default function OrderPaidEmail({
  order,
  store,
  buyer,
}: OrderPaidEmailProps) {
  const buyerName = buyer.name || "ลูกค้า";

  return (
    <EmailLayout
      preview={`ขอบคุณสำหรับคำสั่งซื้อ #${order.orderRef}`}
      storeName={store.name}
      storeLogoUrl={store.logoUrl}
      brandColor={store.brandColor}
    >
      <Text style={emailStyles.heading}>
        ขอบคุณสำหรับคำสั่งซื้อที่ {store.name}!
      </Text>
      <Text style={emailStyles.paragraph}>
        สวัสดีคุณ {buyerName} เราได้รับการชำระเงินเรียบร้อยแล้ว
        คำสั่งซื้อของคุณกำลังเตรียมจัดส่ง เราจะส่งอีเมลแจ้งคุณอีกครั้งเมื่อสินค้าออกจากคลัง
      </Text>

      <Text style={emailStyles.paragraph}>
        <strong>หมายเลขคำสั่งซื้อ:</strong> #{order.orderRef}
      </Text>

      <table style={emailStyles.table}>
        <thead>
          <tr style={emailStyles.tableHeaderRow}>
            <th style={emailStyles.tableCell}>สินค้า</th>
            <th style={{ ...emailStyles.tableCell, textAlign: "right" }}>
              จำนวน
            </th>
            <th style={{ ...emailStyles.tableCell, textAlign: "right" }}>
              ราคา
            </th>
          </tr>
        </thead>
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
                {item.qty}
              </td>
              <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
                {formatTHB(item.unitPriceTHB * item.qty)}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} style={emailStyles.tableCell}>
              ยอดสินค้า
            </td>
            <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
              {formatTHB(order.subtotalTHB)}
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={emailStyles.tableCell}>
              ค่าจัดส่ง
            </td>
            <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
              {formatTHB(order.shippingTHB)}
            </td>
          </tr>
          {order.discountTHB > 0 ? (
            <tr>
              <td colSpan={2} style={emailStyles.tableCell}>
                ส่วนลด
              </td>
              <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
                -{formatTHB(order.discountTHB)}
              </td>
            </tr>
          ) : null}
          <tr style={emailStyles.totalRow}>
            <td colSpan={2} style={emailStyles.tableCell}>
              รวมทั้งสิ้น
            </td>
            <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
              {formatTHB(order.totalTHB)}
            </td>
          </tr>
        </tbody>
      </table>

      <Text style={emailStyles.paragraph}>
        เราจะส่งอีเมลแจ้งคุณอีกครั้งเมื่อสินค้าออกจัดส่ง
      </Text>
    </EmailLayout>
  );
}
