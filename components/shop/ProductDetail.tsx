"use client";

/**
 * Product detail page — matches Tailwind UI Plus "Product Overview"
 * pattern (https://tailwindcss.com/plus/ui-blocks#product-ecommerce):
 *
 *   ┌─ gallery ────────┬─ info ──────────────────┐
 *   │ hero image       │ Title (large)            │
 *   │                  │ ฿XXX                     │
 *   │ thumbs strip     │ ─── divider ───          │
 *   │                  │ Color picker             │
 *   │                  │ Size picker              │
 *   │                  │ Quantity + stock         │
 *   │                  │ [ADD TO BAG] (primary)   │
 *   │                  │ ─── divider ───          │
 *   │                  │ Description body         │
 *   │                  │ ▼ Details (disclosure)   │
 *   └──────────────────┴──────────────────────────┘
 *
 * Theme cascade through var(--shop-*) so each store's design family
 * carries the accent color (caselnw stays purple, others stay theirs).
 */
import { useMemo, useState } from "react";
import { useCart } from "@/lib/store/cart";
import { useCartConfirmation } from "@/lib/store/cartConfirm";
import { formatTHB } from "@/lib/utils";

interface Variant {
  id: string;
  externalVariantId: string;
  attributes: Record<string, string>;
  priceTHB: number;
  inventory: number | null;
  imageUrl?: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  priceTHB: number;
  imageUrl?: string;
  images: string[];
  storeName: string;
  storeSlug: string;
  storePrimaryColor: string;
  variants: Variant[];
}

export function ProductDetail({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const [activeImage, setActiveImage] = useState<string | undefined>(
    product.imageUrl ?? product.images[0],
  );
  const [qty, setQty] = useState(1);

  // Derive attribute groups: { "Size": ["XS","S","M",...], "Color": [...] }
  const attributeGroups = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const v of product.variants) {
      for (const [k, val] of Object.entries(v.attributes ?? {})) {
        if (!map[k]) map[k] = [];
        if (!map[k].includes(val)) map[k].push(val);
      }
    }
    return map;
  }, [product.variants]);

  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});

  const matchingVariant = useMemo(() => {
    if (product.variants.length === 0) return null;
    return (
      product.variants.find((v) =>
        Object.entries(selectedAttrs).every(
          ([k, val]) => v.attributes?.[k] === val,
        ),
      ) ?? null
    );
  }, [product.variants, selectedAttrs]);

  const allAttrsPicked = Object.keys(attributeGroups).every(
    (k) => selectedAttrs[k],
  );
  const requiresVariant = product.variants.length > 0;
  const canAdd =
    !requiresVariant ||
    (allAttrsPicked &&
      matchingVariant &&
      (matchingVariant.inventory == null || matchingVariant.inventory > 0));

  const displayPrice = matchingVariant?.priceTHB ?? product.priceTHB;
  const stock = matchingVariant?.inventory ?? null;

  // All product images merged with main imageUrl (deduped)
  const allImages = useMemo(() => {
    const set = new Set<string>();
    if (product.imageUrl) set.add(product.imageUrl);
    for (const img of product.images) set.add(img);
    return Array.from(set);
  }, [product.imageUrl, product.images]);

  function handleAdd() {
    if (!canAdd) return;
    const variantSuffix = matchingVariant
      ? ` (${Object.values(matchingVariant.attributes).join(" / ")})`
      : "";
    add(
      {
        productId: product.id,
        title: product.title + variantSuffix,
        imageUrl: matchingVariant?.imageUrl ?? product.imageUrl,
        priceTHB: displayPrice,
        storeSlug: product.storeSlug,
        storeName: product.storeName,
      },
      qty,
    );
    showConfirm(product.title + variantSuffix, product.storeSlug);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14 lg:max-w-7xl lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
        {/* ── Gallery ──────────────────────────────────────── */}
        <div className="flex flex-col-reverse">
          {/* Thumbnails — show only when multiple images */}
          {allImages.length > 1 && (
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-4">
                {allImages.slice(0, 4).map((img) => {
                  const active = activeImage === img;
                  return (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className="relative flex aspect-square cursor-pointer items-center justify-center rounded-md overflow-hidden ring-1 ring-inset transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        ringColor: active
                          ? "var(--shop-primary)"
                          : "var(--shop-border)",
                      } as React.CSSProperties}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      {active && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-inset"
                          style={{ ringColor: "var(--shop-primary)" } as React.CSSProperties}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main image */}
          <div className="aspect-square w-full overflow-hidden rounded-lg" style={{ background: "var(--shop-bg)" }}>
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage}
                alt={product.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center text-sm"
                style={{ color: "var(--shop-ink-muted)" }}
              >
                ไม่มีรูปภาพ
              </div>
            )}
          </div>
        </div>

        {/* ── Info ─────────────────────────────────────────── */}
        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: "var(--shop-ink)" }}
          >
            {product.title}
          </h1>

          {/* Price */}
          <div className="mt-3">
            <h2 className="sr-only">ราคาสินค้า</h2>
            <p
              className="text-3xl tracking-tight"
              style={{ color: "var(--shop-ink)" }}
            >
              {formatTHB(displayPrice)}
            </p>
          </div>

          {/* Variant pickers */}
          {Object.keys(attributeGroups).length > 0 && (
            <form className="mt-8">
              {Object.entries(attributeGroups).map(([attrName, values]) => (
                <fieldset key={attrName} className="mt-6 first:mt-0">
                  <legend
                    className="text-sm font-medium"
                    style={{ color: "var(--shop-ink)" }}
                  >
                    {attrName}
                    {selectedAttrs[attrName] && (
                      <span
                        className="ml-2 font-normal"
                        style={{ color: "var(--shop-ink-muted)" }}
                      >
                        : {selectedAttrs[attrName]}
                      </span>
                    )}
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {values.map((val) => {
                      const picked = selectedAttrs[attrName] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setSelectedAttrs((prev) => ({
                              ...prev,
                              [attrName]: prev[attrName] === val ? "" : val,
                            }))
                          }
                          className="flex items-center justify-center rounded-md border px-3.5 py-2 text-sm font-medium uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={
                            picked
                              ? {
                                  backgroundColor: "var(--shop-primary)",
                                  borderColor: "var(--shop-primary)",
                                  color: "white",
                                }
                              : {
                                  background: "var(--shop-card)",
                                  borderColor: "var(--shop-border)",
                                  color: "var(--shop-ink)",
                                }
                          }
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </form>
          )}

          {/* Quantity + stock */}
          <div className="mt-8 flex items-center gap-4">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--shop-ink)" }}
            >
              จำนวน
            </span>
            <div
              className="inline-flex items-center rounded-md border"
              style={{ borderColor: "var(--shop-border)" }}
            >
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="ลด"
                className="px-3 py-2 text-lg disabled:opacity-50"
                style={{ color: "var(--shop-ink)" }}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="w-12 bg-transparent py-2 text-center text-sm focus:outline-none"
                style={{
                  color: "var(--shop-ink)",
                  borderLeft: "1px solid var(--shop-border)",
                  borderRight: "1px solid var(--shop-border)",
                }}
              />
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="เพิ่ม"
                className="px-3 py-2 text-lg"
                style={{ color: "var(--shop-ink)" }}
              >
                +
              </button>
            </div>
            {stock != null && (
              <span
                className="text-xs"
                style={{ color: "var(--shop-ink-muted)" }}
              >
                {stock > 0 ? `เหลือ ${stock} ชิ้น` : "สินค้าหมด"}
              </span>
            )}
          </div>

          {/* Primary CTA — single, full-width */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="mt-10 flex w-full items-center justify-center rounded-md border-transparent py-3 px-8 text-base font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: canAdd
                ? "var(--shop-primary)"
                : "var(--shop-ink-muted)",
            }}
          >
            {requiresVariant && !allAttrsPicked
              ? `กรุณาเลือก${Object.keys(attributeGroups).join(" / ")}`
              : stock === 0
                ? "แจ้งเตือนเมื่อสินค้าเข้า"
                : "เพิ่มลงตะกร้า"}
          </button>

          {/* Description */}
          {product.description && (
            <div className="mt-10 border-t pt-10" style={{ borderColor: "var(--shop-border)" }}>
              <h3
                className="text-sm font-medium"
                style={{ color: "var(--shop-ink)" }}
              >
                รายละเอียดสินค้า
              </h3>
              <div
                className="mt-4 space-y-4 text-sm leading-relaxed"
                style={{ color: "var(--shop-ink-muted)" }}
              >
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            </div>
          )}

          {/* Shipping & returns disclosure */}
          <div
            className="mt-6 border-t"
            style={{ borderColor: "var(--shop-border)" }}
          >
            <Disclosure title="การจัดส่งและคืนสินค้า">
              <p>จัดส่งทั่วไทย 1-3 วันทำการ ผ่าน Kerry / Flash / EMS</p>
              <p className="mt-2">
                เปลี่ยน / คืนสินค้าได้ภายใน 7 วัน หากสินค้ามีตำหนิจากโรงงาน
              </p>
              <p className="mt-2">
                ดูรายละเอียดเพิ่มเติมที่{" "}
                <a
                  href={`/stores/${product.storeSlug}/shipping`}
                  className="underline"
                  style={{ color: "var(--shop-primary)" }}
                >
                  นโยบายการจัดส่ง
                </a>{" "}
                และ{" "}
                <a
                  href={`/stores/${product.storeSlug}/returns`}
                  className="underline"
                  style={{ color: "var(--shop-primary)" }}
                >
                  เงื่อนไขการคืน
                </a>
              </p>
            </Disclosure>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Disclosure — TUI Plus pattern (chevron rotates on open)
 * Native <details>/<summary> for zero-JS server rendering.
 * ────────────────────────────────────────────────────────────── */
function Disclosure({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group py-6">
      <summary
        className="flex w-full items-center justify-between cursor-pointer list-none text-sm font-medium"
        style={{ color: "var(--shop-ink)" }}
      >
        <span>{title}</span>
        <svg
          className="h-5 w-5 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <div
        className="mt-4 text-sm leading-relaxed"
        style={{ color: "var(--shop-ink-muted)" }}
      >
        {children}
      </div>
    </details>
  );
}
