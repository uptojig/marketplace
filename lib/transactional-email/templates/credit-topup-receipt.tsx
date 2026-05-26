// Sent to the buyer immediately after a credit top-up settles (the
// AnyPay webhook fires PAID and `markTopupPaid` succeeds). The email
// carries the human-readable reference number and a link to the full
// receipt page — the receipt page is the canonical document, the
// email body just summarises.

import * as React from "react";
import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import {
  type EmailBuyerDTO,
  type EmailStoreDTO,
  formatTHB,
} from "./types";

export interface CreditTopupReceiptEmailProps {
  store: EmailStoreDTO;
  buyer: EmailBuyerDTO;
  /** TOP-YYYYMMDD-XXXXXX. */
  referenceNumber: string;
  amountTHB: number;
  /** Wall-clock paid-at timestamp formatted for the buyer's locale. */
  paidAtIso: string;
  /** AnyPay transaction id (just for reference — not auth). */
  anypayTransactionId?: string | null;
  /** Absolute URL to /stores/<slug>/account/credit/receipts/<ref>. */
  receiptUrl: string;
}

export default function CreditTopupReceiptEmail({
  store,
  buyer,
  referenceNumber,
  amountTHB,
  paidAtIso,
  anypayTransactionId,
  receiptUrl,
}: CreditTopupReceiptEmailProps) {
  const accent = store.brandColor || "#2563eb";
  const buyerName = buyer.name || "ลูกค้า";
  const paidAtThai = new Date(paidAtIso).toLocaleString("th-TH", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <EmailLayout
      preview={`ยืนยันการเติมเครดิต ${referenceNumber}`}
      storeName={store.name}
      storeLogoUrl={store.logoUrl}
      brandColor={store.brandColor}
    >
      <Text style={emailStyles.heading}>เติมเครดิตสำเร็จ ✓</Text>
      <Text style={emailStyles.paragraph}>
        สวัสดีคุณ {buyerName} เราได้รับการชำระเงินของคุณเรียบร้อยแล้ว
        และยอดเครดิตของคุณที่ร้าน <strong>{store.name}</strong>{" "}
        ได้รับการอัปเดตเป็นที่เรียบร้อย
      </Text>

      <Section
        style={{
          background: "#f8fafc",
          borderRadius: "8px",
          padding: "16px 18px",
          margin: "16px 0",
        }}
      >
        <table style={{ width: "100%", fontSize: "14px" }}>
          <tbody>
            <tr>
              <td style={{ color: "#64748b", padding: "4px 0" }}>
                หมายเลขอ้างอิง
              </td>
              <td
                style={{
                  textAlign: "right",
                  padding: "4px 0",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {referenceNumber}
              </td>
            </tr>
            <tr>
              <td style={{ color: "#64748b", padding: "4px 0" }}>
                ยอดเครดิตที่เติม
              </td>
              <td
                style={{
                  textAlign: "right",
                  padding: "4px 0",
                  fontWeight: 700,
                  color: "#0f172a",
                  fontSize: "16px",
                }}
              >
                {formatTHB(amountTHB)}
              </td>
            </tr>
            <tr>
              <td style={{ color: "#64748b", padding: "4px 0" }}>วัน-เวลา</td>
              <td
                style={{
                  textAlign: "right",
                  padding: "4px 0",
                  color: "#0f172a",
                }}
              >
                {paidAtThai}
              </td>
            </tr>
            {anypayTransactionId ? (
              <tr>
                <td style={{ color: "#64748b", padding: "4px 0" }}>
                  AnyPay TX
                </td>
                <td
                  style={{
                    textAlign: "right",
                    padding: "4px 0",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#0f172a",
                    wordBreak: "break-all",
                  }}
                >
                  {anypayTransactionId}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Section>

      <Section style={{ textAlign: "center", margin: "20px 0" }}>
        <Button href={receiptUrl} style={emailStyles.ctaButton(accent)}>
          เปิดใบเสร็จและบันทึก PDF
        </Button>
      </Section>

      <Text
        style={{
          ...emailStyles.paragraph,
          fontSize: "12px",
          color: "#64748b",
        }}
      >
        เครดิตที่เติมแล้วไม่สามารถแลกเปลี่ยนหรือขอคืนเป็นเงินสดได้ ใบเสร็จนี้
        เป็นเอกสารยืนยันการทำรายการ — เก็บไว้เผื่อใช้อ้างอิงในภายหลัง
      </Text>
    </EmailLayout>
  );
}
