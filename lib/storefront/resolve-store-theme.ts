/**
 * resolve-store-theme — single source of truth for "which theme does this
 * store render with?". Replaces the per-family `isXStore` cascades that were
 * copy-pasted across app/stores/[slug]/page.tsx, layout.tsx, and every
 * per-route page.
 *
 * IMPORTANT (Phase 1 = zero behavior change): this module reproduces the two
 * PRE-EXISTING cascades EXACTLY, including their quirks. They genuinely differ:
 *
 *   • CONTENT (page.tsx → which Homepage component): checks the pet-house /
 *     case-studio singletons FIRST (by slug/templateId/variant on the raw
 *     store), THEN the family ladder using effectiveTemplateId(store) (so the
 *     legacy slug→templateId fallback applies), and INCLUDES the `everyday`
 *     family.
 *
 *   • CHROME (layout.tsx → ShopHeader/Footer skin class + CSS vars + accent +
 *     button shape): NO singletons, uses the RAW store.templateId (no
 *     effectiveTemplateId), and does NOT include `everyday`.
 *
 * Consequence preserved on purpose: a store can have a different CONTENT theme
 * than CHROME theme. Real example: `fluffyhouse` renders PetHouseHomepage
 * (content = pet-house) but lifestyle chrome (templateId `home-living` → the
 * chrome ladder picks lifestyle); `casethep` renders CaseStudioHomepage but
 * gets default chrome. Unifying these is a deliberate later change, not Phase 1.
 */

import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import {
  isFashionBeautyStore,
  fashionBeautyCssVars,
  FASHION_BEAUTY_BODY_CLASS,
} from "@/lib/landing/fashion-beauty";
import {
  isTrustStore,
  trustCssVars,
  TRUST_BODY_CLASS,
  TRUST_TOKENS,
} from "@/lib/landing/trust";
import {
  isBusinessModelStore,
  businessModelCssVars,
  BUSINESS_MODEL_BODY_CLASS,
  BUSINESS_MODEL_TOKENS,
} from "@/lib/landing/business-model";
import {
  isLifestyleStore,
  lifestyleCssVars,
  LIFESTYLE_BODY_CLASS,
  LIFESTYLE_TOKENS,
} from "@/lib/landing/lifestyle";
import {
  isElectronicsTechStore,
  electronicsTechCssVars,
  ELECTRONICS_TECH_BODY_CLASS,
  ELECTRONICS_TECH_TOKENS,
} from "@/lib/landing/electronics-tech";
import {
  isSpecialtyStore,
  specialtyCssVars,
  SPECIALTY_BODY_CLASS,
} from "@/lib/landing/specialty";
import {
  isPackagingStore,
  packagingCssVars,
  PACKAGING_BODY_CLASS,
} from "@/lib/landing/packaging";
import {
  isTaobaoStore,
  taobaoCssVars,
  TAOBAO_BODY_CLASS,
} from "@/lib/landing/taobao";
import {
  isCommunityStore,
  communityCssVars,
  COMMUNITY_BODY_CLASS,
} from "@/lib/landing/community";
import { isEverydayStore } from "@/lib/landing/everyday";
import { isPetHouseStore } from "@/lib/landing/pet-house";
import { isCaseStudioStore } from "@/lib/landing/case-studio";

export type ThemeKey =
  | "fashion-beauty"
  | "trust"
  | "business-model"
  | "lifestyle"
  | "electronics-tech"
  | "specialty"
  | "everyday"
  | "taobao"
  | "packaging"
  | "community"
  | "pet-house"
  | "case-studio"
  | "default";

/** Minimal store shape every theme decision is keyed off. `Store` satisfies it. */
export interface ThemeInput {
  slug: string;
  templateId: string | null;
  landingThemeVariant: string | null;
  /**
   * Operator's INTENTIONAL accent override (hex). null/absent = use the theme's
   * curated color. Deliberately NOT derived from the wizard `paletteId` (which
   * must not silently repaint a curated theme — see the minimop24 red->purple
   * regression). Only the editor sets this.
   */
  themeAccentOverride?: string | null;
}

export interface ChromeTheme {
  /** Family that paints the chrome (NO singletons, NO everyday). */
  chromeKey: ThemeKey;
  /** Body class for the `.shop-page` wrapper, e.g. "theme-fashion-beauty"; "" for default. */
  familyClass: string;
  /** --shop-* CSS-var overrides for the active family; {} for default. */
  familyVars: Record<string, string>;
  /** Accent for ShopHeader/Footer links + glyphs; null = use chrome-token default. */
  familyAccent: string | null;
  /** Button shape pinned per family; null = use per-template default. */
  familyButtonShape: "pill" | "square" | null;
}

export interface StoreTheme {
  /** Content theme — selects the homepage component in page.tsx. */
  themeKey: ThemeKey;
  /** Chrome theme — selects skin class + tokens in layout.tsx. */
  chrome: ChromeTheme;
}

/**
 * CHROME ladder — now uses effectiveTemplateId() to match content resolution.
 * Family-only (no singletons, no everyday), FB-wins precedence.
 */
export function resolveChromeTheme(store: ThemeInput): ChromeTheme {
  const key = {
    templateId: effectiveTemplateId(store),
    landingThemeVariant: store.landingThemeVariant,
  };

  let chromeKey: ThemeKey = "default";
  if (isFashionBeautyStore(key)) chromeKey = "fashion-beauty";
  else if (isTrustStore(key)) chromeKey = "trust";
  else if (isBusinessModelStore(key)) chromeKey = "business-model";
  else if (isLifestyleStore(key)) chromeKey = "lifestyle";
  else if (isElectronicsTechStore(key)) chromeKey = "electronics-tech";
  else if (isSpecialtyStore(key)) chromeKey = "specialty";
  else if (isPackagingStore(key)) chromeKey = "packaging";
  else if (isTaobaoStore(key)) chromeKey = "taobao";
  else if (isCommunityStore(key)) chromeKey = "community";

  let familyClass = "";
  let familyVars: Record<string, string> = {};
  let familyAccent: string | null = null;
  let familyButtonShape: "pill" | "square" | null = null;

  switch (chromeKey) {
    case "fashion-beauty":
      familyClass = FASHION_BEAUTY_BODY_CLASS;
      familyVars = fashionBeautyCssVars();
      familyAccent = "#f43f5e";
      familyButtonShape = "pill";
      break;
    case "trust":
      familyClass = TRUST_BODY_CLASS;
      familyVars = trustCssVars();
      familyAccent = TRUST_TOKENS.colors.accent;
      familyButtonShape = "square";
      break;
    case "business-model":
      familyClass = BUSINESS_MODEL_BODY_CLASS;
      familyVars = businessModelCssVars();
      familyAccent = BUSINESS_MODEL_TOKENS.colors.accent;
      familyButtonShape = "square";
      break;
    case "lifestyle":
      familyClass = LIFESTYLE_BODY_CLASS;
      familyVars = lifestyleCssVars();
      familyAccent = LIFESTYLE_TOKENS.colors.accent;
      familyButtonShape = "pill";
      break;
    case "electronics-tech":
      familyClass = ELECTRONICS_TECH_BODY_CLASS;
      familyVars = electronicsTechCssVars();
      familyAccent = ELECTRONICS_TECH_TOKENS.colors.accent;
      familyButtonShape = "square";
      break;
    case "specialty":
      familyClass = SPECIALTY_BODY_CLASS;
      familyVars = specialtyCssVars();
      familyAccent = "#ca8a04";
      familyButtonShape = null;
      break;
    case "packaging":
      familyClass = PACKAGING_BODY_CLASS;
      familyVars = packagingCssVars();
      break;
    case "taobao":
      familyClass = TAOBAO_BODY_CLASS;
      familyVars = taobaoCssVars();
      break;
    case "community":
      familyClass = COMMUNITY_BODY_CLASS;
      familyVars = communityCssVars();
      break;
    default:
      break;
  }

  // Phase 3 — intentional color override. ONLY when the operator explicitly set
  // themeAccentOverride (NOT the wizard paletteId). Applies to every theme,
  // including default chrome. Overrides both the CTA primary and the accent.
  if (store.themeAccentOverride) {
    const c = store.themeAccentOverride;
    familyVars = { ...familyVars, "--shop-primary": c, "--shop-accent": c };
    familyAccent = c;
  }

  return { chromeKey, familyClass, familyVars, familyAccent, familyButtonShape };
}

/**
 * CONTENT ladder — mirrors app/stores/[slug]/page.tsx:236-296 exactly.
 * Singletons first (raw store), then family ladder via effectiveTemplateId,
 * INCLUDING everyday.
 */
export function resolveContentThemeKey(store: ThemeInput): ThemeKey {
  if (isPetHouseStore(store)) return "pet-house";
  if (isCaseStudioStore(store)) return "case-studio";

  const key = {
    templateId: effectiveTemplateId(store),
    landingThemeVariant: store.landingThemeVariant,
  };
  if (isFashionBeautyStore(key)) return "fashion-beauty";
  if (isTrustStore(key)) return "trust";
  if (isBusinessModelStore(key)) return "business-model";
  if (isLifestyleStore(key)) return "lifestyle";
  if (isElectronicsTechStore(key)) return "electronics-tech";
  if (isSpecialtyStore(key)) return "specialty";
  if (isEverydayStore(key)) return "everyday";
  if (isTaobaoStore(key)) return "taobao";
  if (isPackagingStore(key)) return "packaging";
  if (isCommunityStore(key)) return "community";
  return "default";
}

export function resolveStoreTheme(store: ThemeInput): StoreTheme {
  return {
    themeKey: resolveContentThemeKey(store),
    chrome: resolveChromeTheme(store),
  };
}
