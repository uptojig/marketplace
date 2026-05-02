import { BlockRenderer } from "@/components/BlockRenderer";
import type { GeneratedPageSchema } from "@/lib/agent-service";

/**
 * Hardcoded demo of the FurryHappiness brand — pet shop using the cute
 * theme. Ships sample content for every blockType registered in
 * components/themes/cute/index.ts so the demo doubles as a visual test
 * for the renderer.
 *
 * Real data comes from the PromptPage agent at /create-store. This page
 * exists so the design works without the agent (and without an API key)
 * for offline review and partner demos.
 */
const FURRY_HAPPINESS_SCHEMA: GeneratedPageSchema = {
  title: "FurryHappiness — ทุกชิ้นเพื่อน้อง",
  slug: "furry-happiness",
  description: "ร้านสินค้าสัตว์เลี้ยงที่คัดสรรมาแล้วว่าน้องๆ จะรักทุกชิ้น",
  themeVariant: "cute",
  reasoning:
    "ใช้โทนสีชมพู-rose สำหรับร้านสัตว์เลี้ยง โครงเริ่มที่ Hero โชว์ตัวเด่น ตามด้วย Features 3 ข้อให้ trust signals แล้ว Product Grid ก่อนปิดด้วย CTA กระตุ้นให้สั่งซื้อ",
  blocks: [
    {
      blockType: "nav",
      content: {
        brand: "FurryHappiness",
        logoUrl:
          "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120&h=120&fit=crop",
        links: [
          { label: "หน้าแรก", href: "#" },
          { label: "สินค้าทั้งหมด", href: "#products" },
          { label: "เกี่ยวกับเรา", href: "#" },
          { label: "ติดต่อ", href: "#" },
        ],
      },
    },
    {
      blockType: "hero",
      content: {
        title: "ทุกชิ้นที่นี่ น้องของคุณจะรัก 🐾",
        subtitle:
          "ตั้งแต่อาหาร ของเล่น ไปจนถึงที่นอน — เราคัดมาแล้วทั้งหมด ส่งเร็วทั่วไทย",
        ctaLabel: "เลือกซื้อเลย",
        ctaHref: "#products",
        imageUrl:
          "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=600&fit=crop",
      },
    },
    {
      blockType: "features",
      content: {
        heading: "ทำไมต้อง FurryHappiness",
        features: [
          {
            icon: "🚚",
            title: "ส่งฟรีทั่วไทย",
            description: "ออเดอร์ตั้งแต่ 599.- ส่งฟรี ไม่มีขั้นต่ำต่อชิ้น",
          },
          {
            icon: "✨",
            title: "คัดของจริงทุกชิ้น",
            description: "ทีมงานทดลองใช้กับน้องๆ ของเราก่อนเลือกขาย",
          },
          {
            icon: "💬",
            title: "ปรึกษาฟรี 24/7",
            description: "ไม่แน่ใจไซส์ไหนเหมาะ ทักไลน์ได้ตลอดเวลา",
          },
        ],
      },
    },
    {
      blockType: "productGrid",
      content: {
        heading: "ขายดีที่สุดสัปดาห์นี้",
        subheading: "น้องๆ เลือกแล้วบอกต่อกันมา",
        products: [
          {
            title: "Pet GPS Tracker — ติดปลอกคอ ระบุตำแหน่งแบบ real-time",
            imageUrl:
              "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop",
            priceTHB: 1290,
            compareAtPriceTHB: 1690,
            badge: "ลด 24%",
            href: "#",
          },
          {
            title: "ที่นอนนุ่มฟู ทรงโดนัท — สำหรับน้องหมาน้องแมวขนาดกลาง",
            imageUrl:
              "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop",
            priceTHB: 590,
            href: "#",
          },
          {
            title: "ของเล่นแมวอัตโนมัติ — เล่นเองได้ไม่เบื่อ",
            imageUrl:
              "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=400&fit=crop",
            priceTHB: 450,
            compareAtPriceTHB: 590,
            badge: "ขายดี",
            href: "#",
          },
          {
            title: "อาหารเปียก Premium — แพ็ค 12 กระป๋อง",
            imageUrl:
              "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop",
            priceTHB: 720,
            href: "#",
          },
        ],
      },
    },
    {
      blockType: "cta",
      content: {
        heading: "พร้อมทำให้น้องมีความสุขขึ้นไหม?",
        body: "สมัครสมาชิกเลยวันนี้ รับส่วนลด 10% สำหรับออเดอร์แรก + ของแถมพิเศษ",
        ctaLabel: "สมัครสมาชิกฟรี",
        ctaHref: "/signup",
      },
    },
    {
      blockType: "footer",
      content: {
        brand: "FurryHappiness",
        tagline: "ทุกชิ้นเพื่อน้อง — เลือกของน้องเหมือนเลือกของลูก",
        copyright: "© 2026 FurryHappiness. All rights reserved.",
      },
    },
  ],
};

export const dynamic = "force-static";

export default function CuteDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50/30 px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <BlockRenderer schema={FURRY_HAPPINESS_SCHEMA} />
      </div>
    </div>
  );
}
