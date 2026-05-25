/**
 * template-groups.ts — SINGLE SOURCE OF TRUTH for template → family mapping.
 *
 * Previously this mapping was duplicated in 3 places:
 *   1. lib/templates/registry.ts → templateGroups
 *   2. lib/landing/*.ts → TEMPLATE_IDS sets (trust.ts, fashion-beauty.ts, etc.)
 *   3. lib/store/seed-ui-config.ts → TEMPLATE_GROUPS
 *
 * Now all three derive from this file. Adding or removing a template
 * requires editing ONLY this file + lib/templates/types.ts (TemplateId).
 */
import type { TemplateId, TemplateGroup } from './types';

/**
 * Canonical mapping: TemplateGroup → TemplateId[].
 * Every TemplateId MUST appear in exactly one group.
 */
export const TEMPLATE_GROUPS_MAP: Record<TemplateGroup, readonly TemplateId[]> = {
  trust: ['classic', 'atelier-27'],
  'fashion-beauty': [
    'lookbook', 'bikini-beach', 'brutalist-thai', 'mono-eight', 'lila-modest',
    'caldera-skin', 'hinoki-apothecary', 'linen-and-loom', 'reclaim-leather',
    'sirin-womenswear', 'yumeiro-lip',
    'konvy',
  ],
  'electronics-tech': [
    'tech-compare', 'carbon-era-cameras', 'keystroke-lab',
    'smartloop-home', 'wavelength-audio'],
  lifestyle: [
    'sport-active', 'mega-store', 'glow-lamp-co', 'inkstone-paper',
    'korakot-house', 'petit-cote', 'saluki-yoga',
    'tinyhand-wooden-toys', 'trailcraft-outdoors',
    'gridmodu',
    'motofog',
  ],
  community: ['live-commerce'],
  'business-model': ['wholesale-b2b', 'eco-pack', 'bulkbox-industrial'],
  specialty: ['handmade', 'sai-sing', 'mai-hatthakam', 'pigment-studio', 'casethep', 'casetify-clone', 'caseinw'],
  everyday: ['everyday-retail', 'talad-see-sod'],
  taobao: ['taobao-style'],
  packaging: ['packaging-supply', 'pastel-pack', 'omnipack', 'blackwrapp'],
  neon: ['neon-festival'],
} as const;

/** Inverse lookup: TemplateId → TemplateGroup. */
export const TEMPLATE_TO_GROUP: ReadonlyMap<TemplateId, TemplateGroup> = (() => {
  const m = new Map<TemplateId, TemplateGroup>();
  for (const [group, ids] of Object.entries(TEMPLATE_GROUPS_MAP)) {
    for (const id of ids) {
      m.set(id as TemplateId, group as TemplateGroup);
    }
  }
  return m;
})();

/**
 * Build a ReadonlySet of TemplateIds for a given family.
 * Used by family detectors (lib/landing/*.ts) to replace hardcoded sets.
 */
export function templateIdsForGroup(group: TemplateGroup): ReadonlySet<TemplateId> {
  return new Set(TEMPLATE_GROUPS_MAP[group]);
}

/**
 * Get the TemplateGroup for a given TemplateId.
 * Returns undefined if the id is unknown.
 */
export function groupForTemplate(id: string | null | undefined): TemplateGroup | undefined {
  if (!id) return undefined;
  return TEMPLATE_TO_GROUP.get(id as TemplateId);
}
