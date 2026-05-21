"use client";

import { useState } from "react";
import {
  rankThemes,
  themeForTemplate,
  type ThemeOption,
  type TemplateId,
  type WizardState,
  PALETTES,
} from "@/lib/store/wizard-data";

type Props = {
  state: WizardState;
  onChange: (patch: Partial<WizardState["layout"]>) => void;
  onIdentityChange?: (patch: Partial<WizardState["identity"]>) => void;
};

export function PhaseLayout({ state, onChange, onIdentityChange }: Props) {
  const [showAll, setShowAll] = useState(false);
  const { recommended, others } = rankThemes(state.identity.niche);
  // Highlight the card matching the saved templateId's family. null until the
  // user has actually picked, so nothing shows pre-selected.
  const activeKey = state.layout.templateId
    ? themeForTemplate(state.layout.templateId).key
    : null;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-mp-ink-muted">
          ขั้นที่ 2 · ธีม
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          เลือกธีมที่เหมาะกับร้าน
        </h2>
        <p className="text-sm text-mp-ink-muted">
          {state.identity.niche
            ? "แนะนำตามหมวดที่คุณเลือก · ปรับสี/โลโก้/แบนเนอร์ได้ภายหลัง"
            : "เลือกได้ทั้งหมด 10 ธีม · ปรับสี/โลโก้ได้ภายหลัง"}
        </p>
      </header>

      {recommended.length > 0 && (
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
            {recommended.map((t) => (
              <ThemeCard
                key={t.key}
                theme={t}
                active={t.key === activeKey}
                onSelect={() => onChange({ templateId: t.templateId })}
              />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-xs font-medium text-mp-ink underline-offset-4 hover:underline"
          >
            {showAll ? `↑ ซ่อนธีมอื่น` : `↓ ดูธีมทั้งหมด (อีก ${others.length})`}
          </button>

          {showAll && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {others.map((t) => (
                <ThemeCard
                  key={t.key}
                  theme={t}
                  active={t.key === activeKey}
                  onSelect={() => onChange({ templateId: t.templateId })}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ThemeCard({
  theme,
  active,
  onSelect,
}: {
  theme: ThemeOption;
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
        <TemplateThumb id={theme.templateId} />
      </div>
      <p className="text-sm font-medium text-mp-ink">{theme.name}</p>
      <p className="text-[11px] leading-snug text-mp-ink-muted">
        {theme.description}
      </p>
    </button>
  );
}

function TemplateThumb({ id }: { id: TemplateId }) {
  // Schematic thumbnail showing the dominant pattern of each template.
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
