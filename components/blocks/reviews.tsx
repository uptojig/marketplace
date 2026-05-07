"use client";

/**
 * Reviews — 3-column grid of customer testimonials.
 *
 * Rebuilt on daisyUI 5 primitives:
 *   - .card / .card-body for each review tile
 *   - .avatar / .avatar-placeholder for the author bubble (gradient
 *     primary→secondary so theme tokens drive the color)
 *   - .rating / .mask-star-2 for star displays — semantic, accessible,
 *     and works without re-rendering manual <Star> SVGs
 *   - .badge.badge-success.badge-xs for the verified checkmark
 *
 * The cyber-only quote watermark glyph is preserved as decoration
 * via the existing .cyber-only display rule in globals.css.
 */

import { CheckCircle } from "lucide-react";

interface Review {
  author?: string;
  name?: string;
  location?: string;
  rating?: number;
  text?: string;
  date?: string;
  verified?: boolean;
}

export function ReviewsBlock({
  title,
  reviews,
  overallRating,
  reviewCount,
}: {
  title?: string;
  reviews?: Review[];
  overallRating?: number;
  reviewCount?: number;
}) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="px-6 py-12 md:py-16 max-w-7xl mx-auto">
      {title && (
        <h3 className="text-3xl md:text-4xl font-black text-center mb-4 cyber-gradient-text-on-cyber">
          {title}
        </h3>
      )}

      {/* Aggregate row — daisyUI .rating component handles the stars */}
      {(overallRating || reviewCount) && (
        <div className="flex items-center justify-center gap-3 mb-10 text-sm">
          {overallRating !== undefined && (
            <span className="text-xl font-bold text-primary">
              {overallRating.toFixed(1)}
            </span>
          )}
          <RatingStars value={overallRating ?? 0} sizeClass="rating-md" />
          {reviewCount && (
            <span className="text-base-content/70">
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
              className="cyber-review-card card bg-base-100 border border-base-300 shadow-sm relative"
            >
              {/* Watermark quote — only visible on cyber via .cyber-only */}
              <div
                aria-hidden="true"
                className="cyber-only absolute top-4 right-6 text-6xl font-serif leading-none opacity-20 text-primary"
              >
                &ldquo;
              </div>

              <div className="card-body p-6">
                {r.rating !== undefined && (
                  <RatingStars
                    value={r.rating}
                    sizeClass="rating-sm"
                    className="mb-4"
                  />
                )}
                <p className="text-sm leading-relaxed mb-6 italic relative z-10 line-clamp-5 text-base-content/80">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {/* daisyUI avatar with placeholder content (initials) */}
                  <div className="avatar avatar-placeholder">
                    <div className="w-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content">
                      <span className="text-sm font-bold">
                        {author[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold flex items-center gap-1">
                      {author}
                      {r.verified && (
                        <CheckCircle className="size-3 text-success" />
                      )}
                    </div>
                    {(r.location || r.date) && (
                      <div className="text-[11px] text-base-content/60">
                        {r.location ?? r.date}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Display-only rating component using daisyUI .rating + .mask-star-2.
 *  Inputs are disabled so we just paint the value; for an interactive
 *  rating widget we'd drop the disabled attribute and bind onChange. */
function RatingStars({
  value,
  sizeClass = "rating-md",
  className = "",
}: {
  value: number;
  sizeClass?: "rating-xs" | "rating-sm" | "rating-md" | "rating-lg";
  className?: string;
}) {
  // daisyUI .rating expects N children; we give it a 1-5 set of
  // disabled radios where only the matching tier is `checked`.
  // Round to nearest int for display purposes.
  const n = Math.round(Math.min(Math.max(value, 0), 5));
  // Unique name so multiple <RatingStars> on a page don't collide.
  // Date.now() suffices because each render gets a fresh group.
  const groupName = `rating-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={`rating ${sizeClass} ${className}`} role="img" aria-label={`${n} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((tier) => (
        <input
          key={tier}
          type="radio"
          name={groupName}
          className="mask mask-star-2 bg-warning"
          aria-hidden="true"
          checked={tier === n}
          disabled
          readOnly
        />
      ))}
    </div>
  );
}
