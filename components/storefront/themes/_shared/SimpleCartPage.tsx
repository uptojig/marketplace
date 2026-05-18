/**
 * Shared cart page scaffold — wraps the default StoreCartClient with
 * a theme-specific top banner. Used by the slim themes (everyday /
 * taobao / packaging / community) that don't need a fully bespoke
 * cart structure (BM's spreadsheet-ledger CartPage is the only one
 * structurally different).
 */

import type { Store } from '@prisma/client';
import { StoreCartClient } from '@/app/stores/[slug]/cart/cart-client';

type StoreSlim = Pick<
  Store,
  'id' | 'slug' | 'name' | 'logoUrl' | 'primaryColor' | 'templateId' | 'landingThemeVariant'
>;

interface Props {
  store: StoreSlim;
  /** Theme-specific top banner rendered above the cart UI. */
  banner: React.ReactNode;
  /**
   * Which family flag to pass through to StoreCartClient so the
   * built-in theme copy / volume-discount banner / "Bulk order"
   * eyebrow still works. Pass true only for the family that owns
   * the underlying StoreCartClient branch (e.g. everyday → none).
   */
  isFashionBeauty?: boolean;
  isTrust?: boolean;
  isBusinessModel?: boolean;
  isLifestyle?: boolean;
  isElectronicsTech?: boolean;
  isSpecialty?: boolean;
}

export function SimpleCartPage({
  store,
  banner,
}: Props) {
  // Family flags are accepted on Props for API parity with feat-branch
  // StoreCartClient but ignored here — main's StoreCartClient renders a
  // single generic cart UI for every theme. Slim themes still get their
  // bespoke top banner via `banner`.
  return (
    <>
      {banner}
      <StoreCartClient store={store} />
    </>
  );
}
