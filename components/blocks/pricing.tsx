"use client";

import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function PricingBlock({ title, tiers }: {
  title?: string;
  tiers?: Array<{
    name?: string;
    price?: number;
    currency?: string;
    period?: string;
    features?: string[];
    ctaText?: string;
    ctaLink?: string;
    highlighted?: boolean;
    badge?: string;
  }>;
}) {
  if (!tiers || tiers.length === 0) return null;

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto">
      {title && <h3 className="text-xl font-bold text-center mb-8">{title}</h3>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(tiers.length, 4)}, 1fr)` }}>
        {tiers.map((tier, i) => (
          <div key={i} className={`rounded-2xl p-5 border ${tier.highlighted ? "border-2 bg-card" : "border-border/30 bg-card/50"}`}
            style={tier.highlighted ? { borderColor: "var(--primary, #a855f7)" } : {}}>
            {tier.badge && <Badge className="text-[10px] mb-2" variant="secondary">{tier.badge}</Badge>}
            <h4 className="font-semibold">{tier.name}</h4>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold" style={tier.highlighted ? { color: "var(--primary, #a855f7)" } : {}}>
                {tier.currency || "฿"}{tier.price?.toLocaleString()}
              </span>
              {tier.period && <span className="text-xs text-muted-foreground ml-1">/{tier.period}</span>}
            </div>
            <div className="space-y-2 mb-4">
              {tier.features?.map((f, j) => (
                <div key={j} className="flex items-center gap-2 text-xs"><Check className="size-3.5 text-green-500 shrink-0" /><span>{f}</span></div>
              ))}
            </div>
            {tier.ctaText && (
              <a href={tier.ctaLink || "#"} className={`block text-center py-2.5 rounded-lg text-sm font-medium transition ${tier.highlighted ? "text-white" : "border border-border/50 hover:bg-accent"}`}
                style={tier.highlighted ? { backgroundColor: "var(--primary, #a855f7)" } : {}}>
                {tier.ctaText}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
