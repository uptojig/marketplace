"use client";

export function CtaBlock({ headline, subheadline, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink }: {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}) {
  return (
    <div className="text-center px-6 py-16 max-w-2xl mx-auto">
      <h3 className="text-2xl md:text-3xl font-bold mb-3">{headline || "พร้อมสั่งซื้อแล้วหรือยัง?"}</h3>
      {subheadline && <p className="mb-6" style={{ color: 'var(--shop-ink-muted)' }}>{subheadline}</p>}
      <div className="flex items-center justify-center gap-3">
        {ctaText && (
          <a href={ctaLink || "#"} className="px-8 py-3.5 rounded-lg font-semibold text-white text-sm"
            style={{ backgroundColor: "var(--shop-primary)" }}>
            {ctaText}
          </a>
        )}
        {secondaryCtaText && (
          <a href={secondaryCtaLink || "#"} className="px-8 py-3.5 rounded-lg font-semibold border text-sm" style={{ borderColor: 'var(--shop-border)' }}>
            {secondaryCtaText}
          </a>
        )}
      </div>
    </div>
  );
}
