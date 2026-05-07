"use client";

export function CallToActionBlock({
  headline,
  subheadline,
  ctaText,
}: {
  headline: string;
  subheadline: string;
  ctaText: string;
}) {
  return (
    <div className="py-16 px-6 text-center bg-gradient-to-b from-background to-card/80">
      <div className="max-w-xl mx-auto space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">{headline}</h2>
        <p className="text-muted-foreground">{subheadline}</p>
        <a
          href="#"
          className="inline-block px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
          style={{ backgroundColor: "var(--primary, #7c3aed)" }}
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}
