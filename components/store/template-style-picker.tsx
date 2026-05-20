"use client";

/**
 * TemplateStylePicker
 *
 * Shared "Template & Style" UI used by:
 *   • app/admin/stores/[id]/edit-form.tsx       (admin edit)
 *   • app/admin/stores/new/page.tsx             (admin new store)
 *   • components/dashboard/store-settings-form.tsx (vendor settings)
 *
 * Renders the 5 fields that drive storefront rendering:
 *   1. templateId            — picks the storefront template (26 entries)
 *   2. paletteId             — picks the palette preset (8 entries)
 *   3. niche                 — picks the store niche (11 entries)
 *   4. brandVoice            — casual / formal / playful (3-way toggle)
 *   5. landingThemeVariant   — optional override of the family auto-mapped
 *                              from templateId. Empty string ("") means
 *                              "auto from templateId" and the caller MUST
 *                              omit it from the PATCH body (the API treats
 *                              missing as "no write").
 *
 * All choices are populated from the single-source-of-truth catalogs:
 *   • lib/templates/registry.ts  → `templates` + `templateGroups`
 *   • lib/store/wizard-data.ts   → `PALETTES`, `NICHES`
 *
 * The component is fully controlled — parent owns the state. We expose a
 * single `onChange(partial)` for batched updates so react-hook-form and
 * useState-based forms can both consume it.
 */

import { useMemo } from "react";
import { templates, templateGroups } from "@/lib/templates/registry";
import { PALETTES, NICHES } from "@/lib/store/wizard-data";

/**
 * Allowed values for the optional `landingThemeVariant` override. Mirrors
 * the family-detector list the storefront router recognises. Empty string
 * means "auto from templateId" and is converted to `undefined` by the
 * sanitiser below before being POSTed.
 */
const LANDING_THEME_VARIANTS: { value: string; label: string }[] = [
  { value: "", label: "— auto จาก templateId —" },
  { value: "fashion-beauty", label: "fashion-beauty" },
  { value: "B", label: "B (legacy)" },
  { value: "trust", label: "trust" },
  { value: "C", label: "C (legacy)" },
  { value: "business-model", label: "business-model · B2B" },
  { value: "lifestyle", label: "lifestyle" },
  { value: "A", label: "A (legacy)" },
  { value: "G", label: "G (legacy)" },
  { value: "electronics-tech", label: "electronics-tech" },
  { value: "E", label: "E (legacy)" },
  { value: "specialty", label: "specialty" },
  { value: "H", label: "H (legacy)" },
  { value: "packaging", label: "packaging · bright SMB supply" },
  { value: "taobao", label: "taobao · marketplace bold" },
  { value: "community", label: "community · live-commerce" },
  { value: "everyday", label: "everyday · Shopee-style" },
  { value: "minimal", label: "minimal · legacy single-page (A)" },
  { value: "cute", label: "cute · legacy single-page (I)" },
];

export type TemplateStyleValues = {
  templateId: string;
  paletteId: string;
  niche: string;
  brandVoice: string;
  landingThemeVariant: string;
};

/**
 * Returns a body fragment with the 5 fields ready to be merged into the
 * PATCH/POST payload. The `landingThemeVariant` field is omitted when the
 * operator left it as "auto from templateId" — the API agent maps absent
 * → no write, so this is how the UI signals "don't touch the column".
 *
 * Empty strings for the other fields are converted to `null` so the API
 * can clear them when the operator deliberately blanks the dropdown.
 */
export function serializeTemplateStyle(v: TemplateStyleValues): {
  templateId: string | null;
  paletteId: string | null;
  niche: string | null;
  brandVoice: string | null;
  landingThemeVariant?: string;
} {
  return {
    templateId: v.templateId === "" ? null : v.templateId,
    paletteId: v.paletteId === "" ? null : v.paletteId,
    niche: v.niche === "" ? null : v.niche,
    brandVoice: v.brandVoice === "" ? null : v.brandVoice,
    ...(v.landingThemeVariant === ""
      ? {}
      : { landingThemeVariant: v.landingThemeVariant }),
  };
}

/**
 * Returns true when the user is about to switch templateId compared to
 * the snapshot they originally loaded. Used to gate a confirm() dialog
 * before submit — switching the template clears AI-generated landing
 * blocks server-side.
 */
export function templateIdChanged(
  initial: string,
  current: string,
): boolean {
  return (initial ?? "") !== (current ?? "");
}

export function TemplateStylePicker({
  values,
  onChange,
  className = "",
  /**
   * When true, render inside an existing card/section — caller already
   * provides the surrounding "Section" wrapper. When false, the picker
   * provides its own bordered card.
   */
  embedded = false,
}: {
  values: TemplateStyleValues;
  onChange: (next: Partial<TemplateStyleValues>) => void;
  className?: string;
  embedded?: boolean;
}) {
  // Build the grouped option list off the source-of-truth registry so
  // newly-added templates appear here automatically with no edit needed.
  const groupedOptions = useMemo(() => {
    const known = new Set<string>();
    const groups: { group: string; items: { id: string; name: string }[] }[] = [];

    for (const [group, ids] of Object.entries(templateGroups)) {
      const items: { id: string; name: string }[] = [];
      for (const id of ids) {
        const t = templates[id];
        if (t) {
          items.push({ id, name: t.name });
          known.add(id);
        }
      }
      if (items.length) groups.push({ group, items });
    }

    // Bucket "other" — any registry entry not listed in templateGroups
    // (e.g. the per-template mini-apps eco-pack / mega-store / bikini-
    // beach / everyday-retail / taobao-style / packaging-supply). Group
    // them by their `template.group` so we don't lose the categorisation.
    const otherByGroup: Record<string, { id: string; name: string }[]> = {};
    for (const id of Object.keys(templates)) {
      if (known.has(id)) continue;
      const t = templates[id as keyof typeof templates];
      const g = t.group ?? "other";
      (otherByGroup[g] ??= []).push({ id, name: t.name });
    }
    for (const [group, items] of Object.entries(otherByGroup)) {
      // If we already emitted a group with the same key, merge into it.
      const existing = groups.find((g) => g.group === group);
      if (existing) {
        existing.items.push(...items);
      } else {
        groups.push({ group, items });
      }
    }

    return groups;
  }, []);

  const activeTemplate = values.templateId
    ? templates[values.templateId as keyof typeof templates]
    : null;
  const activePalette = PALETTES.find((p) => p.id === values.paletteId);
  const activeNiche = NICHES.find((n) => n.id === values.niche);

  const body = (
    <div className={`space-y-5 ${className}`}>
      {/* Template */}
      <div>
        <label className="mb-1 block text-sm font-medium">Template</label>
        <select
          value={values.templateId}
          onChange={(e) => onChange({ templateId: e.target.value })}
          className="w-full rounded-md border bg-white px-3 py-2 text-sm"
        >
          <option value="">— ไม่ตั้งค่า (auto) —</option>
          {groupedOptions.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {activeTemplate && (
          <p className="mt-1 text-xs text-muted-foreground">
            {activeTemplate.description}
          </p>
        )}
      </div>

      {/* Palette */}
      <div>
        <label className="mb-1 block text-sm font-medium">Palette</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PALETTES.map((p) => {
            const selected = values.paletteId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ paletteId: p.id })}
                className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition ${
                  selected
                    ? "border-black bg-gray-50 ring-1 ring-black"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <span
                  className="inline-block h-4 w-4 shrink-0 rounded-full border"
                  style={{ backgroundColor: p.primary }}
                />
                <span className="truncate">{p.name}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onChange({ paletteId: "" })}
            className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition ${
              values.paletteId === ""
                ? "border-black bg-gray-50 ring-1 ring-black"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <span className="inline-block h-4 w-4 shrink-0 rounded-full border border-dashed" />
            <span className="truncate text-muted-foreground">ไม่ตั้งค่า</span>
          </button>
        </div>
        {activePalette && (
          <p className="mt-1 text-xs text-muted-foreground">
            primary {activePalette.primary} · accent {activePalette.accent}
          </p>
        )}
      </div>

      {/* Niche */}
      <div>
        <label className="mb-1 block text-sm font-medium">Niche</label>
        <select
          value={values.niche}
          onChange={(e) => onChange({ niche: e.target.value })}
          className="w-full rounded-md border bg-white px-3 py-2 text-sm"
        >
          <option value="">— ไม่ตั้งค่า —</option>
          {NICHES.map((n) => (
            <option key={n.id} value={n.id}>
              {n.emoji} {n.label}
            </option>
          ))}
        </select>
        {activeNiche && activeNiche.recommendedTemplates.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            แนะนำ:{" "}
            {activeNiche.recommendedTemplates
              .slice(0, 3)
              .map((id) => templates[id as keyof typeof templates]?.name ?? id)
              .join(" · ")}
          </p>
        )}
      </div>

      {/* Brand voice — 3-button toggle */}
      <div>
        <label className="mb-1 block text-sm font-medium">Brand voice</label>
        <div className="inline-flex rounded-md border bg-white p-0.5 text-sm">
          {(["casual", "formal", "playful"] as const).map((v) => {
            const selected = values.brandVoice === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ brandVoice: v })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  selected
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>

      {/* Landing theme variant — explicit override */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Landing theme variant{" "}
          <span className="font-normal text-muted-foreground">(override)</span>
        </label>
        <select
          value={values.landingThemeVariant}
          onChange={(e) => onChange({ landingThemeVariant: e.target.value })}
          className="w-full rounded-md border bg-white px-3 py-2 text-sm"
        >
          {LANDING_THEME_VARIANTS.map((v) => (
            <option key={v.value || "__auto__"} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          ปกติ <code className="font-mono">templateId</code> เป็นสัญญาณหลัก —
          ตั้งค่านี้เฉพาะกรณีต้องการบังคับ family เฉพาะ (เช่นใช้ taobao กับร้านที่ไม่ใช่ taobao-style)
        </p>
      </div>
    </div>
  );

  if (embedded) return body;
  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="mb-1 font-semibold">Template &amp; Style</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        เลือก template ของหน้าร้าน + palette + niche + brand voice — ค่าเหล่านี้กำหนดวิธี render หน้าร้าน
      </p>
      {body}
    </div>
  );
}
