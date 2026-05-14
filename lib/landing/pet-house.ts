/**
 * Pet-house design family — bespoke landing for fluffyhouse (pet supplies).
 *
 * Owns the visual language for the pet-house variant:
 *   • cream background (#FAF7F4) — warm paper feel
 *   • green accent (#5BA033) — friendly outdoor green
 *   • warm brown ink (#3B2F1F / #5C3D1F) — readable on cream
 *   • soft yellow / peach / mint accent tints — playful + pet-themed
 *   • Georgia serif headings — handcrafted catalog feel
 *   • inline SVG illustrations (house-with-cat, cat, dog, cat+dog story)
 *
 * Wiring intent:
 *   - For now the only store opted in is `fluffyhouse` (matched by slug).
 *   - An operator can later assign templateId='pet-house' OR
 *     landingThemeVariant='pet-house' to onboard another pet-store under
 *     the same homepage.
 *   - The detection gate is consumed by `app/stores/[slug]/page.tsx`
 *     BEFORE the existing render paths — when this returns true the
 *     custom `PetHouseHomepage` component renders inside the shared
 *     ShopHeader/ShopFooter chrome from `app/stores/[slug]/layout.tsx`.
 */

import type { Store } from '@prisma/client';

/**
 * Returns true when the given store should render the pet-house custom
 * homepage. Accepts a narrow shape so callers don't have to pass the
 * full Prisma Store row.
 */
export function isPetHouseStore(
  store: Pick<Store, 'slug' | 'templateId' | 'landingThemeVariant'>,
): boolean {
  if (store.slug === 'fluffyhouse') return true;
  if (store.templateId === 'pet-house') return true;
  if (store.landingThemeVariant === 'pet-house') return true;
  return false;
}
