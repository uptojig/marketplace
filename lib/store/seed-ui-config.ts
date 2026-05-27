/**
 * Seed UIConfig recipes — maps every TemplateId to a default
 * server-driven UI recipe so freshly-created stores ship with a fully
 * composed shadcn-studio storefront on day one.
 *
 * Two sources feed this file:
 *
 *   1. `docs/store-block-recipes-27.md` — the 27 hand-curated identity
 *      stores. Each row is transcribed verbatim into `DOC_RECIPES` below;
 *      block ids match keys in `lib/registry/block-registry.tsx`
 *      (BlockRegistry). When the doc lists a variant the registry does
 *      not ship (e.g. `product-list-10`) the closest registered sibling
 *      is substituted (e.g. `product-list-09`) and noted inline.
 *
 *   2. Per-group sensible defaults — synthesized recipes for the
 *      ~26 generic templates not covered by the doc. Each group in
 *      `lib/templates/types.ts:74-84` gets a single sensible recipe;
 *      every template in that group inherits it (with theme tuned to
 *      the group's typography preference).
 *
 * The exported `seedUiConfigForTemplate(templateId, paletteId)` returns
 * a UIConfig validated against the Zod schema in `lib/store/ui-config.ts`.
 * It NEVER throws — returns null when the templateId is falsy or has no
 * recipe. Caller in `app/create-store/actions.ts` upserts the result
 * into `StoreLandingContent.uiConfig` after `prisma.store.create`.
 *
 * `validateAllRecipes()` runs in dev (NODE_ENV !== "production") at
 * module load to catch stale block ids before they ship — a typo
 * returns the first failing templateId + Zod error instead of silently
 * producing an invalid recipe that the renderer would discard.
 */

import { hasBlock } from "@/lib/registry/block-registry";
import {
  uiConfigSchema,
  type UIConfig,
  type UIConfigBlock,
} from "@/lib/store/ui-config";
import type { TemplateId, TemplateGroup } from "@/lib/templates/types";

// ─── Theme typography per template group ───────────────────────────────

/**
 * Picks Google-Thai-safe font pairs tuned to each TemplateGroup's mood.
 * Used by the recipe builder to populate `UIConfig.theme.{fontPrimary,
 * fontDisplay}` consistently. All fonts are sans/serif families that
 * already ship in `next/font/google` usage elsewhere in the repo (Prompt,
 * Kanit, Playfair Display, Cormorant Garamond, Outfit, Inter Tight,
 * Fraunces, JetBrains Mono).
 */
function themeForGroup(group: TemplateGroup): {
  fontPrimary: string;
  fontDisplay: string;
} {
  switch (group) {
    case "trust":
      return { fontPrimary: "Prompt", fontDisplay: "Playfair Display" };
    case "fashion-beauty":
      return { fontPrimary: "Prompt", fontDisplay: "Cormorant Garamond" };
    case "lifestyle":
      return { fontPrimary: "Prompt", fontDisplay: "Outfit" };
    case "electronics-tech":
      return { fontPrimary: "Inter Tight", fontDisplay: "JetBrains Mono" };
    case "specialty":
      return { fontPrimary: "Prompt", fontDisplay: "Fraunces" };
    case "community":
    case "business-model":
    case "everyday":
    case "taobao":
    case "packaging":
    default:
      return { fontPrimary: "Prompt", fontDisplay: "Prompt" };
  }
}

// ─── Recipe shape — internal, before theme is bound ────────────────────

/**
 * The page layout half of a recipe — theme is added separately so the
 * same layout can be reused with different palettes/fonts per store.
 * `home` is the ordered block list rendered top-to-bottom; the other
 * four fields are single block ids (PDP, catalog, cart, optional
 * checkout, optional about).
 */
interface RecipePages {
  home: UIConfigBlock[];
  pdp: string;
  catalog: string;
  cart: string;
  checkout?: string;
  about?: string;
}

// ─── Per-group default recipes (synthesized) ───────────────────────────
//
// These cover every TemplateGroup so any template that isn't explicitly
// listed in DOC_RECIPES still gets a sensible composed storefront. Block
// ids verified against BlockRegistry — every id below is a registered
// key.

const GROUP_DEFAULTS: Record<TemplateGroup, RecipePages> = {
  // Trust — editorial / clean general-retail composition.
  trust: {
    home: [
      { type: "hero", id: "bento-grid-05" },
      { type: "product-list", id: "product-list-01" },
      { type: "product-list", id: "product-list-05" },
    ],
    pdp: "product-overview-01",
    catalog: "product-category-01",
    cart: "shopping-cart-01",
  },
  // Fashion-beauty — portrait gallery + boutique cart.
  "fashion-beauty": {
    home: [
      { type: "hero", id: "bento-grid-14" },
      { type: "product-list", id: "product-list-04" },
      { type: "product-list", id: "product-list-08" },
    ],
    pdp: "product-overview-04",
    catalog: "product-category-04",
    cart: "shopping-cart-02",
  },
  // Electronics-tech — spec-sheet feel.
  "electronics-tech": {
    home: [
      { type: "hero", id: "bento-grid-11" },
      { type: "product-list", id: "product-list-07" },
    ],
    pdp: "product-overview-02",
    catalog: "product-category-07",
    cart: "shopping-cart-01",
  },
  // Lifestyle — warm scene-led layout.
  lifestyle: {
    home: [
      { type: "hero", id: "bento-grid-09" },
      { type: "product-list", id: "product-list-02" },
      { type: "product-list", id: "product-list-06" },
    ],
    pdp: "product-overview-05",
    catalog: "product-category-02",
    cart: "shopping-cart-03",
  },
  // Community — social-first w/ testimonials.
  community: {
    home: [
      { type: "hero", id: "bento-grid-05" },
      { type: "product-list", id: "product-list-09" },
      { type: "social-proof", id: "social-proof-10" },
    ],
    pdp: "product-overview-06",
    catalog: "product-category-09",
    cart: "shopping-cart-04",
  },
  // Business-model — dashboard / chart-driven.
  "business-model": {
    home: [
      { type: "hero", id: "bento-grid-11" },
      { type: "product-list", id: "product-list-03" },
    ],
    pdp: "product-overview-07",
    catalog: "product-category-03",
    cart: "shopping-cart-01",
  },
  // Specialty — kraft editorial fallback. (Most specialty templates have
  // explicit DOC_RECIPES; this is the safety net for new ones.)
  specialty: {
    home: [
      { type: "hero", id: "bento-grid-14" },
      { type: "product-list", id: "product-list-04" },
    ],
    pdp: "product-overview-08",
    catalog: "product-category-08",
    cart: "shopping-cart-02",
  },
  // Everyday — dense retail.
  everyday: {
    home: [
      { type: "hero", id: "bento-grid-09" },
      { type: "product-list", id: "product-list-07" },
    ],
    pdp: "product-overview-09",
    catalog: "product-category-11",
    cart: "shopping-cart-01",
  },
  // Taobao — flash-sale vibrant.
  taobao: {
    home: [
      { type: "hero", id: "bento-grid-05" },
      { type: "product-list", id: "product-list-07" },
    ],
    pdp: "product-overview-04",
    catalog: "product-category-06",
    cart: "shopping-cart-04",
  },
  // Packaging — bulk-friendly.
  packaging: {
    home: [
      { type: "hero", id: "bento-grid-11" },
      { type: "product-list", id: "product-list-08" },
    ],
    pdp: "product-overview-02",
    catalog: "product-category-05",
    cart: "shopping-cart-03",
  },
  // Neon — Neo-Brutalism Pop-Art (Y2K rave / concert merch). High-energy
  // hero + bold product grid; cart picks the chunkier shopping-cart-03.
  neon: {
    home: [
      { type: "hero", id: "bento-grid-05" },
      { type: "product-list", id: "product-list-04" },
      { type: "product-list", id: "product-list-08" },
    ],
    pdp: "product-overview-06",
    catalog: "product-category-08",
    cart: "shopping-cart-03",
  },
  // Mystic-Mu — Mario-pixel-art Thai สายมู digital-wallpaper. Energetic
  // hero + dense product grid; cart picks shopping-cart-03 for the
  // bold-border buy-now flow.
  "mystic-mu": {
    home: [
      { type: "hero", id: "bento-grid-05" },
      { type: "product-list", id: "product-list-04" },
      { type: "product-list", id: "product-list-08" },
  // EduClassroom — Thai K-9 teacher digital downloads. Friendly notebook
  // hero + bento product grid sized for ใบงาน/สไลด์/ข้อสอบ tiles.
  "edu-classroom": {
    home: [
      { type: "hero", id: "bento-grid-09" },
      { type: "product-list", id: "product-list-02" },
      { type: "product-list", id: "product-list-06" },
    ],
    pdp: "product-overview-06",
    catalog: "product-category-08",
    cart: "shopping-cart-03",
  },
};

// ─── Doc-sourced recipes (27 entries) ──────────────────────────────────
//
// Each entry transcribed from `docs/store-block-recipes-27.md`. Doc
// store names that match a TemplateId 1:1 are used directly; three doc
// stores have no exact TemplateId equivalent and are mapped to the
// closest in-repo template (noted inline):
//
//   • volt-7-garage    → `sai-sing`        (specialty street-racer adapter)
//   • saidee-gadgets   → `talad-see-sod`   (specialty taobao-vibrant adapter)
//   • block-press      → `brutalist-thai`  (specialty neo-brutalism adapter)
//
// Block ids referenced below are all registered in BlockRegistry —
// `validateAllRecipes()` re-checks this at module load in dev.

const DOC_RECIPES: Partial<Record<TemplateId, RecipePages>> = {
  // #1 Mono Eight — minimal-noir adapter (recipe at docs/store-block-recipes-27.md:73)
  "mono-eight": {
    home: [
      { type: "hero", id: "bento-grid-14" },
      { type: "category", id: "product-category-09" },
      { type: "social-proof", id: "social-proof-10" },
    ],
    pdp: "product-overview-01",
    catalog: "product-category-01",
    cart: "shopping-cart-01",
    checkout: "checkout-page-01",
    about: "app-integration-10",
  },
  // #2 Lila Modest (line 100)
  "lila-modest": {
    home: [
      { type: "hero", id: "product-category-02" },
      { type: "category", id: "product-category-03" },
      { type: "features", id: "bento-grid-09" },
    ],
    pdp: "product-overview-02",
    catalog: "product-list-02",
    cart: "shopping-cart-02",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #3 Atelier 27 (line 127)
  "atelier-27": {
    home: [
      { type: "hero", id: "product-category-05" },
      { type: "category", id: "product-category-06" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-04",
    catalog: "product-list-03",
    cart: "shopping-cart-03",
    checkout: "checkout-page-04",
    about: "app-integration-10",
  },
  // #4 Sirin Womenswear (line 156)
  "sirin-womenswear": {
    home: [
      { type: "hero", id: "bento-grid-05" },
      { type: "category", id: "product-category-08" },
    ],
    pdp: "product-overview-05",
    catalog: "product-list-04",
    cart: "shopping-cart-04",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #5 Caldera Skin — clinical-lab adapter (line 185)
  "caldera-skin": {
    home: [
      { type: "hero", id: "product-category-10" },
      { type: "category", id: "product-category-11" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-11" },
    ],
    pdp: "product-overview-06",
    catalog: "product-list-05",
    cart: "shopping-cart-02",
    checkout: "checkout-page-01",
    about: "app-integration-10",
  },
  // #6 Yumeiro Lip (line 212)
  "yumeiro-lip": {
    home: [
      { type: "hero", id: "product-category-12" },
      { type: "category", id: "product-category-08" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-07",
    catalog: "product-list-06",
    cart: "shopping-cart-01",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #7 Hinoki Apothecary (line 239)
  "hinoki-apothecary": {
    home: [
      { type: "hero", id: "app-integration-10" },
      { type: "category", id: "product-category-04" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-09" },
    ],
    pdp: "product-overview-08",
    catalog: "product-list-07",
    cart: "shopping-cart-02",
    checkout: "checkout-page-04",
    about: "app-integration-10",
  },
  // #8 Korakot House — mid-century-scene adapter (line 268)
  "korakot-house": {
    home: [
      { type: "hero", id: "bento-grid-09" },
      { type: "category", id: "product-category-03" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-09",
    catalog: "product-list-08",
    cart: "shopping-cart-03",
    checkout: "checkout-page-04",
    about: "app-integration-10",
  },
  // #9 Linen & Loom (line 295)
  "linen-and-loom": {
    home: [
      { type: "hero", id: "product-category-06" },
      { type: "category", id: "product-category-05" },
      { type: "features", id: "bento-grid-05" },
    ],
    pdp: "product-overview-04",
    catalog: "product-list-09",
    cart: "shopping-cart-03",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #10 Glow Lamp Co (line 324)
  "glow-lamp-co": {
    home: [
      { type: "hero", id: "bento-grid-11" },
      { type: "category", id: "product-category-10" },
      { type: "social-proof", id: "social-proof-10" },
    ],
    pdp: "product-overview-02",
    catalog: "product-list-06",
    cart: "shopping-cart-04",
    checkout: "checkout-page-01",
    about: "app-integration-10",
  },
  // #11 Wavelength Audio — single-product mode (line 351). PDP-as-hero.
  "wavelength-audio": {
    home: [
      { type: "hero", id: "product-overview-08" },
      { type: "features", id: "bento-grid-11" },
      { type: "features", id: "bento-grid-14" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "cta", id: "app-integration-10" },
      { type: "faq", id: "product-reviews-05" },
    ],
    pdp: "product-overview-08",
    // Doc: single-product mode w/ no category filter; use product-list-01
    // for the accessories grid so the catalog slot stays renderable.
    catalog: "product-list-01",
    cart: "shopping-cart-01",
    checkout: "checkout-page-04",
    about: "app-integration-10",
  },
  // #12 Keystroke Lab — spec-rack adapter (line 378)
  "keystroke-lab": {
    home: [
      { type: "hero", id: "product-category-11" },
      { type: "category", id: "product-category-10" },
      { type: "features", id: "bento-grid-11" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-06",
    catalog: "product-list-07",
    cart: "shopping-cart-04",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #13 Smartloop Home (line 405)
  "smartloop-home": {
    home: [
      { type: "hero", id: "product-category-12" },
      { type: "category", id: "product-category-09" },
      { type: "social-proof", id: "social-proof-10" },
    ],
    pdp: "product-overview-05",
    catalog: "product-list-05",
    cart: "shopping-cart-02",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #14 Trailcraft Outdoors — trail-grit adapter (line 432)
  "trailcraft-outdoors": {
    home: [
      { type: "hero", id: "bento-grid-14" },
      { type: "category", id: "product-category-09" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-09" },
    ],
    pdp: "product-overview-09",
    catalog: "product-list-08",
    cart: "shopping-cart-04",
    checkout: "checkout-page-01",
    about: "app-integration-10",
  },
  // #15 Saluki Yoga (line 459)
  "saluki-yoga": {
    home: [
      { type: "hero", id: "product-category-04" },
      { type: "category", id: "product-category-02" },
      { type: "features", id: "bento-grid-05" },
    ],
    pdp: "product-overview-05",
    catalog: "product-list-02",
    cart: "shopping-cart-02",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #16 Tinyhand Wooden Toys — nordic-craft adapter (line 486)
  "tinyhand-wooden-toys": {
    home: [
      { type: "hero", id: "product-category-08" },
      { type: "category", id: "product-category-03" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-05" },
    ],
    pdp: "product-overview-07",
    catalog: "product-list-04",
    cart: "shopping-cart-04",
    checkout: "checkout-page-04",
    about: "app-integration-10",
  },
  // #17 Petit Côté (line 513)
  "petit-cote": {
    home: [
      { type: "hero", id: "product-category-07" },
      { type: "category", id: "product-category-06" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-09" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-01",
    catalog: "product-list-03",
    cart: "shopping-cart-03",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #18 Inkstone Paper — kraft-paper adapter (line 540)
  "inkstone-paper": {
    home: [
      { type: "hero", id: "product-category-05" },
      { type: "category", id: "product-category-04" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-14" },
    ],
    pdp: "product-overview-04",
    catalog: "product-list-07",
    cart: "shopping-cart-02",
    checkout: "checkout-page-04",
    about: "app-integration-10",
  },
  // #19 Pigment Studio (line 567)
  "pigment-studio": {
    home: [
      { type: "hero", id: "product-category-12" },
      { type: "category", id: "product-category-08" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-11" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-07",
    catalog: "product-list-06",
    cart: "shopping-cart-04",
    checkout: "checkout-page-01",
    about: "app-integration-10",
  },
  // #20 Volt-7 Garage — street-racer adapter; mapped to `sai-sing`
  // (specialty street-racer chrome adapter). Recipe at line 596.
  "sai-sing": {
    home: [
      { type: "hero", id: "bento-grid-14" },
      { type: "category", id: "product-category-11" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-09" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-06",
    catalog: "product-list-05",
    cart: "shopping-cart-04",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #21 Mai Hatthakam (line 623)
  "mai-hatthakam": {
    home: [
      { type: "hero", id: "product-category-03" },
      { type: "category", id: "product-category-06" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-09" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-09",
    catalog: "product-list-08",
    cart: "shopping-cart-03",
    checkout: "checkout-page-04",
    about: "app-integration-10",
  },
  // #22 Carbon Era Cameras (line 650)
  "carbon-era-cameras": {
    home: [
      { type: "hero", id: "product-category-01" },
      { type: "category", id: "product-category-05" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-14" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-08",
    catalog: "product-list-09",
    cart: "shopping-cart-01",
    checkout: "checkout-page-01",
    about: "app-integration-10",
  },
  // #23 Reclaim Leather (line 677)
  "reclaim-leather": {
    home: [
      { type: "hero", id: "product-category-02" },
      { type: "category", id: "product-category-04" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-09" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-04",
    catalog: "product-list-07",
    cart: "shopping-cart-02",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #24 Bulkbox Industrial (line 704)
  "bulkbox-industrial": {
    home: [
      { type: "hero", id: "product-category-11" },
      { type: "category", id: "product-category-09" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-11" },
      { type: "cta", id: "app-integration-10" },
      { type: "faq", id: "product-reviews-05" },
    ],
    pdp: "product-overview-01",
    catalog: "product-list-05",
    cart: "shopping-cart-04",
    checkout: "checkout-page-04",
    about: "app-integration-10",
  },
  // #25 Pastel Pack (line 731)
  "pastel-pack": {
    home: [
      { type: "hero", id: "product-category-06" },
      { type: "category", id: "product-category-02" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-05" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-02",
    catalog: "product-list-02",
    cart: "shopping-cart-03",
    checkout: "checkout-page-02",
    about: "app-integration-10",
  },
  // #26 Saidee Gadgets — taobao-vibrant adapter; mapped to `talad-see-sod`.
  // Recipe at line 758.
  "talad-see-sod": {
    home: [
      { type: "hero", id: "bento-grid-05" },
      { type: "category", id: "product-category-12" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-11" },
      { type: "cta", id: "app-integration-10" },
      { type: "faq", id: "product-reviews-05" },
    ],
    pdp: "product-overview-07",
    catalog: "product-list-06",
    cart: "shopping-cart-04",
    checkout: "checkout-page-04",
    about: "app-integration-10",
  },
  // #27 Block Press — neo-brutalism adapter; mapped to `brutalist-thai`.
  // Recipe at line 785.
  "brutalist-thai": {
    home: [
      { type: "hero", id: "bento-grid-11" },
      { type: "category", id: "product-category-09" },
      { type: "social-proof", id: "social-proof-10" },
      { type: "features", id: "bento-grid-14" },
      { type: "cta", id: "app-integration-10" },
    ],
    pdp: "product-overview-09",
    catalog: "product-list-04",
    cart: "shopping-cart-01",
    checkout: "checkout-page-01",
    about: "app-integration-10",
  },
};


// Derived from the single source of truth — no more manual sync.
import {
  groupForTemplate as _groupForTemplate,
  TEMPLATE_TO_GROUP,
} from "@/lib/templates/template-groups";

function groupForTemplate(id: TemplateId): TemplateGroup {
  return _groupForTemplate(id) ?? "specialty";
}


// ─── Builder — recipe + theme → UIConfig ───────────────────────────────

function buildConfig(
  pages: RecipePages,
  group: TemplateGroup,
  paletteId: string,
): UIConfig {
  const { fontPrimary, fontDisplay } = themeForGroup(group);
  // Sanitize palette — Zod requires 1–40 char non-empty string. Wizard
  // ALWAYS passes a real paletteId from PALETTES, but defend against
  // a caller passing "" or absurdly long custom labels.
  const safePalette =
    paletteId && paletteId.trim().length > 0
      ? paletteId.trim().slice(0, 40)
      : "default";
  return {
    theme: {
      palette: safePalette,
      fontPrimary,
      fontDisplay,
    },
    pages,
  };
}

// ─── Public API ────────────────────────────────────────────────────────

/**
 * Resolves a TemplateId + paletteId into a fully-validated UIConfig
 * ready to write into `StoreLandingContent.uiConfig`. Returns null when:
 *
 *   • templateId is null / undefined / not a known TemplateId, OR
 *   • the produced UIConfig fails Zod validation (defensive — should
 *     never happen because `validateAllRecipes()` runs in dev).
 *
 * The function NEVER throws. The caller in
 * `app/create-store/actions.ts` already wraps the upsert in try/catch
 * so even if validation produces an unexpected result the wizard still
 * completes.
 */
export function seedUiConfigForTemplate(
  templateId: TemplateId | string | null | undefined,
  paletteId: string = "default",
): UIConfig | null {
  if (!templateId) return null;

  // The caller types this as `TemplateId` but in practice the wizard
  // state's `templateId` is `string | null`, so widen here. If the id
  // isn't in TEMPLATE_GROUPS we'll still fall through to "specialty"
  // via groupForTemplate, but only if there's a DOC_RECIPES hit —
  // otherwise return null so the storefront stays on the legacy path
  // rather than receiving a config for an unknown template.
  const id = templateId as TemplateId;
  const knownTemplate = TEMPLATE_TO_GROUP.has(id);

  // Doc-sourced recipe takes precedence; fall back to per-group default
  // ONLY for known TemplateIds.
  const recipe =
    DOC_RECIPES[id] ?? (knownTemplate ? GROUP_DEFAULTS[groupForTemplate(id)] : undefined);
  if (!recipe) return null;

  const config = buildConfig(recipe, groupForTemplate(id), paletteId);

  // Defensive — re-validate. If the recipe shape ever drifts from the
  // schema, return null rather than ship a config the renderer will
  // discard at parse time anyway.
  const parsed = uiConfigSchema.safeParse(config);
  return parsed.success ? parsed.data : null;
}

// ─── Dev-time validation ───────────────────────────────────────────────

/**
 * Walks every TemplateId in TEMPLATE_GROUPS, builds its recipe, and
 * validates against the Zod schema + verifies every block id is
 * registered in BlockRegistry. Returns the first failing
 * `{ templateId, error }` so a typo (e.g. `product-list-10` when only
 * 01..09 exist) surfaces immediately. Called once at module load in
 * non-production environments.
 */
export function validateAllRecipes():
  | { ok: true }
  | { ok: false; templateId: TemplateId; error: string } {
  const templateIds = Array.from(TEMPLATE_TO_GROUP.keys()) as TemplateId[];
  for (const id of templateIds) {
    const config = seedUiConfigForTemplate(id, "default");
    if (!config) {
      return {
        ok: false,
        templateId: id,
        error: "seedUiConfigForTemplate returned null",
      };
    }
    // Schema validation already happened inside seedUiConfigForTemplate,
    // but check every block id is actually registered — Zod doesn't
    // know about BlockRegistry.
    const ids: string[] = [
      ...config.pages.home.map((b) => b.id),
      ...(config.pages.pdp ? [config.pages.pdp] : []),
      ...(config.pages.catalog ? [config.pages.catalog] : []),
      ...(config.pages.cart ? [config.pages.cart] : []),
      ...(config.pages.checkout ? [config.pages.checkout] : []),
      ...(config.pages.about ? [config.pages.about] : []),
    ];
    for (const blockId of ids) {
      if (!hasBlock(blockId)) {
        return {
          ok: false,
          templateId: id,
          error: `Block id "${blockId}" is not registered in BlockRegistry`,
        };
      }
    }
  }
  return { ok: true };
}

// Run validation at module load in dev so a stale block id surfaces the
// moment someone touches this file — the wizard's try/catch around the
// upsert would otherwise silently swallow it.
if (process.env.NODE_ENV !== "production") {
  const result = validateAllRecipes();
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.warn(
      `[seed-ui-config] recipe validation failed for "${result.templateId}": ${result.error}`,
    );
  }
}
