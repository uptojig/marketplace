/**
 * Marketplace shell — the brand-side chrome that wraps every page
 * under `app/(marketplace)/*` (home, /signin, /signup, /apply,
 * /create-store, /dashboard, etc.).
 *
 * Replaces the original 39-line MVP placeholder (text "Marketplace"
 * logo + 2-link nav + dev-copy footer). The new shell pulls in:
 *
 *   - MarketplaceHeader  — sticky public-visitor header with brand
 *                          logo, 4-item nav, ghost sign-in + coral
 *                          "เปิดร้าน" CTA, mobile slide-right drawer.
 *   - MarketplaceFooter  — forest-green brand-anchor footer with
 *                          newsletter signup, 5-col grid, payment
 *                          methods strip, legal links.
 *
 * The `theme-marketplace` class on the outer wrapper switches the
 * page into the `--color-mp-*` token cascade (see globals.css block
 * and lib/landing/marketplace.ts). Sub-pages opt in to brand styling
 * automatically by using `bg-mp-*` / `text-mp-*` Tailwind utilities.
 *
 * Cart + checkout intentionally live per-store at /stores/[slug]/
 * — see component comments for the per-store ownership model.
 */
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { MarketplaceFooter } from '@/components/marketplace/MarketplaceFooter';
import { MARKETPLACE_BODY_CLASS } from '@/lib/landing/marketplace';

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${MARKETPLACE_BODY_CLASS} min-h-screen flex flex-col bg-mp-cream`}>
      <MarketplaceHeader />
      <main className="flex-1">{children}</main>
      <MarketplaceFooter />
    </div>
  );
}
