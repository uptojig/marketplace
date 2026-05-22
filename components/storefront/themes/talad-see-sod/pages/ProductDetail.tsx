'use client';

/**
 * talad-see-sod — PDP (product-overview-05 + product-reviews-04)
 *
 * Passes the Talad red palette so the shadcn-studio blocks render
 * with the same red/cream tokens as the rest of the storefront
 * instead of falling back to default neutral shadcn tokens.
 */
import { makePdpAdapter } from '@/components/storefront/themes/_shared/pdp-adapter';
import { TALAD_PALETTE } from '../palette';
export const ProductDetailPage = makePdpAdapter('05', '04', TALAD_PALETTE);
export default ProductDetailPage;
