"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type OfferItem = {
  title?: string;
  imageUrl?: string;
  href?: string;
  price?: string;
};

function coerceItems(raw: unknown): OfferItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((it) => {
    const obj = (typeof it === "object" && it !== null ? it : {}) as Record<
      string,
      unknown
    >;
    return {
      title: typeof obj.title === "string" ? obj.title : "",
      imageUrl: typeof obj.imageUrl === "string" ? obj.imageUrl : "",
      href: typeof obj.href === "string" ? obj.href : "",
      price: typeof obj.price === "string" ? obj.price : "",
    };
  });
}

export function OfferGridForm({
  content,
  onChange,
  disabled,
}: {
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const [headline, setHeadline] = useState<string>(
    typeof content.headline === "string" ? content.headline : "",
  );
  const [items, setItems] = useState<OfferItem[]>(() =>
    coerceItems(content.items),
  );

  function emit(nextItems: OfferItem[], nextHeadline: string) {
    onChange({ ...content, headline: nextHeadline, items: nextItems });
  }

  function updateItem(idx: number, patch: Partial<OfferItem>) {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    setItems(next);
    emit(next, headline);
  }

  function addItem() {
    const next = [...items, { title: "", imageUrl: "", href: "", price: "" }];
    setItems(next);
    emit(next, headline);
  }

  function removeItem(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    emit(next, headline);
  }

  return (
    <div className="space-y-3" aria-label="OfferGrid form">
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium text-stone-600">
          Headline (ไม่บังคับ)
        </span>
        <input
          value={headline}
          onChange={(e) => {
            setHeadline(e.target.value);
            emit(items, e.target.value);
          }}
          disabled={disabled}
          className="w-full rounded border px-3 py-1.5 text-sm"
        />
      </label>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-md border border-stone-200 bg-stone-50/50 p-2 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase text-stone-500">
                Item {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 disabled:opacity-30"
                aria-label={`Remove item ${i + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                value={it.title ?? ""}
                onChange={(e) => updateItem(i, { title: e.target.value })}
                disabled={disabled}
                placeholder="Title"
                className="rounded border px-2 py-1 text-xs"
                aria-label={`Item ${i + 1} title`}
              />
              <input
                value={it.price ?? ""}
                onChange={(e) => updateItem(i, { price: e.target.value })}
                disabled={disabled}
                placeholder="Price"
                className="rounded border px-2 py-1 text-xs"
                aria-label={`Item ${i + 1} price`}
              />
            </div>
            <input
              value={it.imageUrl ?? ""}
              onChange={(e) => updateItem(i, { imageUrl: e.target.value })}
              disabled={disabled}
              placeholder="Image URL"
              className="w-full rounded border px-2 py-1 text-xs font-mono"
              aria-label={`Item ${i + 1} image URL`}
            />
            <input
              value={it.href ?? ""}
              onChange={(e) => updateItem(i, { href: e.target.value })}
              disabled={disabled}
              placeholder="Link href"
              className="w-full rounded border px-2 py-1 text-xs font-mono"
              aria-label={`Item ${i + 1} link`}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        disabled={disabled}
        className="inline-flex items-center gap-1 rounded border border-dashed border-stone-300 px-3 py-1.5 text-xs text-stone-600 hover:border-stone-400 disabled:opacity-50"
      >
        <Plus className="h-3 w-3" /> เพิ่ม Item
      </button>
    </div>
  );
}
