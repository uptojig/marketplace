interface HeroContent {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  bgColor?: string;
}

export function CuteHero({ content }: { content: HeroContent }) {
  const bg = content.bgColor ?? "#ffe5ec";
  return (
    <section
      className="relative overflow-hidden rounded-3xl px-6 py-16 md:px-12 md:py-24"
      style={{ backgroundColor: bg }}
    >
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
        <div className="space-y-4 text-center md:text-left">
          {content.title && (
            <h1 className="text-3xl font-bold leading-tight text-pink-900 md:text-5xl">
              {content.title}
            </h1>
          )}
          {content.subtitle && (
            <p className="text-base text-pink-800/80 md:text-lg">{content.subtitle}</p>
          )}
          {content.ctaLabel && (
            <a
              href={content.ctaHref ?? "#"}
              className="inline-flex items-center justify-center rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:bg-pink-600"
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
            className="aspect-square w-full rounded-3xl object-cover shadow-xl"
          />
        )}
      </div>
    </section>
  );
}
