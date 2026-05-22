'use client';

/**
 * talad-see-sod — Cart page (shopping-cart-04)
 *
 * Passes the Talad red palette so the shadcn-studio cart block
 * renders with the same red/cream tokens as the rest of the
 * storefront instead of falling back to default neutral shadcn
 * tokens.
 */
import { makeCartAdapter } from '@/components/storefront/themes/_shared/cart-adapter';
import { TALAD_PALETTE } from '../palette';
export const CartPage = makeCartAdapter('04', TALAD_PALETTE);
export default CartPage;
