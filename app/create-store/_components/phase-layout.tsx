"use client";

import { useState } from "react";
import {
  rankThemes,
  themeForTemplate,
  TEMPLATES,
  type ThemeOption,
  type Template,
  type TemplateId,
  type TemplateGroup,
  type WizardState,
  type NicheId,
  getNiche,
} from "@/lib/store/wizard-data";

type Props = {
  state: WizardState;
  onChange: (patch: Partial<WizardState["layout"]>) => void;
  onIdentityChange?: (patch: Partial<WizardState["identity"]>) => void;
};

/**
 * Hierarchical picker — 10 main family sections, each with sub-template
 * cards underneath. User can pick the family default (writes the family's
 * representative templateId from THEME_OPTIONS) OR a specific sub-template
 * (writes that exact templateId). Highlighted card always matches the
 * exact saved templateId.
 *
 * Recommended sub-templates surface in a separate top section when the
 * user has picked a niche in Phase 1.
 */
export function PhaseLayout({ state, onChange, onIdentityChange: _onIdentityChange }: Props) {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<TemplateGroup>>(
    new Set(),
  );
  const { recommended: recFamilies, others: otherFamilies } = rankThemes(
    state.identity.niche,
  );
  const allFamilies = [...recFamilies, ...otherFamilies];

  // Active templateId — used by both family cards (when their representative
  // matches) and sub-template cards (when their exact id matches).
  const activeTemplateId = state.layout.templateId;

  // Recommended sub-templates surfaced from the niche, regardless of family.
  // Gives users a faster path to "this specific look" rather than digging
  // through 10 families.
  const recSubTemplates = recommendedSubTemplates(state.identity.niche);

  const toggleFamily = (group: TemplateGroup) => {
    setExpandedFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-mp-ink-muted">
          ขั้นที่ 2 · ธีม
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          เลือกธีมที่เหมาะกับร้าน
        </h2>
        <p className="text-sm text-mp-ink-muted">
          เลือก <strong>หมวดหลัก</strong> หรือกางออกเพื่อเลือก{" "}
          <strong>สไตล์ย่อย</strong> ที่ตรงกับร้านมากที่สุด · ปรับสี/โลโก้ได้ภายหลัง
        </p>
      </header>

      {recSubTemplates.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-mp-ink">
              แนะนำสำหรับคุณ
            </span>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
              AI
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {recSubTemplates.map((tpl) => (
              <SubTemplateCard
                key={tpl.id}
                template={tpl}
                active={tpl.id === activeTemplateId}
                onSelect={() => onChange({ templateId: tpl.id })}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-mp-ink">
            ทุกหมวดหลัก
          </span>
          <span className="text-[11px] text-mp-ink-muted">
            ({allFamilies.length} หมวด · {TEMPLATES.length} สไตล์ย่อย)
          </span>
        </div>

        <div className="space-y-3">
          {allFamilies.map((family) => {
            const subs = subTemplatesFor(family.key);
            const isExpanded = expandedFamilies.has(family.key);
            const familyActive =
              activeTemplateId === family.templateId ||
              subs.some((s) => s.id === activeTemplateId);

            return (
              <div
                key={family.key}
                className={`rounded-lg border transition ${
                  familyActive
                    ? "border-mp-coral/60 bg-white"
                    : "border-mp-border bg-white"
                }`}
              >
                <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-[1fr_auto]">
                  <FamilyCard
                    family={family}
                    active={activeTemplateId === family.templateId}
                    onSelect={() => onChange({ templateId: family.templateId })}
                  />
                  {subs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleFamily(family.key)}
                      className="self-start rounded-md border border-mp-border bg-mp-cream-alt/40 px-2.5 py-1.5 text-[11px] font-medium text-mp-ink hover:bg-mp-cream-alt/70"
                    >
                      {isExpanded
                        ? `↑ ซ่อนสไตล์ย่อย`
                        : `↓ ดูสไตล์ย่อย (${subs.length})`}
                    </button>
                  )}
                </div>

                {isExpanded && subs.length > 0 && (
                  <div className="border-t border-mp-border/60 bg-mp-cream-alt/20 p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {subs.map((tpl) => (
                        <SubTemplateCard
                          key={tpl.id}
                          template={tpl}
                          active={tpl.id === activeTemplateId}
                          onSelect={() => onChange({ templateId: tpl.id })}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ─── Data helpers ──────────────────────────────────────────────────────

function subTemplatesFor(group: TemplateGroup): Template[] {
  return TEMPLATES.filter((t) => t.group === group);
}

/**
 * Sub-templates whose niche is explicitly listed in
 * `NICHES[nicheId].recommendedTemplates`. Empty when no niche yet.
 */
function recommendedSubTemplates(nicheId: NicheId | null): Template[] {
  if (!nicheId) return [];
  const niche = getNiche(nicheId);
  const ids = niche?.recommendedTemplates ?? [];
  return ids
    .map((id) => TEMPLATES.find((t) => t.id === id))
    .filter((t): t is Template => Boolean(t));
}

// ─── Card components ───────────────────────────────────────────────────

function FamilyCard({
  family,
  active,
  onSelect,
}: {
  family: ThemeOption;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex items-center gap-3 rounded-md border p-2.5 text-left transition ${
        active
          ? "border-mp-coral bg-white ring-2 ring-mp-coral/20"
          : "border-mp-border bg-white hover:border-mp-coral/60"
      }`}
    >
      <div className="h-12 w-16 overflow-hidden rounded-md bg-mp-cream-alt/60">
        <TemplateThumb id={family.templateId} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-mp-ink">
          {family.name}
        </p>
        <p className="text-[11px] leading-snug text-mp-ink-muted">
          {family.description}
        </p>
      </div>
    </button>
  );
}

function SubTemplateCard({
  template,
  active,
  onSelect,
}: {
  template: Template;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex flex-col rounded-lg border p-3 text-left transition ${
        active
          ? "border-mp-coral bg-white ring-2 ring-mp-coral/20"
          : "border-mp-border bg-white hover:border-mp-coral/60"
      }`}
    >
      <div className="mb-2 h-14 overflow-hidden rounded-md bg-mp-cream-alt/60">
        <TemplateThumb id={template.id} />
      </div>
      <p className="text-sm font-medium text-mp-ink">{template.name}</p>
      <p className="text-[11px] leading-snug text-mp-ink-muted">
        {template.description}
      </p>
    </button>
  );
}

// ─── Schematic thumbs (unchanged from previous picker) ─────────────────

function TemplateThumb({ id }: { id: TemplateId }) {
  switch (id) {
    case "brutalist-thai":
      return <Thumb header band="everyday-red" body="grid-2-badges" />;
    case "mono-eight":
      return <Thumb header band="hero-small" body="grid-2-airy" />;
    case "lila-modest":
    case "sirin-womenswear":
      return <Thumb header band="portrait" body="grid-2-edit" />;
    case "atelier-27":
    case "pigment-studio":
    case "reclaim-leather":
      return <Thumb header band="hero-small" body="story-grid" />;
    case "bulkbox-industrial":
      return <Thumb header band="cover" body="list-spec" />;
    case "caldera-skin":
      return <Thumb header band="hero-small" body="list-spec" />;
    case "carbon-era-cameras":
    case "keystroke-lab":
    case "smartloop-home":
      return <Thumb header band="compare" body="grid-3-dense" />;
    case "glow-lamp-co":
    case "korakot-house":
    case "linen-and-loom":
    case "petit-cote":
    case "saluki-yoga":
    case "tinyhand-wooden-toys":
    case "trailcraft-outdoors":
      return <Thumb header band="lifestyle" body="scene-grid" />;
    case "hinoki-apothecary":
      return <Thumb header band="text-hero" body="story-grid" />;
    case "inkstone-paper":
      return <Thumb header band="cover" body="grid-2-airy" />;
    case "mai-hatthakam":
    case "sai-sing":
      return <Thumb header band="portrait" body="story-grid" />;
    case "wavelength-audio":
      return <Thumb header band="hero-large" body="single" />;
    case "yumeiro-lip":
      return <Thumb header band="cover" body="swatch-grid" />;
    default:
      return <Thumb header band="cover" body="grid-2" />;
  }
}

function Thumb({
  header = true,
  band,
  body,
}: {
  header?: boolean;
  band: string;
  body: string;
}) {
  return (
    <div className="flex h-full w-full flex-col gap-0.5 bg-white p-1">
      {header && <div className="h-1 rounded-sm bg-zinc-300" />}
      <Band kind={band} />
      <Body kind={body} />
    </div>
  );
}

function Band({ kind }: { kind: string }) {
  if (kind === "none") return null;
  if (kind === "portrait")
    return <div className="h-5 rounded-sm bg-gradient-to-br from-zinc-400 to-zinc-300" />;
  if (kind === "hero-large")
    return <div className="h-4 rounded-sm bg-gradient-to-br from-zinc-700 to-zinc-500" />;
  if (kind === "hero-small")
    return <div className="h-2 rounded-sm bg-mp-cream-alt" />;
  if (kind === "text-hero")
    return (
      <div className="flex h-4 flex-col justify-center gap-0.5 rounded-sm bg-mp-cream-alt/40 px-1">
        <div className="h-0.5 w-8 rounded bg-zinc-400" />
        <div className="h-0.5 w-5 rounded bg-zinc-300" />
      </div>
    );
  if (kind === "lifestyle")
    return <div className="h-4 rounded-sm bg-gradient-to-tr from-amber-200 to-rose-200" />;
  if (kind === "live")
    return (
      <div className="flex h-4 items-center justify-end rounded-sm bg-mp-ink px-1">
        <span className="h-1 w-2 rounded-sm bg-red-500" />
      </div>
    );
  if (kind === "compare")
    return (
      <div className="flex h-3 gap-0.5">
        <div className="flex-1 rounded-sm bg-mp-cream-alt" />
        <div className="flex-1 rounded-sm bg-mp-cream-alt" />
        <div className="flex-1 rounded-sm bg-mp-cream-alt" />
      </div>
    );
  if (kind === "chips")
    return (
      <div className="flex h-2 gap-0.5">
        <div className="h-full w-3 rounded-full bg-zinc-300" />
        <div className="h-full w-4 rounded-full bg-mp-cream-alt" />
        <div className="h-full w-3 rounded-full bg-mp-cream-alt" />
      </div>
    );
  if (kind === "countdown")
    return (
      <div className="flex h-2 items-center justify-center rounded-sm bg-red-500">
        <span className="h-0.5 w-6 rounded bg-white/70" />
      </div>
    );
  if (kind === "everyday-red")
    return (
      <div className="flex h-4 items-center justify-center rounded-sm bg-zinc-900 px-1">
        <span className="h-0.5 w-8 rounded bg-red-500" />
      </div>
    );
  if (kind === "taobao-gradient")
    return (
      <div
        className="flex h-5 items-center justify-end rounded-sm px-1"
        style={{ background: 'linear-gradient(135deg, #FF4D00 0%, #FF1A1A 50%, #FF3D8B 100%)' }}
      >
        <span className="h-1 w-4 rounded bg-yellow-300" />
      </div>
    );
  if (kind === "packaging-pink")
    return (
      <div className="flex h-4 items-center justify-center gap-0.5 rounded-sm px-1" style={{ background: '#FFF0F6' }}>
        <span className="h-0.5 w-3 rounded" style={{ background: '#FF4E8B' }} />
        <span className="h-0.5 w-3 rounded" style={{ background: '#FFD93D' }} />
        <span className="h-0.5 w-3 rounded" style={{ background: '#3B82F6' }} />
      </div>
    );
  return <div className="h-3 rounded-sm bg-mp-cream-alt" />;
}

function Body({ kind }: { kind: string }) {
  const baseGrid = "grid flex-1 gap-0.5";
  const tile = "rounded-sm bg-mp-cream-alt/60";

  if (kind === "single") return <div className="flex-1 rounded-sm bg-mp-cream-alt" />;
  if (kind === "calendar")
    return (
      <div className={`${baseGrid} grid-cols-4 grid-rows-2`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={tile} />
        ))}
      </div>
    );
  if (kind === "video-grid")
    return (
      <div className={`${baseGrid} grid-cols-2 grid-rows-2`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-sm bg-gradient-to-b from-zinc-300 to-zinc-100" />
        ))}
      </div>
    );
  if (kind === "tiles-grid")
    return (
      <div className={`${baseGrid} grid-cols-4`}>
        <div className="rounded-sm bg-rose-200" />
        <div className="rounded-sm bg-amber-200" />
        <div className="rounded-sm bg-sky-200" />
        <div className="rounded-sm bg-emerald-200" />
      </div>
    );
  if (kind === "scene-grid")
    return (
      <div className={`${baseGrid} grid-cols-2`}>
        <div className="rounded-sm bg-gradient-to-br from-amber-100 to-rose-100" />
        <div className={tile} />
      </div>
    );
  if (kind === "story-grid")
    return (
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="h-1.5 w-12 rounded-sm bg-zinc-300" />
        <div className={`${baseGrid} grid-cols-2 flex-1`}>
          <div className={tile} />
          <div className={tile} />
        </div>
      </div>
    );
  if (kind === "swatch-grid")
    return (
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex gap-0.5">
          {["#fda4af", "#fcd34d", "#a5b4fc", "#86efac"].map((c) => (
            <span key={c} className="h-1 flex-1 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className={`${baseGrid} grid-cols-2 flex-1`}>
          <div className={tile} />
          <div className={tile} />
        </div>
      </div>
    );
  if (kind === "list-spec")
    return (
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="h-1.5 rounded-sm bg-mp-cream-alt/60" />
        <div className="h-1.5 rounded-sm bg-mp-cream-alt/60" />
        <div className="h-1.5 rounded-sm bg-mp-cream-alt/60" />
      </div>
    );
  if (kind === "grid-3-dense")
    return (
      <div className={`${baseGrid} grid-cols-3`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={tile} />
        ))}
      </div>
    );
  if (kind === "grid-2-airy")
    return (
      <div className="flex flex-1 items-center justify-center gap-1 px-2">
        <div className="h-full w-1/3 rounded-sm bg-mp-cream-alt/60" />
        <div className="h-full w-1/3 rounded-sm bg-mp-cream-alt/60" />
      </div>
    );
  if (kind === "grid-2-edit")
    return (
      <div className={`${baseGrid} grid-cols-2`}>
        <div className="rounded-sm bg-mp-cream-alt" />
        <div className="rounded-sm bg-mp-cream-alt/60" />
      </div>
    );
  if (kind === "grid-2-badges")
    return (
      <div className={`${baseGrid} grid-cols-2`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={tile} />
        ))}
      </div>
    );
  if (kind === "grid-2-bold")
    return (
      <div className={`${baseGrid} grid-cols-2`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-sm" style={{ background: i % 2 === 0 ? '#1f2937' : '#FCA5A5' }} />
        ))}
      </div>
    );
  if (kind === "grid-2-pastel")
    return (
      <div className={`${baseGrid} grid-cols-2`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md"
            style={{
              background: ['#FFE0EC', '#FFF3B5', '#BFDBFE', '#FFE0EC'][i],
            }}
          />
        ))}
      </div>
    );
  // default grid-2
  return (
    <div className={`${baseGrid} grid-cols-2`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={tile} />
      ))}
    </div>
  );
}
