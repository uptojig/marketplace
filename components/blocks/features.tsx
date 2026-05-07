/**
 * Features — bullet list of value props ("ส่งฟรี 990+", "คืนได้ 7 วัน", …).
 *
 * Three layouts (operator-controllable via the v12 schema):
 *   - "grid"  → 3-up grid of horizontally-laid cards (icon left, text right)
 *   - "list"  → vertical stack with bottom dividers
 *   - "cards" → 3-up grid of vertically-stacked cards (icon top, text below)
 *
 * All three flavors now ride daisyUI .card / divider tokens so theme
 * switches recolor cleanly. CheckCircle stays as the icon — it's a
 * recognized "feature" glyph regardless of brand.
 */

import { CheckCircle } from "lucide-react";

export function FeaturesBlock({
  title,
  items,
  layoutStyle = "grid",
}: {
  title?: string;
  layoutStyle?: "grid" | "list" | "cards";
  items?: Array<{ title?: string; description?: string }>;
}) {
  if (!items || items.length === 0) return null;

  const isList = layoutStyle === "list";
  const isCards = layoutStyle === "cards";

  return (
    <section className="px-6 py-12 max-w-5xl mx-auto">
      {title && (
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 cyber-gradient-text-on-cyber">
          {title}
        </h3>
      )}
      <div
        className={
          isList
            ? "flex flex-col gap-4 max-w-3xl mx-auto"
            : "grid md:grid-cols-3 gap-6"
        }
      >
        {items.map((item, i) =>
          isList ? (
            <div
              key={i}
              className="flex gap-3 p-4 border-b border-base-300 pb-4 last:border-0"
            >
              <CheckCircle className="size-5 mt-0.5 shrink-0 text-primary" />
              <div>
                <h4 className="text-sm font-semibold">{item.title}</h4>
                <p className="mt-1 text-xs text-base-content/70">
                  {item.description}
                </p>
              </div>
            </div>
          ) : (
            <div
              key={i}
              className={`card bg-base-100 border border-base-300 shadow-sm ${
                isCards ? "" : ""
              }`}
            >
              <div
                className={`card-body ${
                  isCards ? "items-center text-center p-6" : "flex-row p-4"
                }`}
              >
                <CheckCircle
                  className={`shrink-0 text-primary ${
                    isCards ? "size-8 mb-2" : "size-5 mt-0.5"
                  }`}
                />
                <div>
                  <h4
                    className={`font-semibold ${
                      isCards ? "text-base" : "text-sm"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`mt-1 text-base-content/70 ${
                      isCards ? "text-sm" : "text-xs"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
