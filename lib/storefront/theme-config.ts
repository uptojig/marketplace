import type { ReactNode } from "react";

/**
 * theme-config — per-store section layout (order + visibility) for the curated
 * theme Homepages.
 *
 * A theme Homepage declares an ordered list of SectionSlots (its default
 * layout). `applyThemeConfig` reorders / hides them according to a per-store
 * ThemeConfig (operator choice). When the store has no config (the common case
 * today — the Store.themeConfig column is added later in Phase 3), it returns
 * the slots unchanged, so the Homepage renders its curated default layout.
 *
 * Invariants (so a malformed/partial config can never blank a page):
 *   - null / wrong-version / non-array config → default order, all visible.
 *   - `locked` slots keep their default position and can't be hidden.
 *   - default slots omitted from the config are appended (a newly-shipped
 *     section still shows for stores whose saved config predates it).
 *   - unknown ids in the config are ignored.
 */

export interface ThemeConfig {
  v: 1;
  /** Ordered section ids. `hidden: true` removes the section. Order = array order. */
  sections: { id: string; hidden?: boolean }[];
}

export interface SectionSlot {
  id: string;
  /** Pinned: keeps default position, can't be hidden/reordered (e.g. Hero). */
  locked?: boolean;
  /** Operator may hide it in the editor. */
  hideable?: boolean;
  /** Operator may reorder it in the editor. */
  reorderable?: boolean;
  /** Renders the section (server component subtree). */
  render: () => ReactNode;
}

/** Narrow an unknown JSON value (Store.themeConfig) to a valid ThemeConfig. */
export function parseThemeConfig(value: unknown): ThemeConfig | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.v !== 1 || !Array.isArray(v.sections)) return null;
  const sections = v.sections
    .filter(
      (s): s is { id: string; hidden?: boolean } =>
        !!s && typeof s === "object" && typeof (s as { id?: unknown }).id === "string",
    )
    .map((s) => ({ id: s.id, hidden: s.hidden === true }));
  return { v: 1, sections };
}

export function applyThemeConfig(
  slots: SectionSlot[],
  config: ThemeConfig | null | undefined,
): SectionSlot[] {
  // No / invalid config → curated default (order as declared, all visible).
  if (!config || config.v !== 1 || !Array.isArray(config.sections)) {
    return slots;
  }

  const byId = new Map(slots.map((s) => [s.id, s]));
  const used = new Set<string>();
  const result: SectionSlot[] = [];

  // 1. Operator order/visibility for non-locked, known slots.
  for (const entry of config.sections) {
    const slot = byId.get(entry.id);
    if (!slot || slot.locked || used.has(slot.id)) continue;
    used.add(slot.id);
    if (entry.hidden) continue; // hidden → drop
    result.push(slot);
  }
  // 2. Append default slots the config omitted (newly-shipped sections).
  for (const slot of slots) {
    if (slot.locked || used.has(slot.id)) continue;
    used.add(slot.id);
    result.push(slot);
  }
  // 3. Re-insert locked slots at their default position (never hidden/moved).
  for (const slot of slots) {
    if (!slot.locked) continue;
    const defaultIndex = slots.findIndex((s) => s.id === slot.id);
    result.splice(Math.min(defaultIndex, result.length), 0, slot);
  }
  return result;
}
