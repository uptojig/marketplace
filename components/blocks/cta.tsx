/**
 * CTA — closer to the page-bottom "ready to start?" call-out.
 *
 * Rebuilt on daisyUI 5's `hero` component (compact variant). The
 * outer `.hero` provides the centered layout + full-width band; the
 * inner `.hero-content` caps width and stacks heading / subheading /
 * buttons. Buttons use `.btn .btn-primary` and `.btn-outline` so
 * theme-color tokens flow through automatically.
 *
 * Family-specific flair (.cyber-cta-band gradient, .theme-A dark
 * panel) still applies via the className hooks preserved on the
 * outer wrapper + buttons.
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
      <div className="cyber-cta-band hero rounded-3xl bg-base-200 relative overflow-hidden">
        {/* Decorative glow blobs — only paint on cyber theme via
            the global .cyber-only display rule. */}
        <div
          className="cyber-only absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none bg-secondary/20"
        />
        <div
          className="cyber-only absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none bg-primary/20"
        />

        <div className="hero-content text-center px-6 py-12 md:py-16 max-w-3xl">
          <div>
            <h3 className="text-3xl md:text-4xl font-black mb-3 relative z-10 cyber-gradient-text-on-cyber">
              {headline || "พร้อมสั่งซื้อแล้วหรือยัง?"}
            </h3>
            {subheadline && (
              <p className="mb-8 relative z-10 max-w-2xl mx-auto text-base-content/70">
                {subheadline}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
              {ctaText && (
                <a
                  href={ctaLink || "#"}
                  className="cyber-cta-primary btn btn-primary btn-lg"
                >
                  {ctaText}
                </a>
              )}
              {secondaryCtaText && (
                <a
                  href={secondaryCtaLink || "#"}
                  className="cyber-cta-secondary btn btn-outline btn-lg"
                >
                  {secondaryCtaText}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
