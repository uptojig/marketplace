/**
 * Minimum number of active products a store needs before landing
 * generation is allowed.
 *
 * Why this gate exists:
 *   The agent has to fill OfferGrid blocks and category banners with
 *   real products from the store. Below ~6 items, those grids look
 *   like skeletons and the agent ends up either repeating products
 *   or padding with hallucinated SKUs. Forcing the operator to seed
 *   the catalog first (via the picker) produces a markedly better
 *   first generation and keeps the agent grounded in real inventory.
 *
 * The threshold is a pragmatic floor — Family I (Gen-Z mass commerce)
 * really wants 24+ products, but we don't want to block stores that
 * intentionally curate small catalogs (Family C luxe, Family H cozy).
 * 6 covers a single OfferGrid row and at least one CategoryBanner
 * tile group.
 *
 * Aspirational target stays at 50 (surfaced in the picker UI's
 * counter); this is just the floor below which "Generate" is gated.
 *
 * Imported by:
 *   - /api/admin/stores/[id]/generate-landing (server-side guard)
 *   - admin/stores/[id]/landing-form (client-side button gate)
 *   - admin/stores/[id]/page (server-side count + props)
 */
export const MIN_PRODUCTS_FOR_LANDING = 6;
