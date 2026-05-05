"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ImageSlideBlock({ slides, showDots = true, showArrows = true }: {
  slides?: Array<{ imageUrl?: string; altText?: string; caption?: string }>;
  showDots?: boolean;
  showArrows?: boolean;
}) {
  const [current, setCurrent] = useState(0);
  if (!slides || slides.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative overflow-hidden bg-zinc-900">
      <div className="aspect-video relative">
        {slides[current]?.imageUrl ? (
          <img src={slides[current].imageUrl} alt={slides[current].altText || ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">สไลด์ {current + 1}</div>
        )}
        {slides[current]?.caption && (
          <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium bg-black/50 rounded-lg px-4 py-2">{slides[current].caption}</div>
        )}
      </div>
      {showArrows && slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"><ChevronLeft className="size-4" /></button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"><ChevronRight className="size-4" /></button>
        </>
      )}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`size-2 rounded-full transition ${i === current ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
