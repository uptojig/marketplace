"use client";

import { Star, CheckCircle } from "lucide-react";

/**
 * Reviews block.
 * Light themes: stacked list with bordered cards.
 * Cyber theme: 3-column grid with quote-mark watermark + colored
 *   gradient avatar circles. Switch is in globals.css scoped to
 *   `.theme-cyber .cyber-reviews-grid`.
 */
export function ReviewsBlock({
  title,
  reviews,
  overallRating,
  reviewCount,
}: {
  title?: string;
  reviews?: Array<{
    author?: string;
    name?: string;
    location?: string;
    rating?: number;
    text?: string;
    date?: string;
    verified?: boolean;
  }>;
  overallRating?: number;
  reviewCount?: number;
}) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="px-6 py-12 md:py-16 max-w-7xl mx-auto">
      {title && (
        <h3 className="text-3xl md:text-4xl font-black text-center mb-4 cyber-gradient-text-on-cyber">
          {title}
        </h3>
      )}
      {/* Aggregate row when supplied. Looks great on cyber, neutral
          enough on light themes. */}
      {(overallRating || reviewCount) && (
        <div className="flex items-center justify-center gap-2 mb-10 text-sm">
          {overallRating && (
            <span className="text-xl font-bold" style={{ color: "var(--shop-primary)" }}>
              {overallRating.toFixed(1)}
            </span>
          )}
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, j) => (
              <Star
                key={j}
                className={`size-4 ${
                  j < Math.round(overallRating ?? 0)
                    ? "text-amber-400 fill-amber-400"
                    : "text-zinc-500/50"
                }`}
              />
            ))}
          </div>
          {reviewCount && (
            <span className="opacity-70">
              จาก {reviewCount.toLocaleString("th-TH")} รีวิว
            </span>
          )}
        </div>
      )}
      <div className="cyber-reviews-grid grid gap-4 md:grid-cols-3">
        {reviews.map((r, i) => {
          const author = r.author ?? r.name ?? "ลูกค้า";
          return (
            <div
              key={i}
              className="cyber-review-card relative p-6 rounded-2xl bg-card border border-border/30"
            >
              {/* Watermark quote — only visible on cyber */}
              <div
                aria-hidden="true"
                className="cyber-only absolute top-4 right-6 text-6xl font-serif leading-none opacity-20"
                style={{ color: "var(--shop-primary)" }}
              >
                &ldquo;
              </div>
              {r.rating && (
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`size-4 ${
                        j < r.rating!
                          ? "text-amber-400 fill-amber-400"
                          : "text-zinc-500/50"
                      }`}
                    />
                  ))}
                </div>
              )}
              <p className="text-sm leading-relaxed mb-6 italic relative z-10 line-clamp-5">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="cyber-review-avatar size-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--shop-primary), var(--shop-accent, var(--shop-primary)))",
                  }}
                >
                  {author[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold flex items-center gap-1">
                    {author}
                    {r.verified && (
                      <CheckCircle className="size-3 text-green-500" />
                    )}
                  </div>
                  {(r.location || r.date) && (
                    <div className="text-[11px] opacity-60">
                      {r.location ?? r.date}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
