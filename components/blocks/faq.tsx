"use client";

/**
 * FAQ — accordion of question + answer pairs.
 *
 * Rebuilt on daisyUI 5's `collapse` component using radio inputs so
 * only one question is open at a time (matches the reference UX).
 * Each item is its own card via `bg-base-100 border-base-300`, with
 * the daisyUI plus-icon variant for the toggle indicator.
 *
 * Light/cyber-specific styling (.cyber-faq-* classes) still applies
 * through the className hooks preserved on each item.
 */

import { MessageCircle } from "lucide-react";

export function FaqBlock({
  title,
  items,
}: {
  title?: string;
  items?: Array<{ question?: string; answer?: string }>;
}) {
  if (!items || items.length === 0) return null;

  // Stable radio name per render so opening one item closes the
  // others. We don't need it unique across pages — daisyUI scopes
  // by name within the same DOM tree only.
  const groupName = "faq-accordion";

  return (
    <section className="px-6 py-12 max-w-3xl mx-auto">
      {title && (
        <h3 className="text-3xl md:text-4xl font-black text-center mb-8 flex items-center justify-center gap-3 cyber-gradient-text-on-cyber">
          <MessageCircle className="cyber-faq-icon size-8 text-primary" />
          {title}
        </h3>
      )}
      <div className="cyber-faq-list space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="cyber-faq-item collapse collapse-plus bg-base-100 border border-base-300"
          >
            {/* Default-open the first item so visitors see at
                least one answer above the fold. */}
            <input
              type="radio"
              name={groupName}
              defaultChecked={i === 0}
            />
            <div className="cyber-faq-trigger collapse-title text-base font-bold">
              {item.question}
            </div>
            <div className="cyber-faq-content collapse-content text-sm text-base-content/70">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
