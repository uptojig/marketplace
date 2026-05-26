// Sent to each gift recipient after a PAID order with gift recipients
// fans out into DigitalUnlock rows. The email carries a magic-link to
// /unlock/<accessToken> — no signup, just open + download.

import * as React from "react";
import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import type { EmailStoreDTO } from "./types";

export interface GiftUnlockReadyEmailProps {
  store: EmailStoreDTO;
  /** Who's sending the gift. Falls back to "เพื่อน" if buyer is anon. */
  gifterName: string;
  recipientName: string;
  productTitle: string;
  productImage?: string | null;
  /** Optional personal message from the gifter. */
  giftMessage?: string | null;
  /** Absolute URL to /unlock/<accessToken>. */
  unlockUrl: string;
}

export default function GiftUnlockReadyEmail({
  store,
  gifterName,
  recipientName,
  productTitle,
  productImage,
  giftMessage,
  unlockUrl,
}: GiftUnlockReadyEmailProps) {
  const accent = store.brandColor || "#2563eb";
  return (
    <EmailLayout
      preview={`${gifterName} ส่งของขวัญดิจิทัลให้คุณ — ${productTitle}`}
      storeName={store.name}
      storeLogoUrl={store.logoUrl}
      brandColor={store.brandColor}
    >
      <Text style={emailStyles.heading}>🎁 คุณได้รับของขวัญดิจิทัล!</Text>
      <Text style={emailStyles.paragraph}>
        สวัสดีคุณ {recipientName} —{" "}
        <strong>{gifterName}</strong> ส่งของขวัญดิจิทัลให้คุณ:
      </Text>

      <Section
        style={{
          background: "#f8fafc",
          borderRadius: "8px",
          padding: "14px 16px",
          margin: "12px 0",
        }}
      >
        {productImage ? (
          <img
            src={productImage}
            alt={productTitle}
            width={120}
            height={120}
            style={{
              borderRadius: "6px",
              display: "block",
              marginBottom: "8px",
            }}
          />
        ) : null}
        <Text style={{ ...emailStyles.paragraph, fontWeight: 700, margin: 0 }}>
          {productTitle}
        </Text>
      </Section>

      {giftMessage ? (
        <Section
          style={{
            borderLeft: `3px solid ${accent}`,
            padding: "4px 14px",
            margin: "16px 0",
          }}
        >
          <Text style={{ ...emailStyles.paragraph, fontStyle: "italic" }}>
            “{giftMessage}”
          </Text>
        </Section>
      ) : null}

      <Section style={{ textAlign: "center", margin: "20px 0" }}>
        <Button href={unlockUrl} style={emailStyles.ctaButton(accent)}>
          เปิดของขวัญและดาวน์โหลด
        </Button>
      </Section>

      <Text
        style={{
          ...emailStyles.paragraph,
          fontSize: "12px",
          color: "#64748b",
        }}
      >
        ลิงก์นี้ใช้ได้ตลอดอายุไฟล์ ไม่ต้องสมัครสมาชิก — เปิดด้วยอีเมลฉบับนี้
        เพียงครั้งเดียวก็พอ คุณสามารถบุ๊กมาร์กไว้ดาวน์โหลดในภายหลังได้
      </Text>
    </EmailLayout>
  );
}
