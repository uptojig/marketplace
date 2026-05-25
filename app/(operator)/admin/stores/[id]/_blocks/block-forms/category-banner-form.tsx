"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { CATEGORY_ICON_NAMES } from "@/components/storefront/BlockRenderer";

type CategoryItem = {
  icon?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  linkTo?: string;
  badge?: string;
  ctaText?: string;
  productCount?: number;
};

type Layout = "grid-2" | "grid-3" | "grid-4" | "masonry" | "carousel";
type CardStyle = "overlay" | "icon-card";

const LAYOUTS: ReadonlyArray<Layout> = [
  "grid-2",
  "grid-3",
  "grid-4",
  "masonry",
  "carousel",
];
const CARD_STYLES: ReadonlyArray<CardStyle> = ["overlay", "icon-card"];

function coerceItems(raw: unknown): CategoryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((it) => {
    const obj = (typeof it === "object" && it !== null ? it : {}) as Record<
      string,
      unknown
    >;
    const productCount =
      typeof obj.productCount === "number" && Number.isFinite(obj.productCount)
        ? obj.productCount
        : undefined;
    return {
      icon: typeof obj.icon === "string" ? obj.icon : "",
      name: typeof obj.name === "string" ? obj.name : "",
      description:
        typeof obj.description === "string" ? obj.description : "",
      imageUrl: typeof obj.imageUrl === "string" ? obj.imageUrl : "",
      linkTo: typeof obj.linkTo === "string" ? obj.linkTo : "",
      badge: typeof obj.badge === "string" ? obj.badge : "",
      ctaText: typeof obj.ctaText === "string" ? obj.ctaText : "",
      productCount,
    };
  });
}

export function CategoryBannerForm({
  content,
  onChange,
  disabled,
}: {
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const [title, setTitle] = useState<string>(
    typeof content.title === "string" ? content.title : "",
  );
  const [subtitle, setSubtitle] = useState<string>(
    typeof content.subtitle === "string" ? content.subtitle : "",
  );
  const [layout, setLayout] = useState<Layout>(() => {
    const v = typeof content.layout === "string" ? content.layout : "grid-3";
    return (LAYOUTS as ReadonlyArray<string>).includes(v)
      ? (v as Layout)
      : "grid-3";
  });
  const [cardStyle, setCardStyle] = useState<CardStyle>(() => {
    const v =
      typeof content.cardStyle === "string" ? content.cardStyle : "overlay";
    return (CARD_STYLES as ReadonlyArray<string>).includes(v)
      ? (v as CardStyle)
      : "overlay";
  });
  const [viewAllLabel, setViewAllLabel] = useState<string>(
    typeof content.viewAllLabel === "string" ? content.viewAllLabel : "",
  );
  const [viewAllHref, setViewAllHref] = useState<string>(
    typeof content.viewAllHref === "string" ? content.viewAllHref : "",
  );
  const [items, setItems] = useState<CategoryItem[]>(() =>
    coerceItems(content.categories),
  );

  function emit(next: {
    title?: string;
    subtitle?: string;
    layout?: Layout;
    cardStyle?: CardStyle;
    viewAllLabel?: string;
    viewAllHref?: string;
    items?: CategoryItem[];
  }) {
    onChange({
      ...content,
      title: next.title ?? title,
      subtitle: next.subtitle ?? subtitle,
      layout: next.layout ?? layout,
      cardStyle: next.cardStyle ?? cardStyle,
      viewAllLabel: next.viewAllLabel ?? viewAllLabel,
      viewAllHref: next.viewAllHref ?? viewAllHref,
      categories: next.items ?? items,
    });
  }

  function updateItem(idx: number, patch: Partial<CategoryItem>) {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    setItems(next);
    emit({ items: next });
  }

  function addItem() {
    const next: CategoryItem[] = [
      ...items,
      {
        icon: "",
        name: "",
        description: "",
        imageUrl: "",
        linkTo: "",
        badge: "",
        ctaText: "",
      },
    ];
    setItems(next);
    emit({ items: next });
  }

  function removeItem(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    emit({ items: next });
  }

  return (
    <div className="space-y-3" aria-label="CategoryBanner form">
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-stone-600">
            Title
          </span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              emit({ title: e.target.value });
            }}
            disabled={disabled}
            placeholder="เลือกตามประเภท"
            className="w-full rounded border px-3 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-stone-600">
            Subtitle (ไม่บังคับ)
          </span>
          <input
            value={subtitle}
            onChange={(e) => {
              setSubtitle(e.target.value);
              emit({ subtitle: e.target.value });
            }}
            disabled={disabled}
            className="w-full rounded border px-3 py-1.5 text-sm"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-stone-600">
            Layout
          </span>
          <select
            value={layout}
            onChange={(e) => {
              const v = e.target.value as Layout;
              setLayout(v);
              emit({ layout: v });
            }}
            disabled={disabled}
            className="w-full rounded border bg-white px-3 py-1.5 text-sm"
          >
            {LAYOUTS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-stone-600">
            Card style
          </span>
          <select
            value={cardStyle}
            onChange={(e) => {
              const v = e.target.value as CardStyle;
              setCardStyle(v);
              emit({ cardStyle: v });
            }}
            disabled={disabled}
            className="w-full rounded border bg-white px-3 py-1.5 text-sm"
          >
            {CARD_STYLES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-stone-600">
            View-all label
          </span>
          <input
            value={viewAllLabel}
            onChange={(e) => {
              setViewAllLabel(e.target.value);
              emit({ viewAllLabel: e.target.value });
            }}
            disabled={disabled}
            placeholder="ดูทั้งหมด"
            className="w-full rounded border px-3 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-stone-600">
            View-all link (เริ่ม / สำหรับเส้นทางในร้าน)
          </span>
          <input
            value={viewAllHref}
            onChange={(e) => {
              setViewAllHref(e.target.value);
              emit({ viewAllHref: e.target.value });
            }}
            disabled={disabled}
            placeholder="/categories"
            className="w-full rounded border px-3 py-1.5 text-xs font-mono"
          />
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase text-stone-500">
          Categories
        </p>
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
                aria-label={`Remove category ${i + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <input
                value={it.name ?? ""}
                onChange={(e) => updateItem(i, { name: e.target.value })}
                disabled={disabled}
                placeholder="Name (เช่น กล่องไปรษณีย์)"
                className="rounded border px-2 py-1 text-xs"
                aria-label={`Category ${i + 1} name`}
              />
              <select
                value={it.icon ?? ""}
                onChange={(e) => updateItem(i, { icon: e.target.value })}
                disabled={disabled}
                className="rounded border bg-white px-2 py-1 text-xs"
                aria-label={`Category ${i + 1} icon`}
              >
                <option value="">— ไม่มี icon —</option>
                {CATEGORY_ICON_NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={it.description ?? ""}
              onChange={(e) =>
                updateItem(i, { description: e.target.value })
              }
              disabled={disabled}
              rows={2}
              placeholder="Description (ไม่บังคับ)"
              className="w-full rounded border px-2 py-1 text-xs"
              aria-label={`Category ${i + 1} description`}
            />

            <input
              value={it.imageUrl ?? ""}
              onChange={(e) => updateItem(i, { imageUrl: e.target.value })}
              disabled={disabled}
              placeholder="Image URL (ไม่บังคับ)"
              className="w-full rounded border px-2 py-1 text-xs font-mono"
              aria-label={`Category ${i + 1} image URL`}
            />

            <div className="grid grid-cols-2 gap-1.5">
              <input
                value={it.linkTo ?? ""}
                onChange={(e) => updateItem(i, { linkTo: e.target.value })}
                disabled={disabled}
                placeholder="Link (/categories/box)"
                className="w-full rounded border px-2 py-1 text-xs font-mono"
                aria-label={`Category ${i + 1} link`}
              />
              <input
                value={it.ctaText ?? ""}
                onChange={(e) => updateItem(i, { ctaText: e.target.value })}
                disabled={disabled}
                placeholder="CTA text (ดูสินค้า)"
                className="w-full rounded border px-2 py-1 text-xs"
                aria-label={`Category ${i + 1} CTA text`}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <input
                value={it.badge ?? ""}
                onChange={(e) => updateItem(i, { badge: e.target.value })}
                disabled={disabled}
                placeholder="Badge (ใหม่/โปร)"
                className="w-full rounded border px-2 py-1 text-xs"
                aria-label={`Category ${i + 1} badge`}
              />
              <input
                type="number"
                value={
                  typeof it.productCount === "number" ? it.productCount : ""
                }
                onChange={(e) => {
                  const v = e.target.value;
                  updateItem(i, {
                    productCount: v === "" ? undefined : Number(v),
                  });
                }}
                disabled={disabled}
                placeholder="Product count"
                className="w-full rounded border px-2 py-1 text-xs"
                aria-label={`Category ${i + 1} product count`}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        disabled={disabled}
        className="inline-flex items-center gap-1 rounded border border-dashed border-stone-300 px-3 py-1.5 text-xs text-stone-600 hover:border-stone-400 disabled:opacity-50"
      >
        <Plus className="h-3 w-3" /> เพิ่ม Category
      </button>
    </div>
  );
}
