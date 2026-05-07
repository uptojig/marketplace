/**
 * Stats — trust numbers (customers, reviews, delivery time, etc.).
 *
 * Rebuilt on daisyUI 5 primitives:
 *   - `.stats` container (vertical on mobile, horizontal at md+)
 *   - `.stat` cell with `.stat-value` (the big number) + `.stat-desc`
 *     (the small label)
 *   - `.bg-base-100` + `.border-base-300` so the band recolors
 *     correctly across all 35 themes via daisyUI tokens.
 *
 * Per-family tweaks (.theme-A serif numbers, .theme-cyber gradient
 * numbers) still apply through the .cyber-stats-* class hooks
 * preserved below — operators on those families keep their look,
 * everyone else rides the daisyUI default.
 */
export function StatsBlock({ items }: {
  items?: Array<{ label?: string; value?: string; icon?: string }>;
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="cyber-stats-band w-full px-6 py-12 md:py-16">
      <div className="stats stats-vertical md:stats-horizontal mx-auto w-full max-w-7xl bg-base-100 border border-base-300 shadow-sm">
        {items.map((item, i) => (
          <div
            key={i}
            className="cyber-stats-item stat place-items-center text-center"
          >
            <div className="cyber-stats-value stat-value text-3xl md:text-5xl text-primary">
              {item.value || "—"}
            </div>
            <div className="cyber-stats-label stat-desc mt-1 uppercase tracking-wider text-base-content/70">
              {item.label || ""}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
