// Design families per Agent 01 v3 spec — 9 distinct visual identities.
// Used by: landing-form dropdown (admin theme hint), landing API validation,
// BlockRenderer theme tokens. Single source of truth so the values stay aligned.

export const DESIGN_FAMILIES = [
  {
    code: "A",
    label: "A · Editorial Minimal Warm",
    description: "premium furniture / lifestyle / candles · stone + amber",
    // Tan/amber accent — kept slightly cooler than the old #b8956a
    // so it doesn't muddy the cream background. Pairs well with
    // deep stone-800 for typography contrast.
    themeColor: "#a07a4f",
    accentHex: "#1c1917", // stone-900 — used for the dark CTA panel
    bgHex: "#f9f8f6", // soft cream, slightly warmer than stone-50
    textHex: "#292524", // stone-800
    cardHex: "#ffffff",
    // Body sans-serif by default; .theme-A in globals.css promotes
    // headings to font-serif (Playfair Display via Tailwind) for the
    // editorial feel without forcing the body to also flip serif.
    fontClass: "font-sans tracking-tight",
  },
  {
    code: "B",
    label: "B · Editorial Soft Feminine",
    description: "Korean fashion / jewelry / beauty · rose + brand serif",
    themeColor: "#831843",
    bgHex: "#fff1f2", // rose-50
    textHex: "#881337", // rose-900
    cardHex: "#ffffff",
    fontClass: "font-serif",
  },
  {
    code: "C",
    label: "C · Luxury Heritage Gold",
    description: "premium watches / handmade jewelry · black + gold",
    themeColor: "#D4AF37",
    bgHex: "#1c1917", // stone-900
    textHex: "#fffbeb", // amber-50
    cardHex: "#292524", // stone-800
    fontClass: "font-serif font-bold",
  },
  {
    code: "D",
    label: "D · Industrial Masculine",
    description: "men's leather / automotive / edgy fashion · pure black + zinc",
    themeColor: "#0a0a0a",
    bgHex: "#f4f4f5", // zinc-100
    textHex: "#18181b", // zinc-900
    cardHex: "#ffffff",
    fontClass: "font-sans font-bold uppercase tracking-tight",
  },
  {
    code: "E",
    label: "E · Cyberpunk Gaming Neon",
    description: "gaming gear / esports / electronics · purple + cyan neon",
    // Purple-600 primary + cyan-500 secondary glow over slate-950 base.
    // Layout reads `accentHex` and exposes it as --shop-accent so blocks
    // can reach for the cyan side of the gradient (CTAs, badges, hover).
    themeColor: "#7c3aed", // purple-600
    accentHex: "#06b6d4", // cyan-500
    bgHex: "#020617", // slate-950
    textHex: "#e2e8f0", // slate-200
    cardHex: "#0f172a", // slate-900
    fontClass: "font-sans font-extrabold tracking-wide",
  },
  {
    code: "F",
    label: "F · Sport Editorial Action",
    description: "athletic / running / fitness · blue + red + yellow",
    themeColor: "#1e3a8a",
    bgHex: "#eff6ff", // blue-50
    textHex: "#1e3a8a", // blue-900
    cardHex: "#ffffff",
    fontClass: "font-sans font-extrabold uppercase tracking-tight",
  },
  {
    code: "G",
    label: "G · Botanical Lifestyle Premium",
    description: "skincare / wellness / botanical · green + cream",
    themeColor: "#15803d",
    bgHex: "#fafaf9", // stone-50
    textHex: "#14532d", // green-900
    cardHex: "#ffffff",
    fontClass: "font-serif font-medium",
  },
  {
    code: "H",
    label: "H · Cozy Niche Skeumorphism",
    description: "coffee / handmade / cozy crafts · warm textured amber",
    themeColor: "#92400e",
    bgHex: "#fffbeb", // amber-50
    textHex: "#92400e", // amber-800
    cardHex: "#ffffff",
    fontClass: "font-sans font-medium",
  },
  {
    code: "I",
    label: "I · Playful Mass Commerce",
    description: "kids / toys / cute lifestyle · pink + yellow + blue",
    themeColor: "#ec4899",
    bgHex: "#fdf2f8", // pink-50
    textHex: "#1c1917", // stone-900
    cardHex: "#ffffff",
    fontClass: "font-sans font-medium tracking-tight",
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
