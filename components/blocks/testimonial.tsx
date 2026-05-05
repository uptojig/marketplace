"use client";

import { Star, Quote } from "lucide-react";

export function TestimonialBlock({ title, quotes, layoutStyle = "grid" }: {
  title?: string;
  layoutStyle?: "grid" | "carousel" | "featured";
  quotes?: Array<{ text?: string; author?: string; location?: string; rating?: number }>;
}) {
  if (!quotes || quotes.length === 0) return null;

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto overflow-hidden">
      {title && <h3 className="text-xl font-bold text-center mb-8">{title}</h3>}
      <div className={`
        ${layoutStyle === "grid" ? "grid md:grid-cols-3 gap-4" : ""}
        ${layoutStyle === "carousel" ? "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 no-scrollbar" : ""}
        ${layoutStyle === "featured" ? "flex flex-col gap-8 items-center max-w-2xl mx-auto" : ""}
      `}>
        {quotes.map((q, i) => (
          <div key={i} className={`
            p-5 border
            ${layoutStyle === "grid" ? "rounded-xl" : ""}
            ${layoutStyle === "carousel" ? "rounded-xl min-w-[300px] snap-center shrink-0" : ""}
            ${layoutStyle === "featured" ? "rounded-2xl border-none shadow-sm text-center w-full" : ""}
          `} style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
            <Quote className={`size-5 mb-3 ${layoutStyle === "featured" ? "mx-auto size-8" : ""}`} style={{ color: 'var(--shop-ink-muted)', opacity: 0.3 }} />
            {q.rating && (
              <div className={`flex gap-0.5 mb-2 ${layoutStyle === "featured" ? "justify-center mb-4" : ""}`}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`size-3.5 ${j < q.rating! ? "text-amber-400 fill-amber-400" : "text-zinc-600"} ${layoutStyle === "featured" ? "size-5" : ""}`} />
                ))}
              </div>
            )}
            <p className={`leading-relaxed mb-3 ${layoutStyle === "featured" ? "text-lg md:text-xl font-serif italic mb-6" : "text-sm"}`} style={{ color: 'var(--shop-ink-muted)' }}>&ldquo;{q.text}&rdquo;</p>
            <div>
              <div className={`font-medium ${layoutStyle === "featured" ? "text-base" : "text-sm"}`}>{q.author}</div>
              {q.location && <div className={`${layoutStyle === "featured" ? "text-sm mt-1" : "text-xs"}`} style={{ color: 'var(--shop-ink-muted)' }}>{q.location}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
