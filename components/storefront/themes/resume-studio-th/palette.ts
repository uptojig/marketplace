/**
 * Resume Studio (resume-studio-th) — shared palette for the bespoke chrome + pages.
 *
 * Tokens lifted from the exported ResumeKit design system
 * (`css/styles.css` — "Modern Minimal · indigo + mint"). The source
 * declared everything in OKLCH; the values below are the sRGB-hex
 * equivalents so the Header / Footer / Homepage can hand-pick exact
 * shades without re-declaring the OKLCH cascade.
 *
 *   accent       indigo  #3364DB  → mapped to `--shop-primary`
 *   accent-ink   deep    #1B46B4  (hover / gradient base)
 *   accent-soft  tint    #E4EFFF
 *   credit       mint    #00A57D  (credit pill, ATS badges, "เครดิต")
 *   credit-ink   deep    #006B4C
 *   credit-soft  tint    #D6F8E9
 *   bg           page    #F8FAFD
 *   surface      card    #FFFFFF
 *   fg           ink     #151B25
 *   fg-soft              #323843
 *   muted                #676C75
 *   border               #DEE1E6
 *   border-2             #CDD1D7
 *
 * Components default these to `var(--shop-*)` so a per-store override
 * from the CSS cascade still wins; the hex is the design fallback.
 */

// ── Brand: indigo accent (→ --shop-primary) ──────────────────────────
export const RS_ACCENT = '#3364DB';
export const RS_ACCENT_INK = '#1B46B4';
export const RS_ACCENT_SOFT = '#E4EFFF';

// ── Credit: mint / teal ──────────────────────────────────────────────
export const RS_CREDIT = '#00A57D';
export const RS_CREDIT_INK = '#006B4C';
export const RS_CREDIT_SOFT = '#D6F8E9';

// ── Surfaces ──────────────────────────────────────────────────────────
export const RS_BG = '#F8FAFD';
export const RS_SURFACE = '#FFFFFF';
export const RS_SURFACE_2 = '#F2F5F9';
export const RS_SURFACE_3 = '#E9EDF2';

// ── Ink ────────────────────────────────────────────────────────────────
export const RS_FG = '#151B25';
export const RS_FG_SOFT = '#323843';
export const RS_MUTED = '#676C75';
export const RS_FAINT = '#8E929A';

// ── Lines ────────────────────────────────────────────────────────────
export const RS_BORDER = '#DEE1E6';
export const RS_BORDER_2 = '#CDD1D7';

// ── Status + accents ──────────────────────────────────────────────────
export const RS_DANGER = '#D73240';
export const RS_DANGER_SOFT = '#FFE8E6';
export const RS_PACK = '#623AC3';
export const RS_PACK_SOFT = '#EDEAFF';

// ── Radii / shadows (from --r-* / --sh-* in the export) ───────────────
export const RS_RADIUS_SM = '8px';
export const RS_RADIUS = '13px';
export const RS_RADIUS_LG = '20px';
export const RS_RADIUS_XL = '26px';
export const RS_RADIUS_PILL = '999px';

export const RS_SHADOW_1 =
  '0 1px 2px rgba(31,38,53,0.05), 0 1px 1px rgba(31,38,53,0.04)';
export const RS_SHADOW_2 =
  '0 6px 22px rgba(31,38,53,0.08), 0 2px 6px rgba(31,38,53,0.05)';
export const RS_SHADOW_3 =
  '0 18px 50px rgba(31,38,53,0.14), 0 4px 12px rgba(31,38,53,0.06)';

/**
 * CSS-var-first token map. Each entry prefers a per-store override
 * (`var(--shop-*)`) and falls back to the ResumeKit design hex. The
 * export's indigo accent maps to `--shop-primary`.
 */
export const RESUME_STUDIO_TOKENS = {
  primary: `var(--shop-primary, ${RS_ACCENT})`,
  primaryInk: `var(--shop-primary-ink, ${RS_ACCENT_INK})`,
  primarySoft: `var(--shop-primary-soft, ${RS_ACCENT_SOFT})`,
  credit: `var(--shop-credit, ${RS_CREDIT})`,
  creditInk: `var(--shop-credit-ink, ${RS_CREDIT_INK})`,
  creditSoft: `var(--shop-credit-soft, ${RS_CREDIT_SOFT})`,
  bg: `var(--shop-bg, ${RS_BG})`,
  surface: `var(--shop-surface, ${RS_SURFACE})`,
  fg: `var(--shop-fg, ${RS_FG})`,
  muted: `var(--shop-muted, ${RS_MUTED})`,
  border: `var(--shop-border, ${RS_BORDER})`,
} as const;
