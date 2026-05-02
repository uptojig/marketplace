interface Feature {
  icon?: string;
  title?: string;
  description?: string;
}

interface FeaturesContent {
  heading?: string;
  features?: Feature[];
}

export function CuteFeatures({ content }: { content: FeaturesContent }) {
  const features = content.features ?? [];
  return (
    <section className="rounded-3xl bg-pink-50/60 px-6 py-12 md:px-10">
      {content.heading && (
        <h2 className="mb-8 text-center text-2xl font-bold text-pink-900 md:text-3xl">
          {content.heading}
        </h2>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={i}
            className="space-y-2 rounded-2xl bg-white p-5 text-center shadow-sm"
          >
            {f.icon && <div className="text-3xl">{f.icon}</div>}
            <h3 className="font-semibold text-pink-900">{f.title}</h3>
            <p className="text-sm text-pink-800/70">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
