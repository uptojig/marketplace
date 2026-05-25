// Sent after a PAID transition for any order that contains at least
// one DIGITAL line item. The order-paid email still fires for the
// receipt; this is a separate fulfillment email that tells the buyer
// where to grab the file(s) / prompt(s).

import * as React from "react";
import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import type {
  EmailBuyerDTO,
  EmailOrderDTO,
  EmailStoreDTO,
} from "./types";

export interface DigitalUnlockLine {
  productTitle: string;
  /** "PROMPT" → text content; otherwise file-based. */
  digitalKind:
    | "PROMPT"
    | "EBOOK"
    | "EXCEL"
    | "VECTOR"
    | "ARCHIVE"
    | "OTHER";
  /** Number of downloadable files attached to the product. */
  fileCount: number;
}

export interface DigitalUnlockReadyEmailProps {
  order: EmailOrderDTO;
  store: EmailStoreDTO;
  buyer: EmailBuyerDTO;
  /** Built by the hook; one entry per DIGITAL line in the order. */
  unlocks: DigitalUnlockLine[];
  /** Absolute URL to /stores/[slug]/account/downloads. */
  downloadsUrl: string;
}

export default function DigitalUnlockReadyEmail({
  order,
  store,
  buyer,
  unlocks,
  downloadsUrl,
}: DigitalUnlockReadyEmailProps) {
  const buyerName = buyer.name || "ลูกค้า";
  const accent = store.brandColor || "#2563eb";
  const mixedKinds = unlocks.some((u) => u.digitalKind === "PROMPT")
    && unlocks.some((u) => u.digitalKind !== "PROMPT");

  return (
    <EmailLayout
      preview={`สินค้าดิจิทัลของคุณพร้อมแล้ว — #${order.orderRef}`}
      storeName={store.name}
      storeLogoUrl={store.logoUrl}
      brandColor={store.brandColor}
    >
      <Text style={emailStyles.heading}>สินค้าดิจิทัลของคุณพร้อมแล้ว 🎉</Text>
      <Text style={emailStyles.paragraph}>
        สวัสดีคุณ {buyerName} ขอบคุณสำหรับคำสั่งซื้อ <strong>#{order.orderRef}</strong>
        {" "}— สินค้าดิจิทัลของคุณปลดล็อกเรียบร้อยแล้ว สามารถเปิดดูหรือดาวน์โหลดได้ทันที
      </Text>

      <Section style={{ textAlign: "center", margin: "16px 0" }}>
        <Button href={downloadsUrl} style={emailStyles.ctaButton(accent)}>
          เปิดคลังสินค้าดิจิทัล
        </Button>
      </Section>

      <Text style={emailStyles.paragraph}>
        <strong>สินค้าที่ปลดล็อก:</strong>
      </Text>
      <table style={emailStyles.table}>
        <thead>
          <tr style={emailStyles.tableHeaderRow}>
            <th style={emailStyles.tableCell}>สินค้า</th>
            <th style={{ ...emailStyles.tableCell, textAlign: "right" }}>
              ประเภท
            </th>
          </tr>
        </thead>
        <tbody>
          {unlocks.map((u, idx) => (
            <tr key={idx}>
              <td style={emailStyles.tableCell}>{u.productTitle}</td>
              <td style={{ ...emailStyles.tableCell, textAlign: "right" }}>
                {u.digitalKind === "PROMPT"
                  ? "Prompt (คัดลอกได้)"
                  : `${u.digitalKind} (${u.fileCount} ไฟล์)`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Text style={{ ...emailStyles.paragraph, marginTop: "16px" }}>
        {mixedKinds
          ? "Prompt อ่าน/คัดลอกได้ทันทีในหน้าคลังสินค้า ส่วนไฟล์ดาวน์โหลดจะเปิดเป็นลิงก์ระยะสั้น (10 นาที) ทุกครั้งที่กดดาวน์โหลด — ลิงก์ใหม่ทุกครั้ง ปลอดภัย"
          : unlocks[0]?.digitalKind === "PROMPT"
            ? "เปิดหน้าคลังสินค้าเพื่ออ่านและคัดลอก prompt ฉบับเต็ม"
            : "ลิงก์ดาวน์โหลดมีอายุ 10 นาที ระบบจะสร้างใหม่ทุกครั้งที่กดดาวน์โหลด — สูงสุด 20 ครั้ง/วัน"}
      </Text>

      <Text
        style={{
          ...emailStyles.paragraph,
          fontSize: "12px",
          color: "#64748b",
          marginTop: "20px",
        }}
      >
        หากพบปัญหาในการดาวน์โหลด กรุณาตอบกลับอีเมลนี้หรือติดต่อร้านโดยตรง
      </Text>
    </EmailLayout>
  );
}
