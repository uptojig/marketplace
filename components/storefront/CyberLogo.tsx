/**
 * CyberLogo — programmatic brand mark for Family E (Cyberpunk Neon)
 * stores that don't have an uploaded logoUrl yet.
 *
 * Composes:
 *   - Smartphone icon tilted -6deg inside a slate panel with cyan
 *     border + purple→cyan gradient halo (blurred behind)
 *   - Lightning bolt accent in the corner of the panel
 *   - Crown icon above the brand text
 *   - Gradient brand text (purple → cyan) — uppercase italic
 *   - Caption row below: cyan ".co" suffix on the store slug
 *
 * The whole thing is keyboard / a11y-clean: no interactive nodes,
 * just icons + text. The parent <Link> (in GlobalHeader) handles
 * the click target.
 *
 * Falls back gracefully — if `brandText` is missing we use slug
 * uppercased; the caption uses slug + ".co" so even no-name stores
 * render with something.
 */

import { Crown, Smartphone, Zap } from "lucide-react";

interface Props {
  /** Display name for the gradient text. Defaults to slug if absent. */
  brandText?: string;
  /** Store slug — used for the cyan caption ("CASELNW.CO" style). */
  storeSlug: string;
  /** Optional override for the caption (e.g. custom domain). */
  captionText?: string;
}

export function CyberLogo({ brandText, storeSlug, captionText }: Props) {
  const displayName = brandText?.trim() || storeSlug.toUpperCase();
  const caption = captionText?.trim() || `${storeSlug.toUpperCase()}.CO`;

  return (
    <div className="flex items-center gap-2 group">
      {/* Icon panel — smartphone + lightning, tilted, with gradient halo */}
      <div className="relative">
        <div
          className="absolute -inset-1 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--shop-primary, #7c3aed), var(--shop-accent, #06b6d4))",
          }}
          aria-hidden="true"
        />
        <div
          className="relative p-1 rounded-lg transform -rotate-6"
          style={{
            backgroundColor: "rgb(15 23 42)", // slate-900 — fixed so this
            // mark stays readable even if --shop-card drifts on this
            // store. Brand identity > theme tokens for the logo lockup.
            border: "2px solid var(--shop-accent, #06b6d4)",
          }}
        >
          <Smartphone
            className="w-6 h-6"
            style={{ color: "var(--shop-primary, #7c3aed)" }}
          />
          <Zap
            className="w-3 h-3 absolute bottom-1 right-1"
            style={{ color: "#facc15" /* yellow-400 — gold accent */ }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Text stack — crown + gradient brand + cyan slug caption */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <Crown
            className="w-4 h-4"
            style={{ color: "#facc15" }}
            aria-hidden="true"
          />
          <span
            className="font-black text-2xl tracking-tighter uppercase italic"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--shop-primary, #7c3aed), var(--shop-accent, #06b6d4))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {displayName}
          </span>
        </div>
        <span
          className="text-xs font-bold tracking-widest pl-1"
          style={{ color: "var(--shop-accent, #06b6d4)" }}
        >
          {caption}
        </span>
      </div>
    </div>
  );
}
