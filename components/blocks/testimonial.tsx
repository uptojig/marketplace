/**
 * Testimonial — customer quotes with optional rating + location.
 *
 * Three layouts:
 *   - "grid" / "carousel" → daisyUI .card.bg-base-100 tiles
 *   - "featured"          → single centered hero quote with serif body
 *
 * The Quote glyph from lucide stays as decoration (~30% opacity).
 * Stars use the same daisyUI .rating helper as Reviews.
 */

import { Quote } from "lucide-react";

interface QuoteItem {
  text?: string;
  author?: string;
  location?: string;
  rating?: number;
}

export function TestimonialBlock({
  title,
  quotes,
  layoutStyle = "grid",
}: {
  title?: string;
  layoutStyle?: "grid" | "carousel" | "featured";
  quotes?: QuoteItem[];
}) {
  if (!quotes || quotes.length === 0) return null;

  const isFeatured = layoutStyle === "featured";
  const isCarousel = layoutStyle === "carousel";

  return (
    <section className="px-6 py-12 max-w-5xl mx-auto overflow-hidden">
      {title && (
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 cyber-gradient-text-on-cyber">
          {title}
        </h3>
      )}
      <div
        className={
          isFeatured
            ? "flex flex-col gap-8 items-center max-w-2xl mx-auto"
            : isCarousel
              ? "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 no-scrollbar"
              : "grid md:grid-cols-3 gap-4"
        }
      >
        {quotes.map((q, i) => (
          <div
            key={i}
            className={`card bg-base-100 border border-base-300 ${
              isCarousel ? "min-w-[300px] snap-center shrink-0" : ""
            } ${isFeatured ? "shadow-sm w-full" : "shadow-sm"}`}
          >
            <div className={`card-body p-5 ${isFeatured ? "text-center" : ""}`}>
              <Quote
                aria-hidden="true"
                className={`text-base-content/30 ${
                  isFeatured ? "mx-auto size-8 mb-2" : "size-5 mb-3"
                }`}
              />
              {q.rating !== undefined && (
                <RatingDots
                  value={q.rating}
                  className={isFeatured ? "justify-center mb-4" : "mb-2"}
                />
              )}
              <p
                className={`leading-relaxed mb-3 text-base-content/80 ${
                  isFeatured
                    ? "text-lg md:text-xl font-serif italic mb-6"
                    : "text-sm"
                }`}
              >
                &ldquo;{q.text}&rdquo;
              </p>
              <div>
                <div
                  className={`font-medium ${
                    isFeatured ? "text-base" : "text-sm"
                  }`}
                >
                  {q.author}
                </div>
                {q.location && (
                  <div
                    className={`text-base-content/70 ${
                      isFeatured ? "text-sm mt-1" : "text-xs"
                    }`}
                  >
                    {q.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RatingDots({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const n = Math.round(Math.min(Math.max(value, 0), 5));
  const groupName = `t-rating-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={`rating rating-sm ${className}`} role="img" aria-label={`${n} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((tier) => (
        <input
          key={tier}
          type="radio"
          name={groupName}
          className="mask mask-star-2 bg-warning"
          checked={tier === n}
          disabled
          readOnly
        />
      ))}
    </div>
  );
}
