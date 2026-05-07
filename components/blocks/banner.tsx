/**
 * Banner — full-width promo strip pinned to the very top of a page
 * (e.g. "ส่งฟรี 990+! · ดูโปรโมชั่น").
 *
 * Was hard-coded `bg-purple-600`; now uses daisyUI .alert.alert-info
 * variant — recolors via theme tokens (primary in fantasy = pink,
 * synthwave = neon purple, garden = green, etc).
 */
export function BannerBlock({
  text,
  ctaText,
  ctaLink,
}: {
  text?: string;
  ctaText?: string;
  ctaLink?: string;
}) {
  return (
    <div className="bg-primary text-primary-content text-center py-2.5 px-4 text-sm font-medium">
      <span>{text || "โปรโมชั่นพิเศษ"}</span>
      {ctaText && (
        <a
          href={ctaLink || "#"}
          className="link link-hover ml-2 font-semibold"
        >
          {ctaText}
        </a>
      )}
    </div>
  );
}
