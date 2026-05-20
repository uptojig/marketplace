import { z } from "zod";
import { templates } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";
import { NICHES, PALETTES } from "@/lib/store/wizard-data";

// ─── Allowed values ────────────────────────────────────────────────────────
//
// Shared between the wizard server action, admin POST/PATCH, and vendor
// PATCH so all four entry-points enforce the same validation and trigger
// the same landingBlocks-clear / landingThemeVariant derivation side
// effects. Without this, the wizard wrote {templateId, paletteId, niche,
// brandVoice, landingThemeVariant} but the API endpoints accepted only
// landingThemeVariant — so anything created/edited outside the wizard
// fell back to the generic grid in app/stores/[slug]/page.tsx.

const TEMPLATE_IDS = Object.keys(templates) as TemplateId[];
const PALETTE_IDS = PALETTES.map((p) => p.id);
const NICHE_IDS = NICHES.map((n) => n.id);

// landingThemeVariant is what the family-detector chain in
// app/stores/[slug]/layout.tsx falls back to when templateId isn't set or
// isn't recognized. The detectors in lib/landing/*.ts accept this set:
const LANDING_THEME_VARIANTS = [
  "fashion-beauty",
  "B",
  "trust",
  "C",
  "business-model",
  "lifestyle",
  "A",
  "G",
  "electronics-tech",
  "E",
  "specialty",
  "H",
  "packaging",
  "taobao",
  "community",
  "everyday",
  "minimal",
  "cute",
] as const;

// Zod refinements — admin/vendor endpoints reuse these via .merge() / spread.
// All optional; only validated when the operator actually sends the field.

// `.nullable().optional()` — the form's serializeTemplateStyle() in
// components/store/template-style-picker.tsx emits `null` for blank
// dropdowns (so the API can clear the column). Plain `.optional()` would
// reject those payloads with "Expected string, received null" and 400 any
// save where the operator blanked a picker. `null` → assigned in the data
// merge (which uses `!== undefined`, not truthiness) → Prisma clears it.

export const templateIdField = z
  .string()
  .min(1)
  .max(40)
  .refine((v) => TEMPLATE_IDS.includes(v as TemplateId), {
    message: "Unknown templateId — see lib/templates/registry.ts",
  })
  .nullable()
  .optional();

export const paletteIdField = z
  .string()
  .min(1)
  .max(40)
  .refine((v) => PALETTE_IDS.includes(v), {
    message: "Unknown paletteId — see PALETTES in lib/store/wizard-data.ts",
  })
  .nullable()
  .optional();

export const nicheField = z
  .string()
  .min(1)
  .max(40)
  .refine((v) => (NICHE_IDS as string[]).includes(v), {
    message: "Unknown niche — see NICHES in lib/store/wizard-data.ts",
  })
  .nullable()
  .optional();

export const brandVoiceField = z
  .enum(["casual", "formal", "playful"])
  .nullable()
  .optional();

export const landingThemeVariantField = z
  .string()
  .min(1)
  .max(40)
  .refine(
    (v) => (LANDING_THEME_VARIANTS as readonly string[]).includes(v),
    { message: "Unknown landingThemeVariant" },
  )
  .nullable()
  .optional();

// Zod object slice you can `.extend(templateFieldsSchema.shape)` on
// existing schemas. Each field is optional; absent = don't touch the column.
export const templateFieldsSchema = z.object({
  templateId: templateIdField,
  paletteId: paletteIdField,
  niche: nicheField,
  brandVoice: brandVoiceField,
  landingThemeVariant: landingThemeVariantField,
});

export type TemplateFieldsInput = z.infer<typeof templateFieldsSchema>;

// ─── Derivation helpers ────────────────────────────────────────────────────

/**
 * When the operator sets templateId but doesn't ALSO send
 * landingThemeVariant in the same payload, derive the variant from
 * templates[templateId].group so the family-detector chain in
 * app/stores/[slug]/layout.tsx picks up the right design family.
 *
 * Same pattern as app/create-store/actions.ts ~L94-110.
 *
 * Returns the variant to write, or undefined to leave landingThemeVariant
 * untouched. An explicit operator-supplied value always wins.
 */
export function deriveLandingThemeVariant(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): string | undefined {
  // operator sent the key explicitly (even if null = clear) → respect their choice
  if (input.landingThemeVariant !== undefined) return undefined;
  if (!input.templateId) return undefined;
  const tpl = templates[input.templateId as TemplateId];
  return tpl?.group ?? undefined;
}

/**
 * A "skin-only" template is one without `chrome`/`pages` adapters — it
 * renders via the family-detector chain instead of the bespoke
 * Header/Footer/Homepage adapters. When an operator changes templateId
 * to a skin-only template, we must clear landingBlocks so the detector
 * actually runs (otherwise the legacy AI-generated landingBlocks JSON
 * keeps rendering via MultiPageRenderer and the new template "doesn't
 * work").
 */
export function isSkinOnlyTemplate(templateId: string): boolean {
  const tpl = templates[templateId as TemplateId];
  if (!tpl) return false;
  return tpl.chrome === undefined;
}

/**
 * Side-effect columns to clear when an operator picks a new
 * landingThemeVariant OR changes templateId to a skin-only template.
 *
 * Matches the existing admin PATCH behavior at
 * app/api/admin/stores/[id]/route.ts:142-152.
 */
export const LANDING_CLEAR_PATCH = {
  landingBlocks: null,
  landingTitle: null,
  landingGeneratedAt: null,
  landingStatus: null,
  landingError: null,
} as const;
