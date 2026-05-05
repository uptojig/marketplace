"use client";

export function GalleryBlock({ title, images, columns = 3, layoutStyle = "grid" }: {
  title?: string;
  images?: Array<{ imageUrl?: string; altText?: string }>;
  columns?: number;
  layoutStyle?: "grid" | "masonry" | "carousel";
}) {
  if (!images || images.length === 0) return null;

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto overflow-hidden">
      {title && <h3 className="text-2xl font-bold text-center mb-8">{title}</h3>}
      
      <div className={`
        ${layoutStyle === "grid" ? "grid gap-4" : ""}
        ${layoutStyle === "masonry" ? "columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4" : ""}
        ${layoutStyle === "carousel" ? "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 no-scrollbar" : ""}
      `} style={layoutStyle === "grid" ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : {}}>
        {images.map((img, i) => (
          <div key={i} className={`
            bg-zinc-800 rounded-xl overflow-hidden
            ${layoutStyle === "grid" ? "aspect-square" : ""}
            ${layoutStyle === "masonry" ? "break-inside-avoid inline-block w-full" : ""}
            ${layoutStyle === "carousel" ? "aspect-[4/3] min-w-[280px] snap-center shrink-0" : ""}
          `}>
            {img.imageUrl ? (
              <img src={img.imageUrl} alt={img.altText || ""} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs min-h-[150px]">{img.altText || `รูปที่ ${i + 1}`}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
