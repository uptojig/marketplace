interface CtaContent {
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function MinimalCTA({ content }: { content: CtaContent }) {
  return (
    <section className="border-y py-16 text-center">
      {content.heading && (
        <h2 className="text-3xl font-semibold tracking-tight">{content.heading}</h2>
      )}
      {content.body && (
        <p className="mx-auto mt-2 max-w-xl text-gray-600">{content.body}</p>
      )}
      {content.ctaLabel && (
        <a
          href={content.ctaHref ?? "#"}
          className="mt-6 inline-flex rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {content.ctaLabel}
        </a>
      )}
    </section>
  );
}
