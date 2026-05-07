"use client";

/**
 * ProductShowcase — renders AI-generated markdown product cards
 * Parses markdown sections (split by ---) into product cards
 */
export function ProductShowcaseBlock({
  contentMarkdown,
}: {
  contentMarkdown: string;
}) {
  const products = contentMarkdown
    .split(/---+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {products.map((block, i) => (
          <ProductCard key={i} markdown={block} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n").filter(Boolean);

  let title = "";
  let imageUrl = "";
  let priceHtml = "";
  let badge = "";

  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("# ")) {
      title = line.replace(/^#+\s*/, "");
    } else if (line.startsWith("![")) {
      const match = line.match(/!\[.*?\]\((.*?)\)/);
      if (match) imageUrl = match[1];
    } else if (line.includes("฿") || line.includes("**฿")) {
      priceHtml = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-lg">$1</strong>')
        .replace(/~~(.*?)~~/g, '<del class="text-muted-foreground text-sm ml-2">$1</del>');
    } else if (line.startsWith("ป้าย:") || line.startsWith("Badge:")) {
      badge = line.replace(/^(ป้าย|Badge):\s*/, "");
    }
  }

  return (
    <div className="group border border-border/50 rounded-xl overflow-hidden bg-card hover:border-purple-500/30 transition-all duration-300">
      {imageUrl && (
        <div className="aspect-square overflow-hidden bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        {badge && (
          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/20 text-red-400 uppercase">
            {badge}
          </span>
        )}
        <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
        {priceHtml && (
          <p
            className="text-foreground"
            dangerouslySetInnerHTML={{ __html: priceHtml }}
          />
        )}
      </div>
    </div>
  );
}
