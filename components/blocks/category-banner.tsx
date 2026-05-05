"use client";

import { Badge } from "@/components/ui/badge";

export function CategoryBannerBlock({ title, subtitle, layout = "grid-3", categories, aspectRatio = "4/3" }: {
  title?: string;
  subtitle?: string;
  layout?: string;
  categories?: Array<{
    name?: string;
    imageUrl?: string;
    altText?: string;
    linkTo?: string;
    badge?: string;
    productCount?: number;
  }>;
  aspectRatio?: string;
}) {
  if (!categories || categories.length === 0) return null;
  const cols = layout === "grid-2" ? 2 : layout === "grid-4" ? 4 : 3;

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto">
      {title && <h3 className="text-xl font-bold text-center mb-2">{title}</h3>}
      {subtitle && <p className="text-sm text-muted-foreground text-center mb-8">{subtitle}</p>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {categories.map((cat, i) => (
          <a key={i} href={cat.linkTo || "#"} className="group relative rounded-xl overflow-hidden bg-zinc-800" style={{ aspectRatio }}>
            {cat.imageUrl ? (
              <img src={cat.imageUrl} alt={cat.altText || cat.name || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">{cat.name}</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              {cat.badge && <Badge variant="destructive" className="text-[10px] mb-1">{cat.badge}</Badge>}
              <h4 className="text-white font-semibold text-sm">{cat.name}</h4>
              {cat.productCount && <p className="text-white/60 text-[10px]">พบ {cat.productCount} รายการ</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
