import { z } from "zod";
import { uiConfigSchema } from "./ui-config";

// Editable storefront content (`StoreLandingContent`) — validation schemas
// shared between the admin PATCH endpoint, the vendor self-serve endpoint,
// the seed script, and the chrome adapters that read these slots at render.
//
// All fields are nullable / optional: adapters fall back to template defaults
// when a slot is empty, so a store can ship with only its hero filled in and
// still render cleanly. Every JSON column is validated through a Zod array so
// admin/vendor edits can never leave the DB in a shape the adapters don't
// expect (e.g. a featured tile missing imageUrl).

// ─── Primitives ────────────────────────────────────────────────────────────

const optionalString = (max: number) =>
  z.string().max(max).nullable().optional();

const optionalUrl = z
  .string()
  .max(2048)
  .refine(
    (v) =>
      !v ||
      v.startsWith("/") ||
      v.startsWith("http://") ||
      v.startsWith("https://") ||
      v.startsWith("data:image"),
    { message: "Must be an absolute URL, relative path, or data: image" },
  )
  .nullable()
  .optional();

const hexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    message: "Must be a #RGB / #RRGGBB / #RRGGBBAA hex color",
  });

// ─── Repeatable shapes (stored as JSONB) ──────────────────────────────────

export const featuredTileSchema = z.object({
  imageUrl: z.string().min(1).max(2048),
  label: z.string().max(80),
  href: z.string().max(2048).optional(),
  eyebrow: z.string().max(40).optional(),
});
export type FeaturedTile = z.infer<typeof featuredTileSchema>;

export const ctaBlockSchema = z.object({
  heading: z.string().max(120),
  body: z.string().max(500).optional(),
  ctaLabel: z.string().max(60).optional(),
  ctaUrl: z.string().max(2048).optional(),
  imageUrl: z.string().max(2048).optional(),
});
export type CtaBlock = z.infer<typeof ctaBlockSchema>;

export const faqItemSchema = z.object({
  q: z.string().min(1).max(200),
  a: z.string().min(1).max(2000),
});
export type FaqItem = z.infer<typeof faqItemSchema>;

export const testimonialSchema = z.object({
  name: z.string().min(1).max(80),
  role: z.string().max(80).optional(),
  photoUrl: z.string().max(2048).optional(),
  quote: z.string().min(1).max(500),
  rating: z.number().min(0).max(5).optional(),
});
export type Testimonial = z.infer<typeof testimonialSchema>;

// Mirrors shadcn/ui's semantic token vocabulary (`--primary`, `--accent`,
// etc) so an operator's override propagates to every shadcn-built block on
// the storefront — buttons, cards, badges, inputs — without per-component
// wiring. The runtime renderer translates this object into a `style="--primary:
// ...; --accent: ..."` block on the storefront root.
export const colorOverridesSchema = z
  .object({
    // shadcn semantic tokens — set as hex (`#0a0a0a`); the renderer converts
    // to the HSL space shadcn variables expect.
    primary: hexColor.optional(),
    primaryForeground: hexColor.optional(),
    secondary: hexColor.optional(),
    secondaryForeground: hexColor.optional(),
    accent: hexColor.optional(),
    accentForeground: hexColor.optional(),
    background: hexColor.optional(),
    foreground: hexColor.optional(),
    muted: hexColor.optional(),
    mutedForeground: hexColor.optional(),
    border: hexColor.optional(),
    ring: hexColor.optional(),
    destructive: hexColor.optional(),
    destructiveForeground: hexColor.optional(),
  })
  .strict();
export type ColorOverrides = z.infer<typeof colorOverridesSchema>;

/** shadcn token → CSS variable name (consumed by the storefront root <style>). */
export const SHADCN_COLOR_TOKEN_MAP: Record<keyof ColorOverrides, string> = {
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  background: "--background",
  foreground: "--foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  border: "--border",
  ring: "--ring",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
};

// ─── Top-level schema ─────────────────────────────────────────────────────

export const landingContentSchema = z.object({
  // Hero
  heroHeadline: optionalString(120),
  heroSubheadline: optionalString(300),
  heroCtaLabel: optionalString(60),
  heroCtaUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  heroVideoUrl: optionalUrl,
  heroAlignment: z
    .enum(["left", "center", "right"])
    .nullable()
    .optional(),

  // Announcement
  announcementMessage: optionalString(200),
  announcementMessageMobile: optionalString(120),
  announcementLinkUrl: optionalUrl,
  announcementEnabled: z.boolean().optional(),

  // About
  aboutHeading: optionalString(120),
  aboutBody: optionalString(5000),
  aboutImageUrl: optionalUrl,
  aboutVideoUrl: optionalUrl,

  // Repeatables — accept null to clear, array to replace
  featuredTiles: z.array(featuredTileSchema).max(12).nullable().optional(),
  ctaBlocks: z.array(ctaBlockSchema).max(6).nullable().optional(),
  faqItems: z.array(faqItemSchema).max(30).nullable().optional(),
  testimonials: z.array(testimonialSchema).max(20).nullable().optional(),

  // Colors
  colorOverrides: colorOverridesSchema.nullable().optional(),

  // Bespoke per-template overflow
  extras: z.record(z.unknown()).nullable().optional(),

  // Server-driven UI config (full shape validated by `uiConfigSchema`).
  // Pass `null` to clear back to the legacy family-detector path; omit
  // entirely (undefined) to leave the column untouched.
  uiConfig: uiConfigSchema.nullable().optional(),
});

export type LandingContentInput = z.infer<typeof landingContentSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Merge a stored row with template defaults for read-side consumption.
 * Adapters consume the merged object so they never see `null` — they
 * either get the operator's value or the template's fallback.
 */
export function mergeWithDefaults<T extends Record<string, unknown>>(
  stored: T | null | undefined,
  defaults: Partial<T>,
): T {
  if (!stored) return defaults as T;
  const out: Record<string, unknown> = { ...defaults };
  for (const [k, v] of Object.entries(stored)) {
    if (v !== null && v !== undefined) out[k] = v;
  }
  return out as T;
}

/**
 * Coerce raw JSON columns (which Prisma returns as `JsonValue`) back to
 * their typed shapes. Used by both the read path (adapter rendering) and
 * the editor form's "load initial values".
 */
export function readRepeatable<T>(
  raw: unknown,
  schema: z.ZodType<T>,
): T[] {
  if (!Array.isArray(raw)) return [];
  const out: T[] = [];
  for (const row of raw) {
    const parsed = schema.safeParse(row);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}
