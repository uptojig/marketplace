"use client";

export function StatsBlock({ items }: {
  items?: Array<{ label?: string; value?: string; icon?: string }>;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-10 max-w-5xl mx-auto">
      {items.map((item, i) => (
        <div key={i} className="text-center p-4 rounded-xl border" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
          <div className="text-2xl font-bold" style={{ color: "var(--shop-primary)" }}>
            {item.value || "—"}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--shop-ink-muted)' }}>{item.label || ""}</div>
        </div>
      ))}
    </div>
  );
}
