/**
 * Thai Cart adapter — reusable Thai/THB shopping cart page generator
 * extracted from the bespoke per-store cart at
 * `app/stores/[slug]/cart/cart-client.tsx`.
 *
 * IMPORTANT: this module must NOT be `'use client'`. lib/templates/registry.ts
 * CALLS `makeThaiCartAdapter(...)` at module top-level while building its
 * `templates` map, and registry is reachable from server modules (e.g.
 * /api/admin/stores → lib/store/template-fields → registry). If the factory
 * lived in a client module the call resolved to a client-reference proxy and
 * threw "TypeError: rS is not a function" while collecting page data —
 * breaking every build (same pattern that broke pdp-adapter and the shared
 * cart-adapter; see commits 6122a97 and 262e119). The actual rendering
 * component (which needs useCart/useState/useEffect/useMemo and the
 * /api/coupons/validate fetch flow) lives in the sibling `'use client'`
 * module thai-cart-adapter-view.tsx; this factory just renders it as JSX,
 * the normal server→client boundary.
 *
 * Why this exists
 * ---------------
 * Most marketplace themes today export
 *   `export const CartPage = makeCartAdapter('XX');`
 * which falls through to the shadcn-studio shopping-cart blocks
 * (01–04). Those blocks are English / USD demo UI — they ship
 * placeholder items, ignore the live zustand cart, and never call
 * the storefront APIs. Themes that point at them deliver a cart
 * page that:
 *
 *   - shows "$" prices instead of THB
 *   - reads demo data instead of `useCart`
 *   - has no working "ดำเนินการชำระเงิน" CTA
 *   - has no free-shipping progress bar or coupon entry
 *
 * `makeThaiCartAdapter()` replaces that with a single Thai-first
 * cart UI that:
 *
 *   1. Reads the per-store filtered slice of the zustand
 *      `useCart` store (so the cart hydrates from real customer
 *      activity and persists in localStorage).
 *   2. Shows THB pricing via `formatTHB()`.
 *   3. Renders a free-shipping progress bar driven by the
 *      configured threshold (default ฿990).
 *   4. Accepts an optional coupon code and best-effort calls
 *      `/api/coupons/validate` to compute the discount (silently
 *      no-ops for guests where the endpoint 401s).
 *   5. Routes the primary CTA to `/stores/<slug>/checkout/address`
 *      so the existing address → confirm flow takes over, OR (if
 *      a template wants a fully self-contained one-page checkout)
 *      pairs with `makeThaiCheckoutAdapter()` below.
 *
 * Theming
 * -------
 * All surface colors come from CSS custom properties seeded by
 * `app/stores/[slug]/layout.tsx` (`--shop-primary`, `--shop-bg`,
 * `--shop-ink`, `--shop-ink-muted`, `--shop-border`, `--shop-card`,
 * `--shop-muted`, `--shop-accent`). Templates that want to nudge
 * the surfaces independently of the global theme cascade can pass
 * a `BlockPalette` to override any subset of these tokens just for
 * the cart page — the rest still resolve to the theme cascade
 * defaults.
 *
 * Family-specific UI that lived in the legacy `StoreCartClient`
 * (BM volume-discount ledger, tech SKU lines, lifestyle squiggle,
 * specialty hand-script, maison serif headers, etc.) is INTENTIONALLY
 * dropped here. A theme that wants those branches should ship its
 * own bespoke `pages.cart` component instead of using this adapter.
 */

import {
  ThaiCartAdapterView,
  type ResolvedThaiCartConfig,
  type ResolvedPalette,
  type ResolvedTrustItem,
} from './thai-cart-adapter-view';

/* ──────────────────────────────────────────────────────────────
 * Public types
 * ────────────────────────────────────────────────────────────── */

/**
 * Per-theme palette tokens. Each field is optional — anything left
 * undefined falls back to the matching `var(--shop-*)` CSS custom
 * property seeded by `app/stores/[slug]/layout.tsx`. Pass a partial
 * object to override only the surfaces you want a different shade
 * for (e.g. a moodier `surfaceMuted` for the trust-strip cards).
 *
 * The names mirror what `homepage-enhancer` / shadcn-studio block
 * adapters expect so theme authors only learn one vocabulary.
 */
export interface BlockPalette {
  /** Page background (behind the main content). Default: var(--shop-bg). */
  background?: string;
  /** Card / panel surface. Default: var(--shop-card). */
  surface?: string;
  /** Secondary muted surface (lifestyle-style soft cards). Default: var(--shop-muted). */
  surfaceMuted?: string;
  /** Hairline borders. Default: var(--shop-border). */
  border?: string;
  /** Primary body copy. Default: var(--shop-ink). */
  ink?: string;
  /** Muted body copy (labels, helper text). Default: var(--shop-ink-muted). */
  inkMuted?: string;
  /** Primary CTA / brand color. Default: var(--shop-primary). */
  primary?: string;
  /** Accent — used for the trust-strip eyebrow + free-shipping highlight. Default: var(--shop-accent). */
  accent?: string;
  /** Contrast color drawn on top of `primary` (button text). Default: #ffffff. */
  primaryFg?: string;
}

export interface ThaiCartConfig {
  /** Per-theme palette tokens — defaults all resolve to `var(--shop-*)`. */
  palette?: BlockPalette;
  /** Free-shipping minimum subtotal in THB. Default 990. */
  freeShippingThreshold?: number;
  /** Flat shipping fee in THB when subtotal is under the threshold. Default 50. */
  flatShippingTHB?: number;
  /** Page heading. Default: "ตะกร้าสินค้า". */
  heading?: string;
  /** Empty-state heading line. Default: "ตะกร้าของคุณยังว่างอยู่". */
  emptyStateMessage?: string;
  /** Empty-state secondary copy. Default: "เริ่มเลือกสินค้าที่คุณชอบ". */
  emptyStateSubMessage?: string;
  /** Empty-state CTA label. Default: "เลือกซื้อสินค้า". */
  emptyStateCta?: string;
  /** Primary checkout CTA label. Default: "ดำเนินการชำระเงิน". */
  checkoutCtaLabel?: string;
  /** Trust strip override. Defaults: ส่งฟรี ฿990+ · คืนได้ 7 วัน · COD ได้. */
  trustStrip?: { icon?: 'truck' | 'rotate' | 'banknote'; label: string }[];
  /** Show the bottom trust strip. Default true. */
  showTrustStrip?: boolean;
  /** Show the coupon-code input row. Default true. */
  showCouponField?: boolean;
}

/* ──────────────────────────────────────────────────────────────
 * Internal helpers — palette resolution (server-safe, no hooks)
 * ────────────────────────────────────────────────────────────── */

function resolvePalette(p?: BlockPalette): ResolvedPalette {
  return {
    background: p?.background ?? 'var(--shop-bg)',
    surface: p?.surface ?? 'var(--shop-card)',
    surfaceMuted: p?.surfaceMuted ?? 'var(--shop-muted)',
    border: p?.border ?? 'var(--shop-border)',
    ink: p?.ink ?? 'var(--shop-ink)',
    inkMuted: p?.inkMuted ?? 'var(--shop-ink-muted)',
    primary: p?.primary ?? 'var(--shop-primary)',
    accent: p?.accent ?? 'var(--shop-accent)',
    primaryFg: p?.primaryFg ?? '#ffffff',
  };
}

/* ──────────────────────────────────────────────────────────────
 * Public factory
 * ────────────────────────────────────────────────────────────── */

interface ThaiCartStoreProp {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

export function makeThaiCartAdapter(config: ThaiCartConfig = {}) {
  const palette = resolvePalette(config.palette);
  const threshold = config.freeShippingThreshold ?? 990;
  const flatShipping = config.flatShippingTHB ?? 50;
  const heading = config.heading ?? 'ตะกร้าสินค้า';
  const emptyMsg = config.emptyStateMessage ?? 'ตะกร้าของคุณยังว่างอยู่';
  const emptySub = config.emptyStateSubMessage ?? 'เริ่มเลือกสินค้าที่คุณชอบ';
  const emptyCta = config.emptyStateCta ?? 'เลือกซื้อสินค้า';
  const checkoutLabel = config.checkoutCtaLabel ?? 'ดำเนินการชำระเงิน';
  const showTrust = config.showTrustStrip ?? true;
  const showCoupon = config.showCouponField ?? true;
  const trustStrip: ResolvedTrustItem[] = (
    config.trustStrip ?? [
      { icon: 'truck', label: `ส่งฟรี ฿${threshold.toLocaleString()}+` },
      { icon: 'rotate', label: 'คืนได้ 7 วัน' },
      { icon: 'banknote', label: 'COD ได้' },
    ]
  ).map((item) => ({ icon: item.icon ?? 'truck', label: item.label }));

  const resolvedConfig: ResolvedThaiCartConfig = {
    palette,
    threshold,
    flatShipping,
    heading,
    emptyMsg,
    emptySub,
    emptyCta,
    checkoutLabel,
    showTrust,
    showCoupon,
    trustStrip,
  };

  return function ThaiCartPage({ store }: { store: ThaiCartStoreProp }) {
    return <ThaiCartAdapterView store={store} config={resolvedConfig} />;
  };
}
