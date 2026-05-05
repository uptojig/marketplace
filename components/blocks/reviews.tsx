"use client";

import { Star, CheckCircle } from "lucide-react";

export function ReviewsBlock({ title, reviews }: {
  title?: string;
  reviews?: Array<{ author?: string; rating?: number; text?: string; date?: string; verified?: boolean }>;
}) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto">
      {title && <h3 className="text-xl font-bold text-center mb-8">{title}</h3>}
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium">{r.author?.[0] || "?"}</div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    {r.author}
                    {r.verified && <CheckCircle className="size-3 text-green-500" />}
                  </div>
                  {r.date && <div className="text-[10px] text-muted-foreground">{r.date}</div>}
                </div>
              </div>
              {r.rating && (
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`size-3 ${j < r.rating! ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`} />
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
