interface Feature {
  icon?: string;
  title?: string;
  description?: string;
}

interface FeaturesContent {
  heading?: string;
  features?: Feature[];
}

export function MinimalFeatures({ content }: { content: FeaturesContent }) {
  const features = content.features ?? [];
  return (
    <section className="border-y py-12">
      {content.heading && (
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">{content.heading}</h2>
      )}
      <div className="grid gap-8 md:grid-cols-3">
        {features.map((f, i) => (
          <div key={i} className="space-y-1">
            {f.icon && <div className="text-2xl">{f.icon}</div>}
            <h3 className="font-medium">{f.title}</h3>
            <p className="text-sm text-gray-600">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
