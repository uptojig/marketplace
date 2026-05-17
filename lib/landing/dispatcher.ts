/**
 * Family-dispatcher precedence helper.
 *
 * Both `app/stores/[slug]/page.tsx` (homepage choice) and
 * `app/stores/[slug]/layout.tsx` (chrome CSS family) detect a store's
 * design family with the same cascade:
 *
 *   isFashionBeautyStore → isTrustStore → isBusinessModelStore →
 *   isLifestyleStore → isElectronicsTechStore → isSpecialtyStore
 *
 * Each detector accepts `{ templateId, landingThemeVariant }` and
 * returns true if EITHER the templateId or the variant matches its
 * family. That cascade evaluates templateId-derived hits first, which
 * means a store pinned to (for example) `templateId='sport-active'`
 * (lifestyle) stays lifestyle even after the operator picks
 * "business-model" in the admin theme picker (PR #97) — the BM branch
 * never gets a chance because isLifestyle already returned true.
 *
 * `hasVariantFamilyOverride` returns true when the variant string maps
 * to one of the six family variant sets. Callers use it to NULL OUT
 * templateId before feeding the cascade, so a variant hit takes
 * absolute precedence over the legacy slug→template inference.
 */

import { isFashionBeautyStore } from "./fashion-beauty";
import { isTrustStore } from "./trust";
import { isBusinessModelStore } from "./business-model";
import { isLifestyleStore } from "./lifestyle";
import { isElectronicsTechStore } from "./electronics-tech";
import { isSpecialtyStore } from "./specialty";

export function hasVariantFamilyOverride(
  variant: string | null | undefined,
): boolean {
  if (!variant) return false;
  const key = { templateId: null, landingThemeVariant: variant };
  return (
    isFashionBeautyStore(key) ||
    isTrustStore(key) ||
    isBusinessModelStore(key) ||
    isLifestyleStore(key) ||
    isElectronicsTechStore(key) ||
    isSpecialtyStore(key)
  );
}
