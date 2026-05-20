import type { StoreLandingContent } from "@prisma/client";
import {
  SHADCN_COLOR_TOKEN_MAP,
  type ColorOverrides,
  type FaqItem,
  type FeaturedTile,
  type Testimonial,
  type CtaBlock,
} from "./landing-content";

// Runtime helpers — consume `StoreLandingContent` rows in storefront layout
// + adapters. Read-side only; the inverse (form serialize → API payload)
// lives in `components/landing-editor/landing-content-form.tsx`.

/**
 * Convert the operator's color overrides into the CSS-var object that
 * the storefront root `<div style={{ ... }}>` consumes. Hex values are
 * emitted unchanged — modern browsers parse them just fine when the
 * shadcn component reads `var(--primary)`.
 */
export function landingContentCssVars(
  overrides: ColorOverrides | null | undefined,
): Record<string, string> {
  if (!overrides) return {};
  const out: Record<string, string> = {};
  for (const [token, value] of Object.entries(overrides)) {
    if (!value) continue;
    const cssVar = SHADCN_COLOR_TOKEN_MAP[token as keyof ColorOverrides];
    if (cssVar) out[cssVar] = value;
  }
  return out;
}

/** Build the `announcement` prop ShopHeader expects from a content row. */
export function landingContentAnnouncement(
  content: StoreLandingContent | null | undefined,
): { message: string; mobileMessage?: string } | null {
  if (!content || content.announcementEnabled === false) return null;
  const msg = content.announcementMessage?.trim();
  if (!msg) return null;
  const mobile = content.announcementMessageMobile?.trim();
  return mobile ? { message: msg, mobileMessage: mobile } : { message: msg };
}

/** Read repeatable JSON columns into typed arrays — no zod failures, just drops invalid rows. */
export function readFeaturedTiles(
  content: StoreLandingContent | null | undefined,
): FeaturedTile[] {
  return asArray<FeaturedTile>(content?.featuredTiles, (v) =>
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).imageUrl === "string" &&
    typeof (v as Record<string, unknown>).label === "string",
  );
}

export function readCtaBlocks(
  content: StoreLandingContent | null | undefined,
): CtaBlock[] {
  return asArray<CtaBlock>(content?.ctaBlocks, (v) =>
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).heading === "string",
  );
}

export function readFaqItems(
  content: StoreLandingContent | null | undefined,
): FaqItem[] {
  return asArray<FaqItem>(content?.faqItems, (v) =>
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).q === "string" &&
    typeof (v as Record<string, unknown>).a === "string",
  );
}

export function readTestimonials(
  content: StoreLandingContent | null | undefined,
): Testimonial[] {
  return asArray<Testimonial>(content?.testimonials, (v) =>
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).name === "string" &&
    typeof (v as Record<string, unknown>).quote === "string",
  );
}

function asArray<T>(raw: unknown, isValid: (v: unknown) => boolean): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValid) as T[];
}
