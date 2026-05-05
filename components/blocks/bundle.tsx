"use client";

import { Badge } from "@/components/ui/badge";

export function BundleBlock({ title, items, bundlePrice, originalTotal, savings, ctaText, ctaLink, badge }: {
  title?: string;
  items?: Array<{ name?: string; imageUrl?: string; altText?: string; originalPrice?: number }>;
  bundlePrice?: number;
  originalTotal?: number;
  savings?: number;
  ctaText?: string;
  ctaLink?: string;
  badge?: string;
}) {
  return (
    <div className="px-6 py-12 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-border/30 bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title || "ชุดสุดคุ้ม"}</h3>
          {badge && <Badge variant="destructive" className="text-xs">{badge}</Badge>}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {items?.map((item, i) => (
            <div key={i} className="shrink-0 w-28">
              <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden mb-2">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.altText || item.name || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 text-[10px]">{item.name}</div>
                )}
              </div>
              <p className="text-xs truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground line-through">฿{item.originalPrice?.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-border/30">
          <div>
            <span className="text-2xl font-bold" style={{ color: "var(--primary, #a855f7)" }}>฿{bundlePrice?.toLocaleString()}</span>
            {originalTotal && <span className="text-sm text-muted-foreground line-through ml-2">฿{originalTotal.toLocaleString()}</span>}
            {savings && <span className="text-sm text-green-500 ml-2">ประหยัด ฿{savings.toLocaleString()}</span>}
          </div>
          {ctaText && (
            <a href={ctaLink || "#"} className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm" style={{ backgroundColor: "var(--primary, #a855f7)" }}>{ctaText}</a>
          )}
        </div>
      </div>
    </div>
  );
}
