"use client";

/**
 * Multi-page preview for the create-store wizard.
 *
 * Existing live-preview.tsx only mocks the homepage — picking a
 * different template only swaps a few behavior flags (swatch row,
 * countdown stripe), so the preview never communicated the FULL
 * design system the merchant is buying. The user's complaint:
 *   "เลือก template แล้วยังเหมือนเดิมหมด"
 *
 * This component shows ALL 8 storefront page mockups in tabs:
 *   หน้าแรก · หมวดหมู่ · สินค้า · ตะกร้า · ชำระเงิน · สั่งซื้อสำเร็จ ·
 *   ติดต่อ · นโยบาย
 *
 * Each mockup picks the family from templateId (via FAMILY_BY_TEMPLATE)
 * and renders a low-fidelity SVG-ish sketch using that family's palette
 * + typography + copy voice. The schematics intentionally use
 * abstract blocks instead of actual storefront components — the
 * preview must update instantly as the merchant clicks templates,
 * without any DB round-trip.
 *
 * Why per-family (not per-template) mockups: the runtime ship matrix
 * is 6 families × 8 pages = 48 designs. Templates within a family
 * share the page chrome — they only diverge in the homepage block
 * composition. So 6 family mockups per page communicates the actual
 * delivered design.
 */

import { useState } from "react";
import type { Behavior, Template, TemplateId } from "@/lib/store/wizard-data";

export type PageKey =
  | "home"
  | "category"
  | "pdp"
  | "cart"
  | "checkout"
  | "success"
  | "contact"
  | "policy";

export const PAGE_TYPES: Array<{ key: PageKey; label: string }> = [
  { key: "home", label: "หน้าแรก" },
  { key: "category", label: "หมวดหมู่" },
  { key: "pdp", label: "สินค้า" },
  { key: "cart", label: "ตะกร้า" },
  { key: "checkout", label: "ชำระเงิน" },
  { key: "success", label: "สั่งซื้อสำเร็จ" },
  { key: "contact", label: "ติดต่อ" },
  { key: "policy", label: "นโยบาย" },
];

type Family =
  | "fashion-beauty"
  | "trust"
  | "business-model"
  | "lifestyle"
  | "electronics-tech"
  | "specialty"
  | "default";

const FAMILY_BY_TEMPLATE: Record<TemplateId, Family> = {
  lookbook: "fashion-beauty",
  "beauty-swatch": "fashion-beauty",
  boutique: "fashion-beauty",
  classic: "trust",
  "official-brand": "trust",
  "premium-luxury": "trust",
  "wholesale-b2b": "business-model",
  "flash-deal": "business-model",
  subscription: "business-model",
  "home-living": "lifestyle",
  "sport-active": "lifestyle",
  "kids-toys": "lifestyle",
  "catalog-dense": "electronics-tech",
  "tech-compare": "electronics-tech",
  "single-product": "electronics-tech",
  handmade: "specialty",
  vintage: "specialty",
  "live-commerce": "default",
  "video-feed": "default",
  storyteller: "default",
};

interface FamilyTheme {
  bg: string;
  surface: string;
  primary: string;
  accent: string;
  ink: string;
  inkMuted: string;
  border: string;
  serif: string;
  mono: string;
  /** Default sans for non-headline text. */
  sans: string;
  /** Heading family the family uses (override per-page if needed). */
  heading: "serif" | "mono" | "sans";
  /** Card corner radius style cue. */
  radius: "sharp" | "default" | "round";
}

const SERIF_PLAYFAIR =
  '"Playfair Display", Georgia, "Noto Serif Thai", serif';
const SERIF_CORMORANT = '"Cormorant Garamond", Georgia, "Noto Serif Thai", serif';
const SERIF_FRAUNCES = '"Fraunces", Georgia, "Noto Serif Thai", serif';
const MONO_JET = '"JetBrains Mono", ui-monospace, "Cascadia Mono", monospace';
const SANS_OUTFIT = '"Outfit", "Plus Jakarta Sans", "DM Sans", "Prompt", sans-serif';
const SANS_INTER = '"Inter Tight", "Inter", "IBM Plex Sans Thai", sans-serif';
const SANS_SYS = "ui-sans-serif, system-ui, sans-serif";

const FAMILY_THEMES: Record<Family, FamilyTheme> = {
  "fashion-beauty": {
    bg: "#fbf8f4",
    surface: "#ffffff",
    primary: "#f43f5e",
    accent: "#fda4af",
    ink: "#3f1d2c",
    inkMuted: "#a18792",
    border: "#f5e1e8",
    serif: SERIF_CORMORANT,
    mono: MONO_JET,
    sans: SANS_SYS,
    heading: "serif",
    radius: "round",
  },
  trust: {
    bg: "#fbf9f5",
    surface: "#ffffff",
    primary: "#1f1f1f",
    accent: "#b8862a",
    ink: "#1f1f1f",
    inkMuted: "#6b6358",
    border: "#e8dec6",
    serif: SERIF_PLAYFAIR,
    mono: MONO_JET,
    sans: SANS_SYS,
    heading: "serif",
    radius: "sharp",
  },
  "business-model": {
    bg: "#ffffff",
    surface: "#fafafa",
    primary: "#dc2626",
    accent: "#10b981",
    ink: "#0a0a0a",
    inkMuted: "#52525b",
    border: "#e4e4e7",
    serif: SERIF_PLAYFAIR,
    mono: MONO_JET,
    sans: SANS_SYS,
    heading: "sans",
    radius: "default",
  },
  lifestyle: {
    bg: "#faf5ee",
    surface: "#ffffff",
    primary: "#cc6f4d",
    accent: "#7a9d6a",
    ink: "#3a322c",
    inkMuted: "#9b8e80",
    border: "#ead9c4",
    serif: SERIF_PLAYFAIR,
    mono: MONO_JET,
    sans: SANS_OUTFIT,
    heading: "sans",
    radius: "round",
  },
  "electronics-tech": {
    bg: "#ffffff",
    surface: "#ffffff",
    primary: "#0f4c81",
    accent: "#34d399",
    ink: "#0a0a0a",
    inkMuted: "#52525b",
    border: "#e4e4e7",
    serif: SERIF_PLAYFAIR,
    mono: MONO_JET,
    sans: SANS_INTER,
    heading: "sans",
    radius: "default",
  },
  specialty: {
    bg: "#f3eadc",
    surface: "#fbf6ec",
    primary: "#a8651a",
    accent: "#7d4f1f",
    ink: "#3b2a16",
    inkMuted: "#8a7456",
    border: "#d9c4a3",
    serif: SERIF_FRAUNCES,
    mono: MONO_JET,
    sans: SANS_SYS,
    heading: "serif",
    radius: "default",
  },
  default: {
    bg: "#ffffff",
    surface: "#fafafa",
    primary: "#0a0a0a",
    accent: "#71717a",
    ink: "#0a0a0a",
    inkMuted: "#71717a",
    border: "#e4e4e7",
    serif: SERIF_PLAYFAIR,
    mono: MONO_JET,
    sans: SANS_SYS,
    heading: "sans",
    radius: "default",
  },
};

function radiusPx(r: FamilyTheme["radius"], scale: "sm" | "md" | "lg" = "md"): string {
  const map = {
    sharp: { sm: "2px", md: "3px", lg: "4px" },
    default: { sm: "4px", md: "6px", lg: "10px" },
    round: { sm: "8px", md: "14px", lg: "22px" },
  };
  return map[r][scale];
}

function familyEyebrow(family: Family, page: PageKey): string {
  const map: Record<Family, Partial<Record<PageKey, string>>> = {
    "fashion-beauty": {
      home: "The Edit · Curated for you",
      category: "The Edit · Season Collection",
      pdp: "From the boutique",
      cart: "The Edit",
      checkout: "Checkout · Step 1 of 2",
      success: "Order placed",
      contact: "Get in touch",
      policy: "Customer care",
    },
    trust: {
      home: "MAISON · THE COLLECTION",
      category: "MAISON · ALL ITEMS",
      pdp: "MAISON · DETAIL",
      cart: "MAISON · YOUR ORDER",
      checkout: "MAISON · CHECKOUT",
      success: "ORDER CONFIRMED",
      contact: "MAISON · CONTACT",
      policy: "MAISON · CARE",
    },
    "business-model": {
      home: "DEAL DASHBOARD",
      category: "DEAL DASHBOARD · CATALOG",
      pdp: "PRODUCT · SPEC SHEET",
      cart: "ORDER LEDGER",
      checkout: "ORDER LEDGER · STEP 1/2",
      success: "STATUS · PLACED",
      contact: "WHOLESALE INQUIRY",
      policy: "DEAL DASHBOARD · POLICY",
    },
    lifestyle: {
      home: "Welcome · Made for everyday",
      category: "Shop the catalog",
      pdp: "From the catalog",
      cart: "Your basket",
      checkout: "Step 1 of 2 · Almost there",
      success: "All set",
      contact: "Get in touch",
      policy: "Good to know",
    },
    "electronics-tech": {
      home: "VENDOR · CATALOG",
      category: "PRODUCT INDEX · ALL",
      pdp: "PRODUCT · SPEC",
      cart: "CART · ITEMS",
      checkout: "ORDER LOG · STEP 1/2",
      success: "ORDER · CONFIRMED",
      contact: "TECHNICAL SUPPORT",
      policy: "DOC.POL-001",
    },
    specialty: {
      home: "the studio",
      category: "from the makers",
      pdp: "from the same maker",
      cart: "the maker's basket",
      checkout: "letter · step 1 of 2",
      success: "order stamped",
      contact: "send a letter",
      policy: "from the studio",
    },
    default: {
      home: "Welcome",
      category: "Catalog",
      pdp: "Product",
      cart: "Cart",
      checkout: "Checkout",
      success: "Order placed",
      contact: "Contact",
      policy: "Policy",
    },
  };
  return map[family][page] ?? map.default[page] ?? "";
}

function familyTitle(family: Family, page: PageKey, name: string): string {
  const map: Record<Family, Partial<Record<PageKey, string>>> = {
    "fashion-beauty": {
      home: name,
      category: "All pieces",
      pdp: "—",
      cart: "Your Edit",
      checkout: "Where to send it",
      success: "Thank you",
      contact: "Say hello to our team",
      policy: "Customer care",
    },
    trust: {
      home: name,
      category: "The Collection",
      pdp: "—",
      cart: "Your Order",
      checkout: "Order Details",
      success: "Thank you for your order",
      contact: "Contact the Maison",
      policy: "Our Policies",
    },
    "business-model": {
      home: name,
      category: "Catalog & Deals",
      pdp: "—",
      cart: "Cart",
      checkout: "Shipping Details",
      success: "Order placed",
      contact: "Talk to sales",
      policy: "Policies",
    },
    lifestyle: {
      home: name,
      category: "All the good stuff",
      pdp: "—",
      cart: "Your basket",
      checkout: "Where to send it",
      success: "We've got your order!",
      contact: "Drop us a line",
      policy: "How we ship",
    },
    "electronics-tech": {
      home: name,
      category: "All products",
      pdp: "—",
      cart: "Shopping cart",
      checkout: "Shipping address",
      success: "Thanks — your order is in",
      contact: "Get in touch",
      policy: "Shipping & delivery",
    },
    specialty: {
      home: name,
      category: "Handcrafted",
      pdp: "—",
      cart: "Your collection",
      checkout: "Where to send it",
      success: "Thank you for supporting handcrafted goods",
      contact: "Say hello to the maker",
      policy: "How we ship",
    },
    default: {
      home: name,
      category: "สินค้าทั้งหมด",
      pdp: "—",
      cart: "ตะกร้าของคุณ",
      checkout: "ที่อยู่จัดส่ง",
      success: "ขอบคุณสำหรับคำสั่งซื้อ",
      contact: "ติดต่อร้านค้า",
      policy: "นโยบาย",
    },
  };
  return map[family][page] ?? name;
}

/* ──────────────────────────────────────────────────────────────
 * Tabs
 * ────────────────────────────────────────────────────────────── */

export function PreviewPagesTabs({
  active,
  onChange,
}: {
  active: PageKey;
  onChange: (k: PageKey) => void;
}) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 text-[11px]">
      {PAGE_TYPES.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.key)}
          className={`shrink-0 rounded-md border px-2 py-1 transition ${
            active === p.key
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Page mockup dispatch
 * ────────────────────────────────────────────────────────────── */

export function PageMockup({
  template,
  displayName,
  slug,
  page,
}: {
  template: Template | null;
  displayName: string;
  slug: string;
  page: PageKey;
}) {
  const family: Family = template?.id
    ? FAMILY_BY_TEMPLATE[template.id]
    : "default";
  const t = FAMILY_THEMES[family];
  const eyebrow = familyEyebrow(family, page);
  const title = familyTitle(family, page, displayName);
  const behavior: Behavior = template?.behavior ?? {};
  const headingFont =
    t.heading === "serif" ? t.serif : t.heading === "mono" ? t.mono : t.sans;

  const shell = (children: React.ReactNode) => (
    <div
      className="overflow-hidden"
      style={{ background: t.bg, color: t.ink, fontFamily: t.sans }}
    >
      <MockHeader t={t} family={family} displayName={displayName} slug={slug} />
      {children}
    </div>
  );

  switch (page) {
    case "home":
      return shell(<HomeMock t={t} family={family} behavior={behavior} eyebrow={eyebrow} title={title} headingFont={headingFont} />);
    case "category":
      return shell(<CategoryMock t={t} family={family} behavior={behavior} eyebrow={eyebrow} title={title} headingFont={headingFont} />);
    case "pdp":
      return shell(<PdpMock t={t} family={family} behavior={behavior} eyebrow={eyebrow} headingFont={headingFont} />);
    case "cart":
      return shell(<CartMock t={t} family={family} eyebrow={eyebrow} title={title} headingFont={headingFont} />);
    case "checkout":
      return shell(<CheckoutMock t={t} family={family} eyebrow={eyebrow} title={title} headingFont={headingFont} />);
    case "success":
      return shell(<SuccessMock t={t} family={family} eyebrow={eyebrow} title={title} headingFont={headingFont} />);
    case "contact":
      return shell(<ContactMock t={t} family={family} eyebrow={eyebrow} title={title} headingFont={headingFont} />);
    case "policy":
      return shell(<PolicyMock t={t} family={family} eyebrow={eyebrow} title={title} headingFont={headingFont} />);
  }
}

/* ──────────────────────────────────────────────────────────────
 * Shared bits
 * ────────────────────────────────────────────────────────────── */

function MockHeader({
  t,
  family,
  displayName,
  slug,
}: {
  t: FamilyTheme;
  family: Family;
  displayName: string;
  slug: string;
}) {
  const heading =
    t.heading === "serif" ? t.serif : t.heading === "mono" ? t.mono : t.sans;
  return (
    <div
      className="flex items-center justify-between border-b px-4 py-2.5"
      style={{ borderColor: t.border, background: t.surface }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-6 w-6 items-center justify-center text-[11px] font-semibold text-white"
          style={{
            background: t.primary,
            borderRadius: radiusPx(t.radius, "sm"),
          }}
        >
          {(displayName[0] ?? "?").toUpperCase()}
        </span>
        <span
          className="text-[12px] font-semibold"
          style={{
            color: t.ink,
            fontFamily: heading,
            ...(family === "trust" && { letterSpacing: "0.16em", textTransform: "uppercase" }),
            ...(family === "specialty" && { fontStyle: "italic" }),
          }}
        >
          {displayName}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px]" style={{ color: t.inkMuted }}>
        <span>หน้าแรก</span>
        <span>·</span>
        <span>หมวดหมู่</span>
        <span>·</span>
        <span>ติดต่อ</span>
      </div>
    </div>
  );
}

function Eyebrow({ t, family, children }: { t: FamilyTheme; family: Family; children: React.ReactNode }) {
  const isTrust = family === "trust";
  const isMono = family === "business-model" || family === "electronics-tech";
  const isHand = family === "specialty";
  return (
    <p
      className="text-[10px] font-semibold"
      style={{
        color: isTrust ? t.accent : t.inkMuted,
        letterSpacing: isTrust ? "0.28em" : isMono ? "0.16em" : "0.14em",
        textTransform: isHand ? "none" : "uppercase",
        fontFamily: isMono ? t.mono : isHand ? t.serif : undefined,
        fontStyle: isHand ? "italic" : undefined,
      }}
    >
      {children}
    </p>
  );
}

function Heading({
  t,
  family,
  font,
  children,
  className,
}: {
  t: FamilyTheme;
  family: Family;
  font: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={className ?? "mt-1 text-xl"}
      style={{
        color: t.ink,
        fontFamily: font,
        fontWeight: family === "fashion-beauty" || family === "trust" || family === "specialty" ? 500 : 700,
        letterSpacing: family === "trust" ? "-0.005em" : "-0.01em",
        lineHeight: 1.1,
      }}
    >
      {children}
    </h2>
  );
}

function Tile({ t, ratio = "1/1", color }: { t: FamilyTheme; ratio?: string; color?: string }) {
  return (
    <div
      style={{
        aspectRatio: ratio,
        background: color ?? t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: radiusPx(t.radius, "md"),
      }}
    />
  );
}

function PriceLine({ t, family }: { t: FamilyTheme; family: Family }) {
  const isMono = family === "business-model" || family === "electronics-tech";
  return (
    <p
      className="text-[10px] font-semibold"
      style={{
        color: t.primary,
        fontFamily: isMono ? t.mono : undefined,
      }}
    >
      ฿ 290
    </p>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Page mocks
 * ────────────────────────────────────────────────────────────── */

function HomeMock({
  t,
  family,
  behavior,
  eyebrow,
  title,
  headingFont,
}: {
  t: FamilyTheme;
  family: Family;
  behavior: Behavior;
  eyebrow: string;
  title: string;
  headingFont: string;
}) {
  // Reusable swatch palette (rose/yellow/sky/green/pink) for the swatch-row cue.
  const swatchColors = ["#fb7185", "#fbbf24", "#7dd3fc", "#86efac", "#f9a8d4"];

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Hero band */}
      <div
        className="relative px-3 py-3"
        style={{
          background:
            family === "fashion-beauty"
              ? t.accent
              : family === "trust"
                ? t.surface
                : family === "lifestyle"
                  ? "#e8dccc"
                  : family === "specialty"
                    ? "#e6d4ba"
                    : `linear-gradient(135deg, ${t.primary} 0%, ${t.accent} 100%)`,
          borderRadius: radiusPx(t.radius, "lg"),
          color: family === "trust" ? t.ink : "#ffffff",
        }}
      >
        <Eyebrow t={t} family={family}>
          {eyebrow}
        </Eyebrow>
        <h1
          className="mt-1 text-lg"
          style={{
            fontFamily: headingFont,
            color: family === "trust" || family === "lifestyle" || family === "specialty" ? t.ink : "#ffffff",
            fontWeight: family === "fashion-beauty" || family === "trust" || family === "specialty" ? 500 : 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
          }}
        >
          {title}
        </h1>
        {family === "trust" && (
          <div className="mt-1.5 h-px w-8" style={{ background: t.accent }} />
        )}
        {family === "business-model" && !behavior.countdownBanner && (
          <div className="mt-2 inline-flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ fontFamily: t.mono }}>
            FLASH · 02:34:17
          </div>
        )}
        {family === "specialty" && (
          <p className="mt-1 text-[10px] italic" style={{ fontFamily: t.serif, color: t.inkMuted }}>
            made by hand, sold with care
          </p>
        )}
        {/* behavior: liveBlock — red LIVE badge top-right */}
        {behavior.liveBlock && (
          <div
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white"
            style={{ fontFamily: t.mono }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
            LIVE
          </div>
        )}
      </div>

      {/* behavior: countdownBanner — red urgency stripe under hero */}
      {behavior.countdownBanner && (
        <div
          className="flex items-center justify-center gap-1 rounded px-2 py-1 text-[10px] font-bold text-white"
          style={{
            background: family === "business-model" ? t.primary : "#dc2626",
            borderRadius: radiusPx(t.radius, "sm"),
            fontFamily: t.mono,
          }}
        >
          <span>⏰</span>
          <span>02:34:17</span>
          <span style={{ opacity: 0.85 }}>· FLASH ENDS SOON</span>
        </div>
      )}

      {/* behavior: swatchRow — 5 color circles */}
      {behavior.swatchRow && (
        <div className="flex items-center gap-1.5">
          <span className="text-[9px]" style={{ color: t.inkMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Shades
          </span>
          {swatchColors.map((c) => (
            <span
              key={c}
              className="inline-block h-4 w-4 rounded-full border"
              style={{ background: c, borderColor: t.border }}
            />
          ))}
        </div>
      )}

      {/* behavior: replayCarousel — horizontal scroll strip of replay thumbs */}
      {behavior.replayCarousel && (
        <div className="space-y-1">
          <Eyebrow t={t} family={family}>REPLAYS</Eyebrow>
          <div className="flex gap-1.5 overflow-x-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="relative shrink-0"
                style={{
                  width: 56,
                  aspectRatio: "9/16",
                  background: `linear-gradient(135deg, ${t.primary} 0%, ${t.accent} 100%)`,
                  borderRadius: radiusPx(t.radius, "sm"),
                }}
              >
                <span
                  className="absolute inset-0 flex items-center justify-center text-[14px] text-white"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                >
                  ▶
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* behavior: storyBlock — italic story panel */}
      {behavior.storyBlock && (
        <div
          className="px-3 py-2"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderLeft: `2px solid ${t.accent}`,
            borderRadius: radiusPx(t.radius, "md"),
          }}
        >
          <p
            className="text-[10px] italic"
            style={{ color: t.ink, fontFamily: t.serif, lineHeight: 1.4 }}
          >
            &ldquo;A small studio with a big love for the craft — every piece tells a story.&rdquo;
          </p>
        </div>
      )}

      {/* behavior: compareBlock — 3-up comparison cards */}
      {behavior.compareBlock && (
        <div className="space-y-1">
          <Eyebrow t={t} family={family}>COMPARE</Eyebrow>
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-1.5"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: radiusPx(t.radius, "sm"),
                }}
              >
                <div
                  style={{
                    aspectRatio: "1/1",
                    background: t.bg,
                    border: `1px solid ${t.border}`,
                    borderRadius: radiusPx(t.radius, "sm"),
                  }}
                />
                <p
                  className="mt-1 text-[8px]"
                  style={{ color: t.inkMuted, fontFamily: t.mono }}
                >
                  Model {String.fromCharCode(65 + i)}
                </p>
                <p
                  className="text-[9px] font-semibold"
                  style={{ color: t.primary, fontFamily: t.mono }}
                >
                  ฿{(i + 1) * 990}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section eyebrow + grid (suppress if singleProductMode swaps it for a hero) */}
      {behavior.singleProductMode ? (
        <div className="space-y-1.5">
          <Eyebrow t={t} family={family}>FEATURED PRODUCT</Eyebrow>
          <div
            className="p-2"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: radiusPx(t.radius, "md"),
            }}
          >
            <Tile t={t} ratio="4/3" />
            <p
              className="mt-1.5 text-[11px] font-semibold"
              style={{ color: t.ink, fontFamily: headingFont }}
            >
              The Hero Product
            </p>
            <p
              className="text-[10px]"
              style={{ color: t.inkMuted }}
            >
              One product. Done right.
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p
                className="text-[12px] font-bold"
                style={{ color: t.primary, fontFamily: t.mono }}
              >
                ฿ 2,490
              </p>
              <div
                className="rounded px-2.5 py-1 text-[10px] font-semibold text-white"
                style={{ background: t.primary, borderRadius: radiusPx(t.radius, "lg") }}
              >
                ซื้อเลย
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Eyebrow t={t} family={family}>
            {behavior.videoFirstGrid ? "TRENDING VIDEOS" :
             behavior.sceneCards ? "Scenes for your space" :
             family === "fashion-beauty" ? "Most loved" :
             family === "trust" ? "FROM THE COLLECTION" :
             family === "business-model" ? "TODAY'S DEALS" :
             family === "lifestyle" ? "Loved by everyone" :
             family === "electronics-tech" ? "PRODUCT INDEX · LATEST" :
             family === "specialty" ? "from the atelier" :
             "Featured"}
          </Eyebrow>
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => {
              // behavior: videoFirstGrid — gradient tiles representing videos
              if (behavior.videoFirstGrid) {
                return (
                  <div key={i} className="space-y-0.5">
                    <div
                      className="relative"
                      style={{
                        aspectRatio: "9/16",
                        background: `linear-gradient(135deg, #a855f7 0%, #ec4899 100%)`,
                        borderRadius: radiusPx(t.radius, "md"),
                      }}
                    >
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[16px] text-white"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                      >
                        ▶
                      </span>
                    </div>
                    <p
                      className="line-clamp-1 text-[10px]"
                      style={{ color: t.ink }}
                    >
                      @creator{i + 1}
                    </p>
                  </div>
                );
              }
              // behavior: sceneCards — lifestyle imagery tiles
              if (behavior.sceneCards) {
                const sceneBgs = [
                  `linear-gradient(135deg, ${t.accent} 0%, #d4b896 100%)`,
                  `linear-gradient(135deg, #b8a48a 0%, ${t.primary} 100%)`,
                  `linear-gradient(135deg, #c9b896 0%, ${t.accent} 100%)`,
                ];
                return (
                  <div key={i} className="space-y-0.5">
                    <div
                      style={{
                        aspectRatio: "4/3",
                        background: sceneBgs[i],
                        borderRadius: radiusPx(t.radius, "md"),
                      }}
                    />
                    <p
                      className="line-clamp-1 text-[10px]"
                      style={{ color: t.ink }}
                    >
                      Living scene {i + 1}
                    </p>
                  </div>
                );
              }
              return (
                <div key={i} className="space-y-0.5">
                  <Tile t={t} ratio={family === "fashion-beauty" ? "4/5" : "1/1"} />
                  <p className="line-clamp-1 text-[10px]" style={{ color: t.ink, fontFamily: family === "specialty" ? t.serif : undefined }}>
                    Product {i + 1}
                  </p>
                  <PriceLine t={t} family={family} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryMock({ t, family, behavior: _behavior, eyebrow, title, headingFont }: { t: FamilyTheme; family: Family; behavior: Behavior; eyebrow: string; title: string; headingFont: string }) {
  const isFB = family === "fashion-beauty";
  const isLifestyle = family === "lifestyle";
  return (
    <div className="px-4 py-4 space-y-3">
      <div>
        <Eyebrow t={t} family={family}>{eyebrow}</Eyebrow>
        <Heading t={t} family={family} font={headingFont}>{title}</Heading>
        {family === "trust" && <div className="mt-1.5 h-px w-8" style={{ background: t.accent }} />}
        {isLifestyle && <div className="mt-1.5 h-1 w-12 rounded" style={{ background: t.accent }} />}
      </div>

      {/* Filter row — chips at top for FB/Lifestyle, sidebar otherwise */}
      {isFB || isLifestyle ? (
        <div className="flex flex-wrap gap-1.5">
          {["All", "Tops", "Bags", "Shoes", "More"].map((c) => (
            <span
              key={c}
              className="rounded-full border px-2 py-0.5 text-[10px]"
              style={{
                borderColor: t.border,
                background: c === "All" ? t.primary : "transparent",
                color: c === "All" ? "#fff" : t.inkMuted,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        {!isFB && !isLifestyle && (
          <div className="w-16 shrink-0 space-y-1">
            <Eyebrow t={t} family={family}>FILTER</Eyebrow>
            {["All", "New", "Sale", "Hot"].map((c) => (
              <p key={c} className="text-[9px]" style={{ color: t.inkMuted }}>· {c}</p>
            ))}
          </div>
        )}
        <div className={`grid flex-1 ${family === "business-model" || family === "electronics-tech" ? "grid-cols-3" : "grid-cols-2"} gap-1.5`}>
          {Array.from({ length: family === "business-model" || family === "electronics-tech" ? 6 : 4 }).map((_, i) => (
            <div key={i} className="space-y-0.5">
              <Tile t={t} ratio={isFB ? "4/5" : "1/1"} />
              <p className="line-clamp-1 text-[9px]" style={{ color: t.ink, fontFamily: family === "specialty" ? t.serif : undefined }}>Product {i + 1}</p>
              <PriceLine t={t} family={family} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PdpMock({ t, family, behavior, eyebrow, headingFont }: { t: FamilyTheme; family: Family; behavior: Behavior; eyebrow: string; headingFont: string }) {
  const isFB = family === "fashion-beauty";
  const isMono = family === "business-model" || family === "electronics-tech";
  return (
    <div className="relative px-4 py-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Tile t={t} ratio={isFB ? "4/5" : "1/1"} />
        <div className="space-y-1.5">
          <Eyebrow t={t} family={family}>{eyebrow}</Eyebrow>
          <Heading t={t} family={family} font={headingFont} className="text-base leading-tight">
            Featured product
          </Heading>

          {/* behavior: moqVisible — MOQ pill above price */}
          {behavior.moqVisible && (
            <div
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold"
              style={{
                background: t.surface,
                border: `1px solid ${t.accent}`,
                color: t.accent,
                fontFamily: t.mono,
              }}
            >
              ขั้นต่ำ 12 ชิ้น
            </div>
          )}

          <p className="text-[14px] font-bold" style={{ color: t.primary, fontFamily: isMono ? t.mono : undefined }}>
            ฿ 1,290
          </p>

          {/* behavior: pricingTiers — 3-row tier table */}
          {behavior.pricingTiers && (
            <div
              className="overflow-hidden"
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: radiusPx(t.radius, "sm"),
                fontFamily: t.mono,
              }}
            >
              <div
                className="grid grid-cols-3 px-1.5 py-1 text-[8px] font-semibold"
                style={{ background: t.surface, color: t.inkMuted, borderBottom: `1px solid ${t.border}` }}
              >
                <span>Qty</span>
                <span>Unit</span>
                <span>Save</span>
              </div>
              {[
                { q: "12+", u: "฿ 1,190", s: "8%" },
                { q: "50+", u: "฿ 1,090", s: "16%" },
                { q: "100+", u: "฿ 990", s: "23%" },
              ].map((row, i) => (
                <div
                  key={row.q}
                  className="grid grid-cols-3 px-1.5 py-1 text-[9px]"
                  style={{
                    color: t.ink,
                    borderTop: i === 0 ? "none" : `1px solid ${t.border}`,
                  }}
                >
                  <span>{row.q}</span>
                  <span>{row.u}</span>
                  <span style={{ color: t.accent }}>{row.s}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-1">
            {["S", "M", "L"].map((s) => (
              <span key={s} className="rounded-full border px-2 py-0.5 text-[9px]" style={{ borderColor: t.border, color: t.inkMuted }}>{s}</span>
            ))}
          </div>

          {/* behavior: compareBlock — compare row */}
          {behavior.compareBlock && (
            <div className="flex items-center justify-between gap-1 pt-1">
              <label className="flex items-center gap-1 text-[9px]" style={{ color: t.inkMuted }}>
                <span
                  className="inline-block h-2.5 w-2.5 border"
                  style={{ borderColor: t.inkMuted, borderRadius: 2 }}
                />
                เปรียบเทียบสินค้า
              </label>
              <span
                className="rounded-full px-1.5 py-0.5 text-[8px] font-semibold"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  color: t.primary,
                  fontFamily: t.mono,
                }}
              >
                Compare 0 ชิ้น
              </span>
            </div>
          )}

          <div className="rounded px-2 py-1.5 text-center text-[10px] font-semibold text-white" style={{ background: t.primary, borderRadius: radiusPx(t.radius, "lg") }}>
            ซื้อเลย
          </div>
        </div>
      </div>

      {/* Brand-story panel */}
      <div className="rounded p-2.5" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: radiusPx(t.radius, "md") }}>
        <Eyebrow t={t} family={family}>
          {family === "fashion-beauty" ? "From the boutique" : family === "trust" ? "MAISON · OUR HOUSE" : family === "specialty" ? "the maker" : family === "business-model" ? "WHOLESALE PARTNER" : family === "electronics-tech" ? "VENDOR" : "Our story"}
        </Eyebrow>
        <p className="mt-1 line-clamp-2 text-[10px]" style={{ color: t.ink, fontFamily: family === "fashion-beauty" || family === "specialty" || family === "trust" ? t.serif : undefined, fontStyle: family === "fashion-beauty" ? "italic" : undefined }}>
          Curated pieces from a small studio in Bangkok.
        </p>
      </div>

      {/* behavior: stickyCTA — sticky bottom bar showing buy-now button */}
      {behavior.stickyCTA === "buy-now" && (
        <div
          className="flex items-center justify-between gap-2 px-2 py-1.5"
          style={{
            background: t.surface,
            borderTop: `1px solid ${t.border}`,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
            margin: "8px -16px -16px -16px",
          }}
        >
          <div>
            <p className="text-[9px]" style={{ color: t.inkMuted }}>ราคา</p>
            <p
              className="text-[11px] font-bold"
              style={{ color: t.primary, fontFamily: isMono ? t.mono : undefined }}
            >
              ฿ 1,290
            </p>
          </div>
          <div
            className="flex-1 rounded px-3 py-1.5 text-center text-[10px] font-semibold text-white"
            style={{ background: t.primary, borderRadius: radiusPx(t.radius, "lg") }}
          >
            ซื้อเลย
          </div>
        </div>
      )}
    </div>
  );
}

function CartMock({ t, family, eyebrow, title, headingFont }: { t: FamilyTheme; family: Family; eyebrow: string; title: string; headingFont: string }) {
  const isMono = family === "business-model" || family === "electronics-tech";
  return (
    <div className="px-4 py-4 space-y-2.5">
      <div>
        <Eyebrow t={t} family={family}>{eyebrow}</Eyebrow>
        <Heading t={t} family={family} font={headingFont}>{title}</Heading>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div className="space-y-1.5">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2 rounded p-1.5" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: radiusPx(t.radius, "md") }}>
              <div style={{ width: 36, aspectRatio: family === "fashion-beauty" ? "4/5" : "1/1", background: t.bg, border: `1px solid ${t.border}`, borderRadius: radiusPx(t.radius, "sm"), flexShrink: 0 }} />
              <div className="flex-1 space-y-0.5">
                <p className="line-clamp-1 text-[10px]" style={{ color: t.ink, fontFamily: family === "fashion-beauty" || family === "specialty" || family === "trust" ? t.serif : undefined }}>Product name</p>
                <p className="text-[10px] font-semibold" style={{ color: t.primary, fontFamily: isMono ? t.mono : undefined }}>฿ 290</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: 84, background: family === "fashion-beauty" ? "#fef2f2" : t.surface, border: `1px solid ${family === "fashion-beauty" ? t.accent : t.border}`, borderRadius: radiusPx(t.radius, "md"), padding: 6 }}>
          <Eyebrow t={t} family={family}>SUMMARY</Eyebrow>
          <p className="mt-1 text-[9px]" style={{ color: t.inkMuted }}>Subtotal</p>
          <p className="text-[10px]" style={{ color: t.ink, fontFamily: isMono ? t.mono : undefined }}>฿ 580</p>
          <p className="mt-0.5 text-[9px]" style={{ color: t.inkMuted }}>Total</p>
          <p className="text-[12px] font-bold" style={{ color: t.primary, fontFamily: isMono ? t.mono : undefined }}>฿ 580</p>
          <div className="mt-1 rounded py-1 text-center text-[9px] font-semibold text-white" style={{ background: t.primary, borderRadius: radiusPx(t.radius, "lg") }}>
            Checkout
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutMock({ t, family, eyebrow, title, headingFont }: { t: FamilyTheme; family: Family; eyebrow: string; title: string; headingFont: string }) {
  return (
    <div className="px-4 py-4 space-y-2.5">
      <div className="text-center">
        <Eyebrow t={t} family={family}>{eyebrow}</Eyebrow>
        <Heading t={t} family={family} font={headingFont} className="mt-1 text-lg">{title}</Heading>
        {family === "trust" && <div className="mx-auto mt-1.5 h-px w-8" style={{ background: t.accent }} />}
      </div>
      <div className="space-y-1.5">
        {["Recipient name", "Phone", "Address", "City"].map((label) => (
          <div key={label}>
            <p className="text-[9px] font-medium" style={{ color: t.inkMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
            <div className="h-5 rounded" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: radiusPx(t.radius, "sm") }} />
          </div>
        ))}
      </div>
      <div className="rounded py-1.5 text-center text-[10px] font-semibold text-white" style={{ background: t.primary, borderRadius: radiusPx(t.radius, "lg") }}>
        Continue to payment
      </div>
    </div>
  );
}

function SuccessMock({ t, family, eyebrow, title, headingFont }: { t: FamilyTheme; family: Family; eyebrow: string; title: string; headingFont: string }) {
  const isFB = family === "fashion-beauty";
  return (
    <div className="px-4 py-5 text-center space-y-2.5">
      <div
        className="mx-auto inline-flex items-center justify-center text-white"
        style={{
          width: isFB ? 0 : 40,
          height: isFB ? 0 : 40,
          background: family === "trust" ? "transparent" : t.primary,
          border: family === "trust" ? `1px solid ${t.accent}` : "none",
          color: family === "trust" ? t.ink : "#ffffff",
          borderRadius: family === "trust" ? radiusPx(t.radius, "sm") : 999,
          display: isFB ? "none" : "inline-flex",
        }}
      >
        ✓
      </div>
      <div>
        <Eyebrow t={t} family={family}>{eyebrow}</Eyebrow>
        <Heading t={t} family={family} font={headingFont} className="mt-1 text-2xl">{title}</Heading>
        {family === "trust" && <div className="mx-auto mt-1.5 h-px w-8" style={{ background: t.accent }} />}
      </div>
      <p className="text-[10px]" style={{ color: t.inkMuted, fontFamily: isFB || family === "specialty" ? t.serif : undefined, fontStyle: isFB ? "italic" : undefined }}>
        We&rsquo;ve received your order — confirmation sent to your inbox.
      </p>
      <div
        className="mx-auto inline-flex items-center gap-1.5 px-3 py-1 text-[10px]"
        style={{ background: family === "fashion-beauty" ? "#fef2f2" : t.surface, border: `1px solid ${family === "fashion-beauty" ? t.accent : t.border}`, borderRadius: 999 }}
      >
        <span style={{ color: t.inkMuted, letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 8 }}>Order</span>
        <span style={{ color: t.ink, fontFamily: t.mono }}>ABCD1234</span>
      </div>
    </div>
  );
}

function ContactMock({ t, family, eyebrow, title, headingFont }: { t: FamilyTheme; family: Family; eyebrow: string; title: string; headingFont: string }) {
  return (
    <div className="px-4 py-4 space-y-2.5">
      <div className="text-center">
        <Eyebrow t={t} family={family}>{eyebrow}</Eyebrow>
        <Heading t={t} family={family} font={headingFont} className="mt-1 text-lg">{title}</Heading>
        {family === "trust" && <div className="mx-auto mt-1.5 h-px w-8" style={{ background: t.accent }} />}
      </div>
      <div className="space-y-1.5">
        {["Name", "Email", "Message"].map((label) => (
          <div key={label}>
            <p className="text-[9px] font-medium" style={{ color: t.inkMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
            <div className="rounded" style={{ height: label === "Message" ? 32 : 18, background: t.surface, border: `1px solid ${t.border}`, borderRadius: radiusPx(t.radius, "sm") }} />
          </div>
        ))}
      </div>
      <div className="rounded py-1.5 text-center text-[10px] font-semibold text-white" style={{ background: t.primary, borderRadius: radiusPx(t.radius, "lg") }}>
        Send message
      </div>
    </div>
  );
}

function PolicyMock({ t, family, eyebrow, title, headingFont }: { t: FamilyTheme; family: Family; eyebrow: string; title: string; headingFont: string }) {
  return (
    <div className="px-4 py-4 space-y-2.5">
      <div className="text-center">
        <Eyebrow t={t} family={family}>{eyebrow}</Eyebrow>
        <Heading t={t} family={family} font={headingFont} className="mt-1 text-lg">{title}</Heading>
        {family === "trust" && <div className="mx-auto mt-1.5 h-px w-8" style={{ background: t.accent }} />}
      </div>
      <div className="space-y-1.5">
        <div className="space-y-0.5">
          <h3 className="text-[11px] font-semibold" style={{ color: t.ink, fontFamily: family === "fashion-beauty" || family === "trust" || family === "specialty" ? t.serif : undefined }}>
            Shipping & Delivery
          </h3>
          <div className="h-1 w-full rounded" style={{ background: t.border }} />
          <div className="h-1 w-3/4 rounded" style={{ background: t.border }} />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-[11px] font-semibold" style={{ color: t.ink, fontFamily: family === "fashion-beauty" || family === "trust" || family === "specialty" ? t.serif : undefined }}>
            Returns & Exchanges
          </h3>
          <div className="h-1 w-full rounded" style={{ background: t.border }} />
          <div className="h-1 w-5/6 rounded" style={{ background: t.border }} />
          <div className="h-1 w-2/3 rounded" style={{ background: t.border }} />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Convenience wrapper — combines tabs + mockup + local state.
 * ────────────────────────────────────────────────────────────── */

export function MultiPagePreview({
  template,
  displayName,
  slug,
}: {
  template: Template | null;
  displayName: string;
  slug: string;
}) {
  const [active, setActive] = useState<PageKey>("home");
  return (
    <div className="space-y-2">
      <PreviewPagesTabs active={active} onChange={setActive} />
      <div
        className="overflow-hidden rounded-md border border-zinc-200 shadow-sm"
        style={{ minHeight: 400 }}
      >
        <PageMockup
          template={template}
          displayName={displayName}
          slug={slug}
          page={active}
        />
      </div>
    </div>
  );
}
