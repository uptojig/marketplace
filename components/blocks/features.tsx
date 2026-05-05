"use client";

import { CheckCircle } from "lucide-react";

export function FeaturesBlock({ title, items, layoutStyle = "grid" }: {
  title?: string;
  layoutStyle?: "grid" | "list" | "cards";
  items?: Array<{ title?: string; description?: string }>;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto">
      {title && <h3 className="text-xl font-bold text-center mb-8">{title}</h3>}
      <div className={`
        ${layoutStyle === "grid" ? "grid md:grid-cols-3 gap-6" : ""}
        ${layoutStyle === "list" ? "flex flex-col gap-4 max-w-3xl mx-auto" : ""}
        ${layoutStyle === "cards" ? "grid md:grid-cols-3 gap-6" : ""}
      `}>
        {items.map((item, i) => (
          <div key={i} className={`
            flex gap-3 p-4
            ${layoutStyle === "grid" ? "rounded-xl border" : ""}
            ${layoutStyle === "list" ? "border-b pb-4 last:border-0" : ""}
            ${layoutStyle === "cards" ? "rounded-2xl shadow-sm border p-6 flex-col items-center text-center" : ""}
          `} style={{ background: layoutStyle !== 'list' ? 'var(--shop-card)' : 'transparent', borderColor: 'var(--shop-border)' }}>
            <CheckCircle className={`shrink-0 ${layoutStyle === "cards" ? "size-8 mb-2" : "size-5 mt-0.5"}`} style={{ color: "var(--shop-primary)" }} />
            <div>
              <h4 className={`font-semibold ${layoutStyle === "cards" ? "text-base" : "text-sm"}`}>{item.title}</h4>
              <p className={`mt-1 ${layoutStyle === "cards" ? "text-sm" : "text-xs"}`} style={{ color: 'var(--shop-ink-muted)' }}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
