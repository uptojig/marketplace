"use client";

/**
 * CTA — closer to the page-bottom "ready to start?" call-out.
 * Light themes: simple centered card with primary + outline buttons.
 * Cyber theme: full-width gradient panel with corner glow blobs and
 *   neon-shadowed buttons. Cyber styling lives in globals.css scoped
 *   to `.theme-cyber .cyber-cta-band` so light themes are unchanged.
 */
export function CtaBlock({
  headline,
  subheadline,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
}: {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}) {
  return (
    <section className="px-6 py-12 md:py-16 max-w-5xl mx-auto">
      <div className="cyber-cta-band relative overflow-hidden text-center px-6 py-12 md:py-16 rounded-3xl">
        {/* Decorative glow blobs — only paint on cyber theme */}
        <div className="cyber-only absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
             style={{ backgroundColor: "rgba(6, 182, 212, 0.15)" }} />
        <div className="cyber-only absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"
             style={{ backgroundColor: "rgba(124, 58, 237, 0.18)" }} />

        <h3 className="text-3xl md:text-4xl font-black mb-3 relative z-10 cyber-gradient-text-on-cyber">
          {headline || "พร้อมสั่งซื้อแล้วหรือยัง?"}
        </h3>
        {subheadline && (
          <p
            className="mb-8 relative z-10 max-w-2xl mx-auto"
            style={{ color: "var(--shop-ink-muted)" }}
          >
            {subheadline}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
          {ctaText && (
            <a
              href={ctaLink || "#"}
              className="cyber-cta-primary px-8 py-3.5 rounded-lg font-bold text-white text-sm transition-all"
              style={{ backgroundColor: "var(--shop-primary)" }}
            >
              {ctaText}
            </a>
          )}
          {secondaryCtaText && (
            <a
              href={secondaryCtaLink || "#"}
              className="cyber-cta-secondary px-8 py-3.5 rounded-lg font-bold border-2 text-sm transition-all"
              style={{
                borderColor: "var(--shop-accent, var(--shop-border))",
                color: "var(--shop-accent, var(--shop-ink))",
              }}
            >
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
