import { MarketplaceFooter } from './marketplace-footer';
import { MarketplaceHeader } from './marketplace-header';

interface MarketplacePageProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with global marketplace header + footer.
 * Use for: homepage, category, PDP, search, account, help pages.
 *
 * Store pages can opt in too (they already nest their own store header below).
 */
export function MarketplacePage({ children }: MarketplacePageProps) {
  return (
    <>
      <MarketplaceHeader />
      <main className="min-h-screen">{children}</main>
      <MarketplaceFooter />
    </>
  );
}
