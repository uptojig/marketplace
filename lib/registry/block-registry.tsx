/**
 * Dynamic block registry — server-driven UI.
 *
 * Each entry maps a block ID (used in `StoreLandingContent.uiConfig.pages`)
 * to a lazy-loaded React component via `next/dynamic`. The renderer
 * (`components/storefront/block-renderer.tsx`) looks up an id, loads the
 * component, and renders it with the store's editable content + per-store
 * props from `uiConfig.pages.home[].data`.
 *
 * Adding a block: drop the file under `components/shadcn-studio/blocks/`,
 * export the default component, and add one line below. The block then
 * becomes available to every store's `uiConfig` recipe — no per-store
 * component code needed.
 *
 * All blocks accept the same `BlockProps` shape (defined below). Blocks
 * that haven't been refactored to consume props yet will still render
 * from their built-in placeholder data — the renderer passes content
 * through anyway, so wiring each block later doesn't require a rerun
 * of the seed.
 */

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { StoreLandingContent } from "@prisma/client";

// ─── Common prop shape for every registered block ─────────────────────

export interface BlockStoreSummary {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  tagline: string | null;
  description: string | null;
}

export interface BlockProps {
  /** Lean store summary — every block can read for display. */
  store: BlockStoreSummary;
  /** Operator-edited landing content (hero copy, tiles, testimonials, …).
   *  Null when no content row exists yet — blocks fall back to defaults. */
  content: StoreLandingContent | null;
  /** Per-instance overrides from `uiConfig.pages.home[].data`. Use this
   *  to override a heading or toggle a sub-section without editing the
   *  store-level content row. */
  data?: Record<string, unknown>;
  /** The block's recipe entry — id + type — for debugging in dev. */
  block: { id: string; type: string };
}

// `next/dynamic` returns a component that may legitimately accept a much
// wider prop surface than `BlockProps` (most shadcn-studio blocks
// currently accept no props at all). Erase to `ComponentType<any>` at
// the boundary so registry entries stay simple; the renderer always
// hands `BlockProps`, and untouched blocks simply ignore them.
type RegistryComponent = ComponentType<BlockProps>;

// ─── Helpers — keep entries terse ───────────────────────────────────────

function lazy(
  loader: () => Promise<{ default: ComponentType<unknown> }>,
  opts: { ssr?: boolean } = {},
): RegistryComponent {
  // The block author may not have typed their component to BlockProps yet;
  // assert through `unknown` so the registry shape stays uniform without
  // forcing a refactor of every existing block file in one go.
  return dynamic(loader, { ssr: opts.ssr ?? true }) as RegistryComponent;
}

// ─── Registry entries — grouped by category ─────────────────────────────

export const BlockRegistry: Record<string, RegistryComponent> = {
  // ── Navbar ────────────────────────────────────────────────────────────
  "navbar-component-11": lazy(() =>
    import("@/components/shadcn-studio/blocks/navbar-component-11/navbar-component-11"),
  ),

  // ── Bento / Hero proxies ──────────────────────────────────────────────
  // shadcn-studio doesn't ship dedicated `hero-section-*` folders yet —
  // bento grids serve as composable hero proxies until they do.
  "bento-grid-05": lazy(() =>
    import("@/components/shadcn-studio/blocks/bento-grid-05/bento-grid-05"),
  ),
  "bento-grid-09": lazy(() =>
    import("@/components/shadcn-studio/blocks/bento-grid-09/bento-grid-09"),
  ),
  "bento-grid-11": lazy(() =>
    import("@/components/shadcn-studio/blocks/bento-grid-11/bento-grid-11"),
  ),
  "bento-grid-14": lazy(() =>
    import("@/components/shadcn-studio/blocks/bento-grid-14/bento-grid-14"),
  ),

  // ── Product list (catalog grids / featured rails) ─────────────────────
  "product-list-01": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-list-01/product-list-01"),
  ),
  "product-list-02": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-list-02/product-list-02"),
  ),
  "product-list-03": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-list-03/product-list-03"),
  ),
  "product-list-04": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-list-04/product-list-04"),
  ),
  "product-list-05": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-list-05/product-list-05"),
  ),
  "product-list-06": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-list-06/product-list-06"),
  ),
  "product-list-07": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-list-07/product-list-07"),
  ),
  "product-list-08": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-list-08/product-list-08"),
  ),
  "product-list-09": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-list-09/product-list-09"),
  ),

  // ── Product category (categorized rails / chip strips) ────────────────
  "product-category-01": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-01/product-category-01"),
  ),
  "product-category-02": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-02/product-category-02"),
  ),
  "product-category-03": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-03/product-category-03"),
  ),
  "product-category-04": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-04/product-category-04"),
  ),
  "product-category-05": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-05/product-category-05"),
  ),
  "product-category-06": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-06/product-category-06"),
  ),
  "product-category-07": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-07/product-category-07"),
  ),
  "product-category-08": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-08/product-category-08"),
  ),
  "product-category-09": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-09/product-category-09"),
  ),
  "product-category-10": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-10/product-category-10"),
  ),
  "product-category-11": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-11/product-category-11"),
  ),
  "product-category-12": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-category-12/product-category-12"),
  ),

  // ── PDP — product overview ────────────────────────────────────────────
  "product-overview-01": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-overview-01/product-overview-01"),
  ),
  "product-overview-02": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-overview-02/product-overview-02"),
  ),
  "product-overview-04": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-overview-04/product-overview-04"),
  ),
  "product-overview-05": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-overview-05/product-overview-05"),
  ),
  "product-overview-06": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-overview-06/product-overview-06"),
  ),
  "product-overview-07": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-overview-07/product-overview-07"),
  ),
  "product-overview-08": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-overview-08/product-overview-08"),
  ),
  "product-overview-09": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-overview-09/product-overview-09"),
  ),

  // ── PDP — reviews ────────────────────────────────────────────────────
  "product-reviews-02": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-reviews-02/product-reviews-02"),
  ),
  "product-reviews-03": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-reviews-03/product-reviews-03"),
  ),
  "product-reviews-04": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-reviews-04/product-reviews-04"),
  ),
  "product-reviews-05": lazy(() =>
    import("@/components/shadcn-studio/blocks/product-reviews-05/product-reviews-05"),
  ),

  // ── Shopping cart (interactive — client-only) ────────────────────────
  "shopping-cart-01": lazy(
    () => import("@/components/shadcn-studio/blocks/shopping-cart-01/shopping-cart-01"),
    { ssr: false },
  ),
  "shopping-cart-02": lazy(
    () => import("@/components/shadcn-studio/blocks/shopping-cart-02/shopping-cart-02"),
    { ssr: false },
  ),
  "shopping-cart-03": lazy(
    () => import("@/components/shadcn-studio/blocks/shopping-cart-03/shopping-cart-03"),
    { ssr: false },
  ),
  "shopping-cart-04": lazy(
    () => import("@/components/shadcn-studio/blocks/shopping-cart-04/shopping-cart-04"),
    { ssr: false },
  ),

  // ── Checkout (interactive — client-only) ─────────────────────────────
  "checkout-page-01": lazy(
    () => import("@/components/shadcn-studio/blocks/checkout-page-01/checkout-page-01"),
    { ssr: false },
  ),
  "checkout-page-02": lazy(
    () => import("@/components/shadcn-studio/blocks/checkout-page-02/checkout-page-02"),
    { ssr: false },
  ),
  "checkout-page-04": lazy(
    () => import("@/components/shadcn-studio/blocks/checkout-page-04/checkout-page-04"),
    { ssr: false },
  ),

  // ── Social proof / testimonials ──────────────────────────────────────
  "social-proof-10": lazy(
    () => import("@/components/shadcn-studio/blocks/social-proof-10/social-proof-10"),
    { ssr: false }, // uses three.js globe
  ),

  // ── App integration / partner-logo strip ─────────────────────────────
  "app-integration-10": lazy(() =>
    import("@/components/shadcn-studio/blocks/app-integration-10/app-integration-10"),
  ),
};

// ─── Category index — for the editor UI's block picker ─────────────────

export interface BlockCategory {
  /** Category slug — used as a tab key in the picker. */
  id: string;
  /** Thai display label for the editor. */
  label: string;
  /** Block ids in this category. */
  blocks: { id: string; label: string }[];
}

export const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    id: "navbar",
    label: "เมนูบนสุด (Navbar)",
    blocks: [{ id: "navbar-component-11", label: "Navbar 11 (default)" }],
  },
  {
    id: "hero",
    label: "Hero / โซนต้อนรับ (Bento)",
    blocks: [
      { id: "bento-grid-05", label: "Bento 05 (ripple)" },
      { id: "bento-grid-09", label: "Bento 09 (product card)" },
      { id: "bento-grid-11", label: "Bento 11 (dashboard chart)" },
      { id: "bento-grid-14", label: "Bento 14 (card stack)" },
    ],
  },
  {
    id: "product-list",
    label: "รายการสินค้า (Product list)",
    blocks: [
      { id: "product-list-01", label: "Product list 01" },
      { id: "product-list-02", label: "Product list 02" },
      { id: "product-list-03", label: "Product list 03" },
      { id: "product-list-04", label: "Product list 04" },
      { id: "product-list-05", label: "Product list 05 (carousel)" },
      { id: "product-list-06", label: "Product list 06" },
      { id: "product-list-07", label: "Product list 07" },
      { id: "product-list-08", label: "Product list 08" },
      { id: "product-list-09", label: "Product list 09" },
    ],
  },
  {
    id: "category",
    label: "หมวดสินค้า (Category)",
    blocks: Array.from({ length: 12 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return { id: `product-category-${n}`, label: `Product category ${n}` };
    }),
  },
  {
    id: "pdp",
    label: "หน้าสินค้า (PDP)",
    blocks: [
      { id: "product-overview-01", label: "Product overview 01" },
      { id: "product-overview-02", label: "Product overview 02" },
      { id: "product-overview-04", label: "Product overview 04" },
      { id: "product-overview-05", label: "Product overview 05" },
      { id: "product-overview-06", label: "Product overview 06" },
      { id: "product-overview-07", label: "Product overview 07" },
      { id: "product-overview-08", label: "Product overview 08" },
      { id: "product-overview-09", label: "Product overview 09" },
    ],
  },
  {
    id: "reviews",
    label: "รีวิวลูกค้า (Reviews)",
    blocks: [
      { id: "product-reviews-02", label: "Reviews 02" },
      { id: "product-reviews-03", label: "Reviews 03" },
      { id: "product-reviews-04", label: "Reviews 04" },
      { id: "product-reviews-05", label: "Reviews 05" },
    ],
  },
  {
    id: "cart",
    label: "ตะกร้า (Cart)",
    blocks: [
      { id: "shopping-cart-01", label: "Cart 01" },
      { id: "shopping-cart-02", label: "Cart 02" },
      { id: "shopping-cart-03", label: "Cart 03" },
      { id: "shopping-cart-04", label: "Cart 04" },
    ],
  },
  {
    id: "checkout",
    label: "ชำระเงิน (Checkout)",
    blocks: [
      { id: "checkout-page-01", label: "Checkout 01" },
      { id: "checkout-page-02", label: "Checkout 02" },
      { id: "checkout-page-04", label: "Checkout 04 (multi-step)" },
    ],
  },
  {
    id: "social-proof",
    label: "Social proof",
    blocks: [{ id: "social-proof-10", label: "Social proof 10 (globe)" }],
  },
  {
    id: "partners",
    label: "พาร์ทเนอร์ / Integration",
    blocks: [{ id: "app-integration-10", label: "App integration 10" }],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────

/** All registered block ids — for editor pickers + admin validation. */
export const ALL_BLOCK_IDS = Object.keys(BlockRegistry);

/** Returns the lazy-loaded component for an id, or null when unknown. */
export function getBlock(id: string): RegistryComponent | null {
  return BlockRegistry[id] ?? null;
}

/** True when an id is registered — cheap lookup for validation paths. */
export function hasBlock(id: string): boolean {
  return id in BlockRegistry;
}
