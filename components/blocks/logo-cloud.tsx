"use client";

export function LogoCloudBlock({ title, logos, grayscale = true }: {
  title?: string;
  logos?: Array<{ imageUrl?: string; altText?: string }>;
  grayscale?: boolean;
}) {
  if (!logos || logos.length === 0) return null;

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto text-center">
      {title && <p className="text-xs text-muted-foreground mb-6">{title}</p>}
      <div className="flex flex-wrap items-center justify-center gap-8">
        {logos.map((logo, i) => (
          <div key={i} className={`h-8 opacity-60 hover:opacity-100 transition ${grayscale ? "grayscale hover:grayscale-0" : ""}`}>
            {logo.imageUrl ? (
              <img src={logo.imageUrl} alt={logo.altText || ""} className="h-full w-auto object-contain" />
            ) : (
              <div className="h-full px-4 bg-zinc-800 rounded flex items-center text-xs text-zinc-500">{logo.altText || "Logo"}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
