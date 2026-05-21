"use client";

import { SECTION_META } from "@/lib/storefront/section-meta";
import type { ThemeKey } from "@/lib/storefront/resolve-store-theme";
import type { ThemeConfig } from "@/lib/storefront/theme-config";

interface Props {
  /** Resolved content theme of the store (selects which homepage's sections to edit). */
  themeKey: ThemeKey;
  /** Current per-store section config (null = curated default order). */
  config: ThemeConfig | null;
  /** Current intentional accent override hex ("" = use the theme's curated color). */
  accentOverride: string;
  onConfigChange: (next: ThemeConfig | null) => void;
  onAccentChange: (hex: string) => void;
}

type Row = { id: string; label: string; hidden: boolean };

/**
 * Vendor-facing editor for the curated theme: reorder / hide the non-locked
 * homepage sections, and optionally override the theme's accent color. Writes
 * Store.themeConfig + Store.themeAccentOverride via the settings PATCH.
 *
 * Section order/visibility is rendered by applyThemeConfig() on the storefront;
 * locked sections (Hero) are pinned by the renderer regardless of this config.
 */
export function ThemeLayoutEditor({
  themeKey,
  config,
  accentOverride,
  onConfigChange,
  onAccentChange,
}: Props) {
  const meta = SECTION_META[themeKey] ?? [];
  const locked = meta.filter((m) => m.locked);
  const editableMeta = meta.filter((m) => !m.locked);

  // Ordered editable rows = config order first (known ids), then any default
  // sections the config omitted. Mirrors applyThemeConfig's merge so the editor
  // shows exactly what the storefront will render.
  const rows: Row[] = (() => {
    const byId = new Map(editableMeta.map((m) => [m.id, m]));
    const seen = new Set<string>();
    const out: Row[] = [];
    for (const s of config?.sections ?? []) {
      const m = byId.get(s.id);
      if (m && !seen.has(s.id)) {
        seen.add(s.id);
        out.push({ id: m.id, label: m.label, hidden: s.hidden === true });
      }
    }
    for (const m of editableMeta) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        out.push({ id: m.id, label: m.label, hidden: false });
      }
    }
    return out;
  })();

  function emit(next: Row[]) {
    onConfigChange({ v: 1, sections: next.map((r) => ({ id: r.id, hidden: r.hidden })) });
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    emit(next);
  }
  function toggle(i: number) {
    emit(rows.map((r, idx) => (idx === i ? { ...r, hidden: !r.hidden } : r)));
  }

  if (meta.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        ธีมปัจจุบันยังไม่รองรับการจัดเรียง section (ใช้เลย์เอาต์มาตรฐานของธีม)
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Accent override */}
      <div className="space-y-1">
        <label className="text-sm font-medium">สี Accent (ทับสีของธีม)</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(accentOverride) ? accentOverride : "#000000"}
            onChange={(e) => onAccentChange(e.target.value)}
            className="h-9 w-16 cursor-pointer rounded-md border border-input p-1"
          />
          <input
            value={accentOverride}
            onChange={(e) => onAccentChange(e.target.value)}
            placeholder="ใช้สีของธีม"
            className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {accentOverride && (
            <button
              type="button"
              onClick={() => onAccentChange("")}
              className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground"
            >
              ใช้สีธีม
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          เว้นว่าง = ใช้สีที่ธีมออกแบบไว้ (ไม่ใช่ palette ตอนสมัคร)
        </p>
      </div>

      {/* Section order / visibility */}
      <div className="space-y-2">
        <label className="text-sm font-medium">ลำดับ & การแสดง section</label>
        {locked.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 rounded-md border border-dashed border-input bg-muted/40 px-3 py-2 text-sm opacity-70"
          >
            <span className="flex-1">{m.label}</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              ตรึงด้านบน
            </span>
          </div>
        ))}
        {rows.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <span className={`flex-1 ${r.hidden ? "text-muted-foreground line-through" : ""}`}>
              {r.label}
            </span>
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="rounded border px-2 py-0.5 text-xs disabled:opacity-30"
              aria-label="เลื่อนขึ้น"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === rows.length - 1}
              className="rounded border px-2 py-0.5 text-xs disabled:opacity-30"
              aria-label="เลื่อนลง"
            >
              ↓
            </button>
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={!r.hidden} onChange={() => toggle(i)} />
              แสดง
            </label>
          </div>
        ))}
        {config && (
          <button
            type="button"
            onClick={() => onConfigChange(null)}
            className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground"
          >
            รีเซ็ตเป็นลำดับเริ่มต้นของธีม
          </button>
        )}
      </div>
    </div>
  );
}
