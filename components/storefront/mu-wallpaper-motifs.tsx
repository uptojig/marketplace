/**
 * Procedural "sacred motif" SVG art for the มูดวง / Lucky Wallpaper brand.
 *
 * Shared by BOTH storefront systems so the signature yantra/naga/mandala
 * line-art stays identical:
 *   - System-1 React template  → components/storefront/templates/MuWallpaperTemplate.tsx
 *   - System-2 family theme     → components/storefront/themes/mu-wallpaper-th/pages/Homepage.tsx
 *
 * Ported verbatim from the design export `assets/app.js` motif generator.
 * `MotifSvg` is presentational only (no hooks) so it renders in both
 * server and client components. It reads `--glow` from its nearest styled
 * ancestor for the drop-shadow halo.
 */

import type { CSSProperties } from "react";

function poly(cx: number, cy: number, r: number, n: number, rot: number): [number, number][] {
  const p: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = ((rot ?? -90) + (i * 360) / n) * (Math.PI / 180);
    p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return p;
}

function pathOf(pts: [number, number][], close?: boolean): string {
  return `<path d="M${pts
    .map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" L")}${close === false ? "" : " Z"}"/>`;
}

export const MOTIFS: Record<string, () => string> = {
  mandala() {
    let s = `<circle cx="60" cy="92" r="36"/><circle cx="60" cy="92" r="26"/><circle cx="60" cy="92" r="10"/>`;
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 * Math.PI) / 180;
      s += `<line x1="${(60 + 10 * Math.cos(a)).toFixed(1)}" y1="${(92 + 10 * Math.sin(a)).toFixed(1)}" x2="${(60 + 36 * Math.cos(a)).toFixed(1)}" y2="${(92 + 36 * Math.sin(a)).toFixed(1)}"/>`;
    }
    for (let i = 0; i < 8; i++) {
      const a = (i * 45 * Math.PI) / 180;
      s += `<circle cx="${(60 + 18 * Math.cos(a)).toFixed(1)}" cy="${(92 + 18 * Math.sin(a)).toFixed(1)}" r="3.4"/>`;
    }
    return s;
  },
  yantra() {
    return (
      `<circle cx="60" cy="92" r="35"/>` +
      pathOf(poly(60, 92, 40, 4, 0)) +
      pathOf(poly(60, 92, 30, 3, -90)) +
      pathOf(poly(60, 92, 30, 3, 90)) +
      `<circle cx="60" cy="92" r="6"/>`
    );
  },
  sun() {
    let s = `<circle cx="60" cy="92" r="15"/>`;
    for (let i = 0; i < 16; i++) {
      const a = (i * 22.5 * Math.PI) / 180,
        l = i % 2 ? 29 : 36;
      s += `<line x1="${(60 + 19 * Math.cos(a)).toFixed(1)}" y1="${(92 + 19 * Math.sin(a)).toFixed(1)}" x2="${(60 + l * Math.cos(a)).toFixed(1)}" y2="${(92 + l * Math.sin(a)).toFixed(1)}"/>`;
    }
    return s;
  },
  moon() {
    return `<path d="M74 60 A35 35 0 1 0 74 124 A27 27 0 1 1 74 60 Z"/><circle cx="42" cy="68" r="1.8"/><circle cx="38" cy="112" r="1.3"/><circle cx="50" cy="128" r="1.5"/><path d="M44 56 l0 6 M41 59 l6 0"/>`;
  },
  naga() {
    const pts: [number, number][] = [];
    for (let y = 52; y <= 132; y += 4) pts.push([60 + 13 * Math.sin((y - 52) / 11), y]);
    let s = pathOf(pts, false);
    const p2 = pts.map((p) => [p[0] + 7, p[1]] as [number, number]);
    s += pathOf(p2, false);
    s += `<circle cx="${pts[0][0].toFixed(1)}" cy="48" r="6"/><circle cx="${(pts[0][0] + 2).toFixed(1)}" cy="46.5" r="1.2" fill="#f0d68a"/>`;
    return s;
  },
  lotus() {
    const cx = 60,
      cy = 104;
    let s = "";
    for (let i = -2; i <= 2; i++) {
      const a = i * 30;
      s += `<path transform="rotate(${a} ${cx} ${cy})" d="M${cx} ${cy} C ${cx - 9} ${cy - 30}, ${cx - 9} ${cy - 46}, ${cx} ${cy - 52} C ${cx + 9} ${cy - 46}, ${cx + 9} ${cy - 30}, ${cx} ${cy} Z"/>`;
    }
    s += `<path d="M38 104 Q60 116 82 104"/>`;
    return s;
  },
  tree() {
    let s = `<line x1="60" y1="130" x2="60" y2="90"/><circle cx="60" cy="72" r="26"/><line x1="60" y1="104" x2="46" y2="92"/><line x1="60" y1="104" x2="74" y2="92"/><line x1="60" y1="130" x2="50" y2="140"/><line x1="60" y1="130" x2="70" y2="140"/>`;
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 * Math.PI) / 180;
      s += `<circle cx="${(60 + 15 * Math.cos(a)).toFixed(1)}" cy="${(72 + 15 * Math.sin(a)).toFixed(1)}" r="2.3"/>`;
    }
    return s;
  },
  mountain() {
    return `<path d="M26 126 L52 76 L68 100 L86 68 L106 126 Z"/><circle cx="86" cy="54" r="9"/><path d="M52 76 L60 88 M86 68 L94 82"/>`;
  },
  coin() {
    let s = `<circle cx="60" cy="92" r="30"/>` + pathOf(poly(60, 92, 11, 4, 0));
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 * Math.PI) / 180;
      s += `<line x1="${(60 + 30 * Math.cos(a)).toFixed(1)}" y1="${(92 + 30 * Math.sin(a)).toFixed(1)}" x2="${(60 + 38 * Math.cos(a)).toFixed(1)}" y2="${(92 + 38 * Math.sin(a)).toFixed(1)}"/>`;
    }
    return s;
  },
  shield() {
    return `<path d="M60 56 L88 68 V96 C88 116 60 132 60 132 C60 132 32 116 32 96 V68 Z"/><path d="M60 72 L74 80 V96 C74 107 60 116 60 116 C60 116 46 107 46 96 V80 Z"/><line x1="60" y1="84" x2="60" y2="106"/><line x1="49" y1="95" x2="71" y2="95"/>`;
  },
  eye() {
    return (
      pathOf(poly(60, 94, 38, 3, -90)) +
      `<path d="M44 96 Q60 80 76 96 Q60 112 44 96 Z"/><circle cx="60" cy="96" r="5.5"/><circle cx="60" cy="96" r="1.6" fill="#f0d68a"/>`
    );
  },
};

export const MOTIF_KEYS = Object.keys(MOTIFS);

/** Deterministic motif key for an arbitrary product index. */
export function motifFor(index: number): string {
  return MOTIF_KEYS[index % MOTIF_KEYS.length];
}

/** Auspicious category glows (สายมู 5 ด้าน) with a cycling fallback. */
export const CAT_GLOWS = ["#f0c86a", "#ff7eb6", "#ffa45c", "#7aa6ff", "#5fd6a8"];
const CAT_GLOW_BY_LABEL: Record<string, string> = {
  การเงิน: "#f0c86a",
  ความรัก: "#ff7eb6",
  การงาน: "#ffa45c",
  แคล้วคลาด: "#7aa6ff",
  สุขภาพ: "#5fd6a8",
};
export function glowForCategory(category: string | null, index: number): string {
  if (category && CAT_GLOW_BY_LABEL[category]) return CAT_GLOW_BY_LABEL[category];
  return CAT_GLOWS[index % CAT_GLOWS.length];
}

/**
 * The sacred-motif line-art, sized to sit centered inside a 9:16 tile.
 * Pure presentational — drop it on top of a tile's nebula/stars layers.
 * Reads `--glow` from the ancestor tile for its halo.
 */
export function MotifSvg({
  motif,
  className,
  style,
}: {
  motif: string;
  className?: string;
  style?: CSSProperties;
}) {
  const inner = (MOTIFS[motif] ?? MOTIFS.mandala)();
  return (
    <svg
      className={className}
      viewBox="0 0 120 200"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "50%",
        top: "46%",
        transform: "translate(-50%,-50%)",
        width: "74%",
        filter: "drop-shadow(0 0 7px color-mix(in oklab, var(--glow) 75%, transparent))",
        ...style,
      }}
    >
      <g
        fill="none"
        stroke="#f1d98e"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    </svg>
  );
}

/**
 * A complete 9:16 wallpaper preview tile (nebula + stars + sacred motif +
 * blessing + ring). FULLY inline-styled on purpose — both consumers render
 * it from a different component/scope than their `<style jsx>`, so relying
 * on scoped CSS classes for the tile shell silently breaks (absolute
 * children escape their tile). Inline styles always apply, so the tile is
 * a guaranteed sized + positioned containing block everywhere.
 *
 * When `imageUrl` is set the real image is shown; otherwise the procedural
 * motif art renders.
 */
export function WallpaperTile({
  glow,
  motif,
  imageUrl,
  bless,
  className,
  style,
}: {
  glow: string;
  motif?: string;
  imageUrl?: string | null;
  bless?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        aspectRatio: "9 / 16",
        borderRadius: 16,
        overflow: "hidden",
        background: "#0a0820",
        isolation: "isolate",
        ["--glow" as string]: glow,
        ["--cat" as string]: glow,
        ...style,
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(120% 75% at 50% 14%, color-mix(in oklab, var(--cat) 42%, transparent), transparent 58%), radial-gradient(100% 55% at 50% 122%, #05030f, transparent 60%), linear-gradient(180deg,#1a1340,#0a0820 78%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.5,
              backgroundImage:
                "radial-gradient(1px 1px at 20% 30%, #fff, transparent),radial-gradient(1px 1px at 70% 18%, #fff, transparent),radial-gradient(1px 1px at 40% 70%, #fff, transparent),radial-gradient(1.4px 1.4px at 85% 60%, #fff, transparent),radial-gradient(1px 1px at 12% 82%, #fff, transparent),radial-gradient(1px 1px at 60% 90%, #fff, transparent)",
            }}
          />
          <MotifSvg motif={motif ?? "mandala"} />
        </>
      )}
      {bless ? (
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "9%",
            textAlign: "center",
            fontFamily: "'Charmonman', var(--font-kanit), cursive",
            fontSize: "clamp(13px,3.6vw,17px)",
            color: "#f7e6ad",
            opacity: 0.92,
            letterSpacing: ".02em",
            textShadow: "0 0 10px rgba(233,205,132,.5)",
          }}
        >
          {bless}
        </span>
      ) : null}
      <div
        style={{ position: "absolute", inset: 6, border: "1px solid rgba(233,205,132,.22)", borderRadius: 11 }}
      />
    </div>
  );
}
