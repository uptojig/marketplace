'use client';

/**
 * Floating skin picker — lets the visitor try the theme in different
 * curated palettes. Reads the available palettes from
 * `lib/landing/theme-palettes-registry.ts` and only renders when the
 * store's templateId has presets defined (konvy, casethep, omnipack,
 * blackwrapp, gridmodu, motofog).
 *
 * Clicking a swatch:
 *   1. Writes the palette tokens to `document.documentElement.style`
 *      so `--shop-primary` / `--shop-accent` / `--shop-primary-gradient`
 *      take effect immediately (every styled component reads these).
 *   2. Persists `{templateId, paletteId}` in localStorage so the choice
 *      survives navigation + reload.
 *
 * The operator's `themeAccentOverride` from the DB still wins on first
 * paint (SSR); this picker is a per-visitor override on top.
 */
import { useEffect, useState } from 'react';
import { Palette as PaletteIcon, X } from 'lucide-react';
import { getThemePalettes } from '@/lib/landing/theme-palettes-registry';

interface Props {
  templateId: string | null | undefined;
}

const LS_KEY = 'basketplace-skin';

export function SkinPicker({ templateId }: Props) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const palettes = templateId ? getThemePalettes(templateId) : [];

  // Apply persisted choice on mount (SSR has no localStorage, so the
  // FIRST paint always uses the operator's curated palette; the visitor
  // override only kicks in after hydration).
  useEffect(() => {
    if (!templateId || palettes.length === 0) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { templateId: string; paletteId: string };
      if (saved.templateId !== templateId) return;
      const palette = palettes.find((p) => p.id === saved.paletteId);
      if (!palette) return;
      applyPalette(palette);
      setActiveId(palette.id);
    } catch {
      /* localStorage unavailable or bad JSON — ignore. */
    }
  }, [templateId, palettes]);

  if (!templateId || palettes.length === 0) return null;

  const pickPalette = (paletteId: string) => {
    const palette = palettes.find((p) => p.id === paletteId);
    if (!palette) return;
    applyPalette(palette);
    setActiveId(palette.id);
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ templateId, paletteId: palette.id }),
      );
    } catch {
      /* silent */
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] font-[family:var(--font-prompt)]">
      {open ? (
        <div className="rounded-2xl bg-white shadow-2xl border border-zinc-200 p-4 w-[260px] sm:w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                ปรับแต่งสีร้าน
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                เลือก {palettes.length} เฉดที่ใช่
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="ปิด"
              className="rounded-full p-1 hover:bg-zinc-100 transition-colors text-zinc-500"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {palettes.map((p) => {
              const isActive = activeId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickPalette(p.id)}
                  title={p.name}
                  aria-label={`ใช้สี ${p.name}`}
                  className={`relative aspect-square rounded-full transition-transform hover:scale-110 ${
                    isActive ? 'ring-2 ring-offset-2 ring-zinc-900' : ''
                  }`}
                  style={{
                    background:
                      p.gradient ?? `linear-gradient(135deg, ${p.primary}, ${p.accent})`,
                  }}
                />
              );
            })}
          </div>
          {activeId && (
            <p className="mt-3 text-[11px] text-zinc-500 text-center">
              {palettes.find((p) => p.id === activeId)?.blurb}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="ปรับแต่งสีร้าน"
          className="w-12 h-12 rounded-full bg-white shadow-xl border border-zinc-200 flex items-center justify-center text-zinc-700 hover:scale-110 transition-transform"
        >
          <PaletteIcon size={20} />
        </button>
      )}
    </div>
  );
}

/** Mutate document.documentElement.style with the palette's CSS vars. */
function applyPalette(p: {
  primary: string;
  accent: string;
  gradient?: string;
}) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--shop-primary', p.primary);
  root.style.setProperty('--shop-accent', p.accent);
  if (p.gradient) {
    root.style.setProperty('--shop-primary-gradient', p.gradient);
  }
}
