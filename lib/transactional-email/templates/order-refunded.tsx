// Sent on refund issuance (Phase 3C will call the hook). Shows the
// refunded amount + the bank-settlement ETA.

import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import {
  type EmailBuyerDTO,
  type EmailOrderDTO,
  type EmailStoreDTO,
  formatTHB,
} from "./types";

export interface OrderRefundedEmailProps {
  order: EmailOrderDTO;
  store: EmailStoreDTO;
  buyer: EmailBuyerDTO;
  amountTHB: number;
  /** Optional human description of refund ETA, e.g. "ภายใน 5-7 วันทำการ". */
  etaText?: string;
}

export default function OrderRefundedEmail({
  order,
  store,
  buyer,
  amountTHB,
  etaText,
}: OrderRefundedEmailProps) {
  const buyerName = buyer.name || "ลูกค้า";
  const eta = etaText || "ภายใน 5–7 วันทำการ";

  return (
    <EmailLayout
      preview={`เงินคืนสำหรับคำสั่งซื้อ #${order.orderRef}`}
      storeName={store.name}
      storeLogoUrl={store.logoUrl}
      brandColor={store.brandColor}
    >
      <Text style={emailStyles.heading}>
        เงินคืนสำหรับคำสั่งซื้อ #{order.orderRef}
      </Text>
      <Text style={emailStyles.paragraph}>
        สวัสดีคุณ {buyerName} เราได้ดำเนินการคืนเงินจำนวน{" "}
        <strong>{formatTHB(amountTHB)}</strong> สำหรับคำสั่งซื้อ{" "}
        <strong>#{order.orderRef}</strong> เรียบร้อยแล้ว
      </Text>

      <Text style={emailStyles.paragraph}>
        <strong>ระยะเวลาที่จะได้รับ:</strong> {eta} โดยจะเข้าบัญชี/บัตรเดิมที่ใช้ชำระ
      </Text>

      <Text style={emailStyles.paragraph}>
        หากเลย {eta} แล้วยังไม่ได้รับเงินคืน กรุณาติดต่อธนาคารผู้ออกบัตรของคุณ
        หรือสอบถามที่อีเมล {store.contactEmail || "support@basketplace.co"}
      </Text>
    </EmailLayout>
  );
}
