/**
 * Thai Checkout adapter — reusable Thai/THB 4-step checkout page
 * generator extracted from the bespoke per-store checkout flow at
 * `app/stores/[slug]/checkout/{address,confirm}/*-client.tsx`.
 *
 * IMPORTANT: this module must NOT be `'use client'`. lib/templates/registry.ts
 * CALLS `makeThaiCheckoutAdapter(...)` at module top-level while building its
 * `templates` map, and registry is reachable from server modules (e.g.
 * /api/admin/stores → lib/store/template-fields → registry). If the factory
 * lived in a client module the call resolved to a client-reference proxy and
 * threw "TypeError: rS is not a function" while collecting page data —
 * breaking every build (same pattern that broke pdp-adapter and the shared
 * cart-adapter; see commits 6122a97 and 262e119). The actual rendering
 * component (which needs useCart/useState/useEffect/useMemo and the
 * /api/checkout POST flow) lives in the sibling `'use client'` module
 * thai-checkout-adapter-view.tsx; this factory just renders it as JSX, the
 * normal server→client boundary.
 *
 * Why this exists
 * ---------------
 * Themes that registered
 *   `export const CheckoutPage = makeCheckoutAdapter('XX');`
 * fall through to shadcn-studio's checkout-page blocks (01 / 02 /
 * 04). Those are English / USD demo pages — no real cart, no real
 * shipping calc, no POST to `/api/checkout`. A live storefront
 * pointed at them shows a checkout that simply doesn't work.
 *
 * `makeThaiCheckoutAdapter()` replaces that with a single-page Thai
 * checkout that:
 *
 *   1. Reads the per-store filtered slice of the zustand `useCart`
 *      store as the live order.
 *   2. Walks the buyer through 4 steps in one route:
 *        cart → address → payment → confirm
 *      The stepper is purely visual — all four sections render on
 *      one page so the buyer never bounces to a different URL.
 *   3. Lets the buyer enter their own shipping address inline (no
 *      address book lookup — fully guest-friendly).
 *   4. Picks shipping (EMS / REGISTERED defaults — overridable) and
 *      payment method.
 *   5. POSTs to `/api/checkout` and on success calls
 *      `clearStore(slug)` on the zustand cart + shows the success
 *      panel with the orderRef.
 *
 * Templates that want the multi-route address → confirm flow that
 * lives under `app/stores/[slug]/checkout/{address,confirm}/` should
 * NOT register `pages.checkout` — the per-store layout will redirect
 * to `/stores/[slug]/checkout/address` automatically.
 *
 * Templates that DO register a `pages.checkout` (either this adapter
 * or a bespoke one) get the entry route `/stores/[slug]/checkout`
 * rendering inline instead of redirecting.
 *
 * Theming
 * -------
 * Same `BlockPalette` shape as `thai-cart-adapter.tsx`. All surface
 * colors default to the `var(--shop-*)` cascade the storefront
 * layout already seeds.
 *
 * Logic intentionally NOT carried over
 * -------------------------------------
 *   - Saved address book lookup (`/api/addresses` round-trip + the
 *     "ที่อยู่หลัก" badge). Generic checkout assumes one-shot guest
 *     entry; templates that need the full address book should stay
 *     on the default multi-route flow.
 *   - Family-specific eyebrow chrome (Trust maison serif, BM ledger
 *     header, electronics-tech mono SKU, etc.).
 *   - Breadcrumbs widget — out of scope; the stepper carries the
 *     same orientation signal.
 */

import {
  ThaiCheckoutAdapterView,
  type ResolvedThaiCheckoutConfig,
  type ShippingOption,
  type PaymentOption,
} from './thai-checkout-adapter-view';
import type { ResolvedPalette } from './thai-cart-adapter-view';
import type { BlockPalette } from './thai-cart-adapter';

/* ──────────────────────────────────────────────────────────────
 * Public types
 * ────────────────────────────────────────────────────────────── */

// Re-export BlockPalette so existing `import type { BlockPalette }` from
// thai-checkout-adapter keeps working without callers depending on the
// view module path.
export type { BlockPalette, ShippingOption, PaymentOption };

export interface ThaiCheckoutConfig {
  /** Per-theme palette tokens — defaults all resolve to `var(--shop-*)`. */
  palette?: BlockPalette;
  /** Free-shipping minimum subtotal in THB. Default 990. */
  freeShippingThreshold?: number;
  /** Step labels — keep them short to fit the stepper. */
  stepLabels?: {
    cart?: string;
    address?: string;
    payment?: string;
    confirm?: string;
  };
  /** Available shipping methods. Defaults: EMS (50฿, 1-2 วัน) + REGISTERED (30฿, 3-5 วัน). */
  shippingOptions?: ShippingOption[];
  /** Available payment methods. Default: AnyPay only (covers PromptPay, card, BNPL). */
  paymentOptions?: PaymentOption[];
  /** Page heading. Default "ชำระเงิน". */
  heading?: string;
  /** Submit CTA label on the confirm step. Default "ยืนยันคำสั่งซื้อ". */
  submitCtaLabel?: string;
  /** Show "ส่งฟรี" badge on the shipping option row when subtotal qualifies. Default true. */
  highlightFreeShipping?: boolean;
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

const DEFAULT_SHIPPING: ShippingOption[] = [
  { id: 'EMS', name: 'EMS', priceTHB: 50, eta: '1-2 วัน' },
  { id: 'REGISTERED', name: 'ลงทะเบียนไปรษณีย์ไทย', priceTHB: 30, eta: '3-5 วัน' },
];

const DEFAULT_PAYMENT: PaymentOption[] = [
  { id: 'ANYPAY', name: 'ชำระผ่าน AnyPay' },
];

interface ThaiCheckoutStoreProp {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

/* ──────────────────────────────────────────────────────────────
 * Public factory
 * ────────────────────────────────────────────────────────────── */

export function makeThaiCheckoutAdapter(config: ThaiCheckoutConfig = {}) {
  const palette = resolvePalette(config.palette);
  const threshold = config.freeShippingThreshold ?? 990;
  const heading = config.heading ?? 'ชำระเงิน';
  const submitLabel = config.submitCtaLabel ?? 'ยืนยันคำสั่งซื้อ';
  const stepLabels = {
    cart: config.stepLabels?.cart ?? 'ตะกร้า',
    address: config.stepLabels?.address ?? 'ที่อยู่จัดส่ง',
    payment: config.stepLabels?.payment ?? 'การชำระเงิน',
    confirm: config.stepLabels?.confirm ?? 'ยืนยัน',
  };
  const shippingOptions = config.shippingOptions ?? DEFAULT_SHIPPING;
  const paymentOptions = config.paymentOptions ?? DEFAULT_PAYMENT;
  const highlightFree = config.highlightFreeShipping ?? true;

  const resolvedConfig: ResolvedThaiCheckoutConfig = {
    palette,
    threshold,
    heading,
    submitLabel,
    stepLabels,
    shippingOptions,
    paymentOptions,
    highlightFree,
  };

  return function ThaiCheckoutPage({ store }: { store: ThaiCheckoutStoreProp }) {
    return <ThaiCheckoutAdapterView store={store} config={resolvedConfig} />;
  };
}
