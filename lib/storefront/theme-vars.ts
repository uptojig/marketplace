/**
 * theme-vars — canonical theme COLORS for a content themeKey, sourced from the
 * SAME `lib/landing/*CssVars()` functions the storefront chrome applies. The
 * wizard preview imports this so its colors can never drift from the published
 * store again. (Previously app/create-store/_components/preview-pages.tsx kept a
 * hand-maintained color table that had drifted on trust / lifestyle / specialty
 * / electronics-tech, and mis-mapped community → default.)
 *
 * Only COLORS live here. Fonts / radius / CTA shape are still approximated by
 * the preview and are fully defined by the `.theme-*` classes in globals.css on
 * the real storefront. `everyday` has no JS token source — its colors live only
 * in globals.css `.theme-everyday` — so the canonical JS copy is defined here.
 *
 * Client-safe: every imported `*CssVars()` is a pure function over in-module
 * constants (no prisma / server-only imports), so this can be used from the
 * wizard preview (a client component).
 */
import type { ThemeKey } from "./resolve-store-theme";
import { trustCssVars } from "@/lib/landing/trust";
import { fashionBeautyCssVars } from "@/lib/landing/fashion-beauty";
import { businessModelCssVars } from "@/lib/landing/business-model";
import { lifestyleCssVars } from "@/lib/landing/lifestyle";
import { electronicsTechCssVars } from "@/lib/landing/electronics-tech";
import { specialtyCssVars } from "@/lib/landing/specialty";
import { communityCssVars } from "@/lib/landing/community";
import { taobaoCssVars } from "@/lib/landing/taobao";
import { packagingCssVars } from "@/lib/landing/packaging";

export interface ThemeColors {
  bg: string;
  surface: string;
  primary: string;
  accent: string;
  ink: string;
  inkMuted: string;
  border: string;
}

const DEFAULT_COLORS: ThemeColors = {
  bg: "#ffffff",
  surface: "#fafafa",
  primary: "#0a0a0a",
  accent: "#71717a",
  ink: "#0a0a0a",
  inkMuted: "#71717a",
  border: "#e4e4e7",
};

// everyday has no `*CssVars()` (lib/landing/everyday.ts only exports the body
// class); these mirror globals.css `.theme-everyday`.
const EVERYDAY_COLORS: ThemeColors = {
  bg: "#FAFAFA",
  surface: "#ffffff",
  primary: "#DC2626",
  accent: "#0A0A0A",
  ink: "#0A0A0A",
  inkMuted: "#737373",
  border: "#E5E5E5",
};

/**
 * Flatten a `*CssVars()` `--shop-*` record into ThemeColors. Families expose the
 * card surface as either `--shop-card` (the typed families) or `--shop-bg-soft`
 * (community / taobao / packaging).
 */
function fromCssVars(v: Record<string, string>): ThemeColors {
  return {
    bg: v["--shop-bg"] ?? DEFAULT_COLORS.bg,
    surface: v["--shop-card"] ?? v["--shop-bg-soft"] ?? DEFAULT_COLORS.surface,
    primary: v["--shop-primary"] ?? DEFAULT_COLORS.primary,
    accent: v["--shop-accent"] ?? DEFAULT_COLORS.accent,
    ink: v["--shop-ink"] ?? DEFAULT_COLORS.ink,
    inkMuted: v["--shop-ink-muted"] ?? DEFAULT_COLORS.inkMuted,
    border: v["--shop-border"] ?? DEFAULT_COLORS.border,
  };
}

const HEX6 = /^#[0-9a-fA-F]{6}$/;

/**
 * Canonical colors for a content themeKey. `accentOverride` mirrors
 * resolveChromeTheme: a valid hex repaints primary + accent (the storefront's
 * `themeAccentOverride` behavior). `paletteId` is deliberately NOT applied —
 * curated themes keep their own colors (see the minimop24 red→purple regression
 * note in resolve-store-theme.ts).
 */
export function themeColorsFor(
  themeKey: ThemeKey,
  accentOverride?: string | null,
): ThemeColors {
  let base: ThemeColors;
  switch (themeKey) {
    case "fashion-beauty":
      base = fromCssVars(fashionBeautyCssVars());
      break;
    case "trust":
      base = fromCssVars(trustCssVars());
      break;
    case "business-model":
      base = fromCssVars(businessModelCssVars());
      break;
    case "lifestyle":
      base = fromCssVars(lifestyleCssVars());
      break;
    case "electronics-tech":
      base = fromCssVars(electronicsTechCssVars());
      break;
    case "specialty":
      base = fromCssVars(specialtyCssVars());
      break;
    case "community":
      base = fromCssVars(communityCssVars());
      break;
    case "taobao":
      base = fromCssVars(taobaoCssVars());
      break;
    case "packaging":
      base = fromCssVars(packagingCssVars());
      break;
    case "everyday":
      base = EVERYDAY_COLORS;
      break;
    default:
      // pet-house / case-studio (slug singletons, no preview family) + default
      base = DEFAULT_COLORS;
      break;
  }
  if (accentOverride && HEX6.test(accentOverride)) {
    return { ...base, primary: accentOverride, accent: accentOverride };
  }
  return base;
}
