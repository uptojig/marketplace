"use client";

/**
 * Stats — trust numbers (customers, reviews, delivery time, etc.).
 *
 * Light themes (default): card grid with theme-color values.
 * Cyber theme: full-width slate band, gradient numbers, larger type.
 *   The `cyber-stats-band` selector below is keyed off `.theme-cyber`
 *   in globals.css so non-cyber stores see no change.
 */
export function StatsBlock({ items }: {
  items?: Array<{ label?: string; value?: string; icon?: string }>;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="cyber-stats-band w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-6 py-10 md:py-16 max-w-7xl mx-auto">
        {items.map((item, i) => (
          <div
            key={i}
            className="cyber-stats-item text-center p-4 rounded-xl border"
            style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}
          >
            <div
              className="cyber-stats-value text-3xl md:text-5xl font-black cyber-gradient-numbers"
              style={{ color: "var(--shop-primary)" }}
            >
              {item.value || "—"}
            </div>
            <div
              className="cyber-stats-label text-xs md:text-sm mt-2 uppercase tracking-wider"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {item.label || ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
