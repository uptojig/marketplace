/**
 * Case-studio design family — bespoke landing for casethep (phone-case store).
 *
 * Owns the visual language for the case-studio variant:
 *   - pure white background (#FFFFFF) with light gray surfaces
 *     (#F5F5F7 / #FAFAFA) layered between sections
 *   - coral-pink primary (#FF3366) for CTAs, kicker text and accents
 *   - near-black ink (#0A0A0F) on a muted gray (#6B7280) secondary
 *   - pastel category tints (pink / blue / yellow / green / purple / orange)
 *     for the type-grid blobs and product card backgrounds
 *   - Inter heavy weights (800-900) on headlines, tight tracking
 *     (-1px to -2px) for that modern phone-shop feel
 *   - bespoke pink gradient hero (#FFE5EC → #FFFFFF) with overlapping
 *     rotated phone-case SVG mockups on the right
 *
 * Wiring intent:
 *   - For now the only store opted in is `casethep` (matched by slug).
 *   - An operator can later assign templateId='case-studio' OR
 *     landingThemeVariant='case-studio' to onboard another phone-case
 *     store under the same homepage.
 *   - The detection gate is consumed by `app/stores/[slug]/page.tsx`
 *     BEFORE the existing render paths (right after the pet-house
 *     gate). When this returns true the bespoke `CaseStudioHomepage`
 *     renders inside the shared ShopHeader/ShopFooter chrome from
 *     `app/stores/[slug]/layout.tsx`.
 */

import type { Store } from '@prisma/client';

/**
 * Returns true when the given store should render the case-studio
 * custom homepage. Accepts a narrow shape so callers don't have to
 * pass the full Prisma Store row.
 */
export function isCaseStudioStore(
  store: Pick<Store, 'slug' | 'templateId' | 'landingThemeVariant'>,
): boolean {
  if (store.slug === 'casethep') return true;
  if (store.templateId === 'case-studio') return true;
  if (store.landingThemeVariant === 'case-studio') return true;
  return false;
}
