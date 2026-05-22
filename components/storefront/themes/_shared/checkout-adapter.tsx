/**
 * Shared checkout adapter — DISABLED.
 *
 * Previously this wrapped shadcn-studio `checkout-page-01 / 02 / 04`
 * blocks and assigned them as `pages.checkout` for ~30 themes. Those
 * blocks ship hardcoded English / USD and expect a data shape this
 * adapter never produced (variant 02 was being passed
 * `paymentMethods={{}}`), so /checkout/address and /checkout/confirm
 * rendered an unusable block + the empty cart state.
 *
 * Return `undefined` so the `template?.pages?.checkout` check inside
 * the route falls through to the family-detection fallback, which
 * renders the standard `CheckoutAddressClient` / `CheckoutConfirmClient`
 * — multi-route, useCart-aware, Thai/THB, works.
 *
 * Themes that want a fully bespoke checkout (talad-see-sod's 4-step
 * flow, brutalist-thai) keep registering their own component under
 * `pages.checkout` directly and are unaffected.
 *
 * Type signature is kept for back-compat with the ~30 themes that
 * still call `makeCheckoutAdapter('XX')` at module load and assign
 * the result to `pages.checkout` — the optional `ComponentType`
 * accepts `undefined`.
 */

export type CheckoutVariant = '01' | '02' | '04';

export interface CheckoutAdapterProps {
  store: { slug: string; name: string };
  items: unknown[];
}

export function makeCheckoutAdapter(
  _variant: CheckoutVariant,
): undefined {
  return undefined;
}
