/**
 * ShopChromeTokens — visual variables a store can override per-tenant.
 * The chrome reads these and writes them onto the wrapper as CSS vars
 * so that nested page content (cart / category / product / wishlist)
 * cascades the same palette.
 *
 * Phase-1 surface covers everything needed to render every existing
 * storefront variant (caselnw, mini-mops, default) through the same
 * `ShopHeader` / `ShopFooter` pair — visual differences come from the
 * tokens, not separate components.
 */

export type ButtonShape = "rounded" | "pill" | "square";

export interface ShopChromeTokens {
  /** Hex accent for primary CTAs, links, focus rings, badges. */
  accent: string;
  /** Optional neutral ink hex (defaults to slate-900). */
  ink?: string;
  /** Optional page background hex (defaults to slate-50). */
  bg?: string;
  /** Glyph rendered next to the store name in header/footer.
   *  Falls back to the first letter of the store name. */
  decorationGlyph?: string | null;
  /** Optional announcement bar above the header. `null` = hide. */
  announcement?: {
    message: string;
    /** Shorter copy used at sm- breakpoint; falls back to message. */
    mobileMessage?: string;
  } | null;
  /** CTA button radius preset. */
  buttonShape?: ButtonShape;
  /** Glyph background style — "filled" (caselnw, slate-on-accent) or
   *  "tinted" (mini-mops, accent on tint of itself). */
  glyphStyle?: "filled" | "tinted";
}

export interface ShopChromePreset {
  /** Optional class name added to the wrapper for body skin overrides. */
  themeClass?: string;
  tokens: ShopChromeTokens;
}

const PRESET_DEFAULT: ShopChromePreset = {
  tokens: {
    accent: "#0f172a",
    ink: "#0f172a",
    bg: "#f8fafc",
    decorationGlyph: null,
    announcement: null,
    buttonShape: "rounded",
    glyphStyle: "filled",
  },
};

const PRESET_CASELNW: ShopChromePreset = {
  themeClass: "theme-caselnw",
  tokens: {
    accent: "#f97316",
    ink: "#0f172a",
    bg: "#f8fafc",
    decorationGlyph: "◉",
    announcement: {
      message: "ส่งฟรีเมื่อช้อปครบ ฿499 · ส่งเร็ว 1-2 วันทำการ",
      mobileMessage: "ส่งฟรีครบ ฿499",
    },
    buttonShape: "rounded",
    glyphStyle: "filled",
  },
};

const PRESET_MINI_MOPS: ShopChromePreset = {
  themeClass: "theme-mini-mops",
  tokens: {
    accent: "#10b981",
    ink: "#1f2937",
    bg: "#f9fafb",
    decorationGlyph: "✨",
    announcement: null,
    buttonShape: "pill",
    glyphStyle: "tinted",
  },
};

const PRESET_MU_WALLPAPER: ShopChromePreset = {
  themeClass: "theme-mu-wallpaper",
  tokens: {
    accent: "#e9cd84", // brand gold
    ink: "#f4f1ea",
    bg: "#0b0918",
    decorationGlyph: "✦",
    announcement: {
      message: "ปลุกเสกตามฤกษ์ · พรีวิวก่อนได้ทุกลาย · ซื้อแล้วดาวน์โหลดไฟล์เต็มทันที ไม่มีลายน้ำ",
      mobileMessage: "พรีวิวก่อน · ดาวน์โหลดไฟล์เต็มทันที",
    },
    buttonShape: "pill",
    glyphStyle: "filled",
  },
};

const PRESETS: Record<string, ShopChromePreset> = {
  "caselnw-v1": PRESET_CASELNW,
  "mini-mops-v1": PRESET_MINI_MOPS,
  "mu-wallpaper-v1": PRESET_MU_WALLPAPER,
};

/**
 * Map AI-multi-page design families (A-I) to chrome presets. Each
 * family already has a curated palette in `lib/landing/families.ts`;
 * we read it dynamically (caller passes the resolved family) to avoid
 * importing from this file into globals.css cycle territory.
 */
export interface FamilyTokensInput {
  themeColor: string;
  accentHex?: string;
  bgHex?: string;
  textHex?: string;
}
const FAMILY_GLYPHS: Record<string, string | null> = {
  A: null, // editorial minimal — store initial
  B: "❀", // rose flower
  C: "◆", // gold diamond
  D: "▣", // industrial square
  E: "◇", // cyber diamond
  F: "▶", // sport action
  G: "🌿", // botanical leaf
  H: "☕", // cozy coffee
  I: "✿", // playful flower
};
const FAMILY_BUTTON_SHAPE: Record<string, ButtonShape> = {
  A: "rounded",
  B: "rounded",
  C: "square",
  D: "square",
  E: "rounded",
  F: "square",
  G: "pill",
  H: "rounded",
  I: "pill",
};
export function presetForFamily(
  code: string,
  family: FamilyTokensInput,
): ShopChromePreset {
  return {
    themeClass: `theme-${code}`,
    tokens: {
      accent: family.themeColor,
      ink: family.textHex ?? "#1f2937",
      bg: family.bgHex ?? "#f8fafc",
      decorationGlyph: FAMILY_GLYPHS[code] ?? null,
      announcement: null,
      buttonShape: FAMILY_BUTTON_SHAPE[code] ?? "rounded",
      glyphStyle: code === "C" || code === "D" ? "filled" : "tinted",
    },
  };
}

/**
 * Resolve final tokens for a store. `templateId` looks up a preset;
 * any explicit `override` (e.g. accentHex from the schema) wins; the
 * store's own primaryColor is the next fallback for `accent`.
 */
export function resolveChromeTokens(opts: {
  templateId?: string | null;
  primaryColor?: string | null;
  override?: Partial<ShopChromeTokens>;
}): { tokens: Required<Omit<ShopChromeTokens, "decorationGlyph" | "announcement">> & {
  decorationGlyph: string | null;
  announcement: ShopChromeTokens["announcement"];
}; themeClass?: string } {
  const preset = (opts.templateId && PRESETS[opts.templateId]) || PRESET_DEFAULT;
  const t = preset.tokens;
  return {
    themeClass: preset.themeClass,
    tokens: {
      accent:
        opts.override?.accent ?? opts.primaryColor ?? t.accent,
      ink: opts.override?.ink ?? t.ink ?? "#0f172a",
      bg: opts.override?.bg ?? t.bg ?? "#f8fafc",
      decorationGlyph:
        opts.override?.decorationGlyph !== undefined
          ? opts.override.decorationGlyph
          : t.decorationGlyph ?? null,
      announcement:
        opts.override?.announcement !== undefined
          ? opts.override.announcement
          : t.announcement ?? null,
      buttonShape: opts.override?.buttonShape ?? t.buttonShape ?? "rounded",
      glyphStyle: opts.override?.glyphStyle ?? t.glyphStyle ?? "filled",
    },
  };
}

/**
 * CSS variables emitted on the chrome wrapper. Existing storefront
 * pages reference --shop-primary / --shop-bg / --shop-card / etc., so
 * we keep the same names — that means cart, product, category, etc.
 * inherit the new chrome's palette without any per-page change.
 */
export function tokensToCssVars(tokens: {
  accent: string;
  ink: string;
  bg: string;
}): React.CSSProperties {
  return {
    ["--shop-primary" as string]: tokens.accent,
    ["--shop-accent" as string]: tokens.accent,
    ["--shop-bg" as string]: tokens.bg,
    ["--shop-card" as string]: "#ffffff",
    ["--shop-ink" as string]: tokens.ink,
    ["--shop-ink-muted" as string]: `color-mix(in srgb, ${tokens.ink} 60%, transparent)`,
    ["--shop-border" as string]: `color-mix(in srgb, ${tokens.ink} 12%, transparent)`,
  } as React.CSSProperties;
}

/** Tailwind class for a CTA button radius given the token preset. */
export function buttonRadiusClass(shape: ButtonShape): string {
  switch (shape) {
    case "pill":
      return "rounded-full";
    case "square":
      return "rounded-md";
    case "rounded":
    default:
      return "rounded-xl";
  }
}
