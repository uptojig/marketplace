interface HeroContent {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
}

export function MinimalHero({ content }: { content: HeroContent }) {
  return (
    <section className="border-b py-16 md:py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <div className="space-y-4">
          {content.title && (
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              {content.title}
            </h1>
          )}
          {content.subtitle && (
            <p className="text-base text-gray-600 md:text-lg">{content.subtitle}</p>
          )}
          {content.ctaLabel && (
            <a
              href={content.ctaHref ?? "#"}
              className="inline-flex items-center rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              {content.ctaLabel}
            </a>
          )}
        </div>
        {content.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.imageUrl}
            alt={content.title ?? ""}
            className="aspect-square w-full rounded-lg object-cover"
          />
        )}
      </div>
    </section>
  );
}
