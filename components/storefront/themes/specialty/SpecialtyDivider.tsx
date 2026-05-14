/**
 * SpecialtyDivider — hand-drawn-feel dashed wavy line for the
 * specialty (artisan / vintage) family. Rendered as inline SVG so it
 * inherits currentColor and works without an external asset.
 *
 * Visual goal: evoke a curator's pen mark between sections — not the
 * geometric perfection of an <hr>, not the soft swoosh of a fashion
 * separator. Sits between PDP info blocks, between cart sections,
 * between success-page panels.
 */
import { cn } from '@/lib/utils';

export function SpecialtyDivider({
  className,
  color = 'var(--shop-ink-muted, #78716c)',
  ariaHidden = true,
}: {
  className?: string;
  color?: string;
  ariaHidden?: boolean;
}) {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn('w-full', className)}
      style={{ color }}
    >
      <svg
        viewBox="0 0 400 12"
        preserveAspectRatio="none"
        className="block h-3 w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hand-drawn wavy line — quadratic Beziers + dashed stroke
            so it reads as ink-on-paper rather than a CSS border. */}
        <path
          d="M0,6 Q20,1 40,6 T80,6 T120,6 T160,6 T200,6 T240,6 T280,6 T320,6 T360,6 T400,6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="3 4"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}

/**
 * SpecialtyStamp — rotated badge that reads as a curator's stamp.
 * Use for short "One-of-a-kind" / "Lot of 1" / "Est. 1962" callouts.
 * Pairs with .theme-specialty [data-specialty-stamp="true"] in
 * globals.css which adds the 3deg rotation + dashed border.
 */
export function SpecialtyStamp({
  children,
  className,
  tone = 'primary',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'primary' | 'accent' | 'ink';
}) {
  const colorMap: Record<typeof tone, string> = {
    primary: 'var(--shop-primary, #ca8a04)',
    accent: 'var(--shop-accent, #b45309)',
    ink: 'var(--shop-ink, #44403c)',
  };
  return (
    <span
      data-specialty-stamp="true"
      className={cn(
        'inline-flex items-center gap-1 rounded-md border bg-[var(--shop-card,#fbf9f3)]',
        'px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]',
        className,
      )}
      style={{ borderColor: colorMap[tone], color: colorMap[tone] }}
    >
      {children}
    </span>
  );
}

/**
 * SpecialtyHandLabel — italic-handwritten short caption ("Made by",
 * "Est. 1962", "Lot of 1") using the Caveat font. Use sparingly for
 * eyebrows / footnotes — never as primary body copy.
 */
export function SpecialtyHandLabel({
  children,
  className,
  size = 'sm',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}) {
  const sizeMap: Record<typeof size, string> = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
  };
  return (
    <span
      className={cn(sizeMap[size], 'italic leading-tight', className)}
      style={{
        fontFamily:
          'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive',
        color: 'var(--shop-accent, #b45309)',
      }}
    >
      {children}
    </span>
  );
}
