// Sent when vendor marks the order shipped (Phase 2A action will call
// the hook). Tracking number + carrier-specific tracking URL.

import * as React from "react";
import { Link, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./_layout";
import {
  type EmailBuyerDTO,
  type EmailOrderDTO,
  type EmailStoreDTO,
} from "./types";

export interface OrderShippedEmailProps {
  order: EmailOrderDTO;
  store: EmailStoreDTO;
  buyer: EmailBuyerDTO;
  trackingNumber: string;
  carrier?: string | null;
}

/**
 * Best-effort carrier → tracking URL mapping. Falls back to a generic
 * search URL when the carrier is unknown so the link is never broken.
 */
function trackingUrlFor(carrier: string | null | undefined, trackingNumber: string): string {
  const c = (carrier || "").toLowerCase();
  if (c.includes("kerry")) return `https://th.kerryexpress.com/en/track/?track=${encodeURIComponent(trackingNumber)}`;
  if (c.includes("thai") || c.includes("ไปรษณีย์") || c.includes("post"))
    return `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(trackingNumber)}`;
  if (c.includes("flash")) return `https://www.flashexpress.com/fle/tracking?se=${encodeURIComponent(trackingNumber)}`;
  if (c.includes("j&t") || c.includes("jnt")) return `https://www.jtexpress.co.th/index/query/gzquery.html?bills=${encodeURIComponent(trackingNumber)}`;
  if (c.includes("dhl")) return `https://www.dhl.com/th-en/home/tracking.html?tracking-id=${encodeURIComponent(trackingNumber)}`;
  return `https://www.google.com/search?q=${encodeURIComponent(`tracking ${carrier ?? ""} ${trackingNumber}`)}`;
}

export default function OrderShippedEmail({
  order,
  store,
  buyer,
  trackingNumber,
  carrier,
}: OrderShippedEmailProps) {
  const accent = store.brandColor || "#2563eb";
  const buyerName = buyer.name || "ลูกค้า";
  const trackingUrl = trackingUrlFor(carrier, trackingNumber);
  const eta = order.estimatedDelivery
    ? new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(order.estimatedDelivery)
    : null;

  return (
    <EmailLayout
      preview={`คำสั่งซื้อ #${order.orderRef} ของคุณกำลังจัดส่ง`}
      storeName={store.name}
      storeLogoUrl={store.logoUrl}
      brandColor={store.brandColor}
    >
      <Text style={emailStyles.heading}>คำสั่งซื้อของคุณกำลังจัดส่ง</Text>
      <Text style={emailStyles.paragraph}>
        สวัสดีคุณ {buyerName} คำสั่งซื้อ <strong>#{order.orderRef}</strong>{" "}
        ออกจากคลังของ {store.name} เรียบร้อยแล้ว
      </Text>

      <Text style={emailStyles.paragraph}>
        <strong>ขนส่ง:</strong> {carrier || "ไม่ระบุ"}
        <br />
        <strong>หมายเลขพัสดุ:</strong> {trackingNumber}
        {eta ? (
          <>
            <br />
            <strong>กำหนดส่งถึง:</strong> {eta}
          </>
        ) : null}
      </Text>

      <Link href={trackingUrl} style={emailStyles.ctaButton(accent)}>
        ติดตามพัสดุ
      </Link>

      <Text style={emailStyles.paragraph}>
        หากปุ่มด้านบนไม่ทำงาน สามารถคัดลอกลิงก์นี้ไปวางที่เบราว์เซอร์ได้:
        <br />
        <Link href={trackingUrl} style={{ color: accent }}>
          {trackingUrl}
        </Link>
      </Text>
    </EmailLayout>
  );
}
