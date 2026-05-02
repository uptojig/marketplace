interface CtaContent {
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function CuteCTA({ content }: { content: CtaContent }) {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 px-6 py-12 text-center text-white md:px-10 md:py-16">
      {content.heading && (
        <h2 className="text-2xl font-bold md:text-3xl">{content.heading}</h2>
      )}
      {content.body && (
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/90 md:text-base">
          {content.body}
        </p>
      )}
      {content.ctaLabel && (
        <a
          href={content.ctaHref ?? "#"}
          className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-pink-600 shadow-lg transition hover:scale-105"
        >
          {content.ctaLabel}
        </a>
      )}
    </section>
  );
}
