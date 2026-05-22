'use client';

/**
 * talad-see-sod — Cart page (shopping-cart-01 + TALAD_PALETTE)
 *
 * shopping-cart-01 is the full-page section variant; variants 02/04
 * are Dialog/Sheet modals that require a `trigger` prop and crash
 * when mounted as a page. Palette injection keeps the cart on-theme
 * with the rest of the Talad red/cream storefront.
 */
import { makeCartAdapter } from '@/components/storefront/themes/_shared/cart-adapter';
import { TALAD_PALETTE } from '../palette';
export const CartPage = makeCartAdapter('01', TALAD_PALETTE);
export default CartPage;
