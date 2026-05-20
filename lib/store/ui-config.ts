import { z } from "zod";

// Server-driven UI config schema — describes which shadcn-studio blocks to
// compose for each route of a per-store storefront. Lives in
// `StoreLandingContent.uiConfig` (JSONB) so each of the 27 demo stores can
// declare a unique recipe without any per-store code.
//
// Block ids reference keys in `lib/registry/block-registry.tsx`. The
// renderer (`components/storefront/block-renderer.tsx`) looks up each id,
// lazy-loads the component via `next/dynamic`, and renders it with the
// store's editable content (`StoreLandingContent`) supplied as props.

// ─── Theme tokens (shadcn-friendly) ────────────────────────────────────

export const uiConfigThemeSchema = z.object({
  /** PaletteId from `lib/store/wizard-data.ts` PALETTES or "custom". */
  palette: z.string().min(1).max(40),
  /** Google Thai sans for body copy (Prompt | Kanit | Google Sans | …). */
  fontPrimary: z.string().min(1).max(60),
  /** Google Thai sans for display / headlines. */
  fontDisplay: z.string().min(1).max(60),
});
export type UIConfigTheme = z.infer<typeof uiConfigThemeSchema>;

// ─── Home page — array of composable blocks ────────────────────────────

/**
 * A single composable block in the home page recipe. `id` MUST match a key
 * in BlockRegistry. `type` is a free-form category label for editor UI
 * grouping; it's not used by the renderer for lookup.
 */
export const uiConfigBlockSchema = z.object({
  type: z.string().min(1).max(40),
  id: z.string().min(1).max(80),
  /** Optional per-instance overrides the block can read alongside store
   *  content (e.g. a heading override, a "show ratings" toggle). */
  data: z.record(z.unknown()).optional(),
});
export type UIConfigBlock = z.infer<typeof uiConfigBlockSchema>;

// ─── Pages — home is an array, other routes are single block ids ──────

export const uiConfigPagesSchema = z.object({
  /** Ordered block list rendered top-to-bottom on the storefront home. */
  home: z.array(uiConfigBlockSchema).min(1).max(20),
  /** Single block id for the product-detail page. */
  pdp: z.string().min(1).max(80),
  /** Single block id for the catalog / category listing. */
  catalog: z.string().min(1).max(80),
  /** Single block id for the cart. */
  cart: z.string().min(1).max(80),
  /** Optional — checkout block id. Falls back to default when absent. */
  checkout: z.string().min(1).max(80).optional(),
  /** Optional — about page block id. */
  about: z.string().min(1).max(80).optional(),
});
export type UIConfigPages = z.infer<typeof uiConfigPagesSchema>;

// ─── Top-level shape ─────────────────────────────────────────────────────

export const uiConfigSchema = z.object({
  theme: uiConfigThemeSchema,
  pages: uiConfigPagesSchema,
});
export type UIConfig = z.infer<typeof uiConfigSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────

/**
 * Parse a raw JSON value (from Prisma's Json column) into a typed UIConfig.
 * Returns null when the input is null/undefined OR fails validation — the
 * renderer chain treats both cases as "no uiConfig" and falls back to the
 * legacy family-detector path.
 */
export function parseUIConfig(raw: unknown): UIConfig | null {
  if (!raw) return null;
  const parsed = uiConfigSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/** Convenience — returns the home block list or [] when uiConfig is null. */
export function homeBlocks(config: UIConfig | null): UIConfigBlock[] {
  return config?.pages.home ?? [];
}
