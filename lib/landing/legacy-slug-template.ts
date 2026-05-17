/**
 * Slug → templateId fallback for legacy stores.
 *
 * Stores created BEFORE the wizard v2 (which sets `templateId` on
 * every new Store row) have `templateId IS NULL`. The homepage and
 * buyer-page dispatchers all key off templateId for family detection,
 * so those legacy stores fall through to the generic product grid —
 * every legacy store looks identical no matter what they sell.
 *
 * Reported symptom (operator): "https://basketplace.co/stores/{slug}"
 *   for bikini551 / powerpuff678 / ergobodies / zugarbox all rendered
 *   the same homepage.
 *
 * Cheapest patch that doesn't require a DB write: this map. Each
 * known legacy slug is assigned a sensible `TemplateId` based on
 * what the store sells (the operator confirmed each store's niche).
 * The synthesized templateId is fed through `effectiveTemplateId(store)`
 * to the family helpers AND the wizard StoreRenderer, so the entire
 * family-bespoke pipeline kicks in on the homepage AND on every
 * other buyer page (cart, category, PDP, etc).
 *
 * To attach a NEW store via this map: drop in `{ slug: 'foo', tpl: 'lookbook' }`.
 * Better long-term: store the templateId on the Store row via admin
 * UI or a one-off SQL backfill. This map is a stopgap, not the
 * permanent home for the assignment.
 */

import type { TemplateId } from "@/lib/templates/types";

export const LEGACY_SLUG_TEMPLATE: Record<string, TemplateId> = {
  // Swimwear / bikini boutique → first consumer of the
  // multi-page template architecture (chrome + per-route page
  // components). See lib/templates/types.ts for the contract.
  bikini551: "bikini-beach",
  // Kids cartoon merch / playful tile-led → lifestyle kids-toys
  powerpuff678: "kids-toys",
  // Ergonomic body / wellness gear → lifestyle sport-active
  ergobodies: "sport-active",
  // Sugar / gift-box artisan → specialty handmade
  zugarbox: "handmade",
};

/**
 * Returns the store's effective templateId — its own column when set,
 * otherwise the legacy-slug fallback, otherwise null. Callers should
 * prefer this over reading `store.templateId` directly so legacy
 * stores get routed to the right family-bespoke design.
 */
export function effectiveTemplateId(store: {
  slug: string;
  templateId?: string | null;
}): string | null {
  if (store.templateId) return store.templateId;
  return LEGACY_SLUG_TEMPLATE[store.slug] ?? null;
}
