// Design families per Agent 01 v3 spec — 9 distinct visual identities.
// Used by: landing-form dropdown (admin theme hint), landing API validation,
// BlockRenderer theme tokens. Single source of truth so the values stay aligned.

export const DESIGN_FAMILIES = [
  {
    code: "A",
    label: "A · Editorial Minimal Warm",
    description: "premium furniture / lifestyle / candles · stone + amber",
    themeColor: "#b8956a",
  },
  {
    code: "B",
    label: "B · Editorial Soft Feminine",
    description: "Korean fashion / jewelry / beauty · rose + brand serif",
    themeColor: "#831843",
  },
  {
    code: "C",
    label: "C · Luxury Heritage Gold",
    description: "premium watches / handmade jewelry · black + gold",
    themeColor: "#D4AF37",
  },
  {
    code: "D",
    label: "D · Industrial Masculine",
    description: "men's leather / automotive / edgy fashion · pure black + zinc",
    themeColor: "#0a0a0a",
  },
  {
    code: "E",
    label: "E · Cyberpunk Gaming Neon",
    description: "gaming gear / esports / electronics · purple + green neon",
    themeColor: "#a855f7",
  },
  {
    code: "F",
    label: "F · Sport Editorial Action",
    description: "athletic / running / fitness · blue + red + yellow",
    themeColor: "#1e3a8a",
  },
  {
    code: "G",
    label: "G · Botanical Lifestyle Premium",
    description: "skincare / wellness / botanical · green + cream",
    themeColor: "#15803d",
  },
  {
    code: "H",
    label: "H · Cozy Niche Skeumorphism",
    description: "coffee / handmade / cozy crafts · warm textured amber",
    themeColor: "#92400e",
  },
  {
    code: "I",
    label: "I · Playful Mass Commerce",
    description: "kids / toys / cute lifestyle · pink + yellow + blue",
    themeColor: "#ec4899",
  },
] as const;

export type DesignFamilyCode = (typeof DESIGN_FAMILIES)[number]["code"];

export const DESIGN_FAMILY_CODES = DESIGN_FAMILIES.map((f) => f.code) as readonly DesignFamilyCode[];

// Legacy values still persisted on existing stores. Both map to a default
// renderable family so old data keeps working without migration.
export const LEGACY_THEME_VARIANTS = ["minimal", "cute"] as const;
export type LegacyThemeVariant = (typeof LEGACY_THEME_VARIANTS)[number];

// Map legacy values to the closest design family so the storefront's
// color cascade still works without forcing a row migration.
//   "minimal" → A (Editorial Minimal Warm — neutral stone+amber)
//   "cute"    → I (Playful Mass Commerce — pink-forward)
// This is consulted by storefront layouts that need a primary accent;
// the LegacyThemeVariant value itself is preserved on the row so the
// admin picker (which lists legacy options separately) keeps showing
// the operator's original choice.
export const LEGACY_TO_FAMILY: Record<LegacyThemeVariant, DesignFamilyCode> = {
  minimal: "A",
  cute: "I",
} as const;

export type ThemeVariant = DesignFamilyCode | LegacyThemeVariant;

export function isDesignFamilyCode(value: string): value is DesignFamilyCode {
  return (DESIGN_FAMILY_CODES as readonly string[]).includes(value);
}

export function isLegacyThemeVariant(value: string): value is LegacyThemeVariant {
  return (LEGACY_THEME_VARIANTS as readonly string[]).includes(value);
}

export function isValidThemeVariant(value: string): value is ThemeVariant {
  return isDesignFamilyCode(value) || isLegacyThemeVariant(value);
}

/**
 * Resolve a stored landingThemeVariant value to its DESIGN_FAMILIES entry.
 * Returns undefined if the value isn't recognised — callers should fall
 * through to store.primaryColor / brand default in that case.
 */
export function resolveFamily(
  variant: string | null | undefined,
): (typeof DESIGN_FAMILIES)[number] | undefined {
  if (!variant) return undefined;
  if (isDesignFamilyCode(variant)) {
    return DESIGN_FAMILIES.find((f) => f.code === variant);
  }
  if (isLegacyThemeVariant(variant)) {
    const code = LEGACY_TO_FAMILY[variant];
    return DESIGN_FAMILIES.find((f) => f.code === code);
  }
  return undefined;
}
