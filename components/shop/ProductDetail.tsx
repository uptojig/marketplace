"use client";

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

  const [activeImage, setActiveImage] = useState<string | undefined>(product.imageUrl ?? product.images[0]);
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
        Object.entries(selectedAttrs).every(([k, val]) => v.attributes?.[k] === val),
      ) ?? null
    );
  }, [product.variants, selectedAttrs]);

  const allAttrsPicked = Object.keys(attributeGroups).every((k) => selectedAttrs[k]);
  const requiresVariant = product.variants.length > 0;
  const canAdd = !requiresVariant || (allAttrsPicked && matchingVariant && (matchingVariant.inventory == null || matchingVariant.inventory > 0));

  const displayPrice = matchingVariant?.priceTHB ?? product.priceTHB;
  const stock = matchingVariant?.inventory ?? null;

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
    showConfirm(product.title + variantSuffix);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Gallery */}
      <div className="space-y-3">
        <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
          {activeImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeImage} alt={product.title} className="h-full w-full object-cover" />
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((img) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded border ${
                  activeImage === img ? "ring-2 ring-offset-1" : ""
                }`}
                style={activeImage === img ? { borderColor: product.storePrimaryColor } : {}}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold leading-tight">{product.title}</h1>
        <div className="text-sm text-muted-foreground">ราคาสินค้า</div>
        <div className="text-3xl font-bold" style={{ color: product.storePrimaryColor }}>
          {formatTHB(displayPrice)}
        </div>

        {/* Variant chips */}
        {Object.entries(attributeGroups).map(([attrName, values]) => (
          <div key={attrName} className="space-y-2">
            <div className="text-sm font-medium">{attrName}</div>
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                const picked = selectedAttrs[attrName] === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setSelectedAttrs((prev) => ({ ...prev, [attrName]: prev[attrName] === val ? "" : val }))
                    }
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      picked ? "text-white" : "hover:bg-accent"
                    }`}
                    style={picked ? { backgroundColor: product.storePrimaryColor, borderColor: product.storePrimaryColor } : {}}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quantity + stock */}
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">จำนวน</div>
          <div className="inline-flex h-9 items-center rounded-md border">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 text-lg disabled:opacity-50"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="h-full w-14 border-x text-center text-sm focus:outline-none"
            />
            <button type="button" onClick={() => setQty((q) => q + 1)} className="px-3 text-lg">
              +
            </button>
          </div>
          {stock != null && (
            <span className="text-xs text-muted-foreground">{stock > 0 ? `${stock} ชิ้น` : "หมด"}</span>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="mt-2 w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: canAdd ? "#16a34a" : "#9ca3af" }}
        >
          {requiresVariant && !allAttrsPicked
            ? `กรุณาเลือก${Object.keys(attributeGroups).join(" / ")}`
            : stock === 0
              ? "แจ้งเตือนเมื่อสินค้าเข้า"
              : "เพิ่มลงตะกร้า"}
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: canAdd ? "#dc2626" : "#9ca3af" }}
        >
          ซื้อทันที
        </button>

        {product.description && (
          <details className="rounded-md border p-3 text-sm">
            <summary className="cursor-pointer font-medium">รายละเอียดสินค้า</summary>
            <div className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{product.description}</div>
          </details>
        )}
      </div>
    </div>
  );
}
