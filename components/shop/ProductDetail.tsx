"use client";

/**
 * Product detail — refit to match the user-supplied reference
 * (tailwinduikit "Balenciaga Signature Sweatshirt" pattern):
 *
 *   ┌─ gallery (md:flex) ──┬─ info (xl:w-2/5) ──────────┐
 *   │ ▣ stacked image 1     │ Subtitle (collection)       │
 *   │                       │ Title                       │
 *   │ ▣ stacked image 2     │ ─────                       │
 *   │                       │ Colours: Smoke Blue ▾       │
 *   │ (mobile: 1 hero +     │ ─────                       │
 *   │  4 thumb row)         │ Size: 38.2 ▾                │
 *   │                       │ ─────                       │
 *   │                       │ [● Add to cart] (full-width)│
 *   │                       │ Description body            │
 *   │                       │ Product Code:               │
 *   │                       │ ▾ Shipping and returns      │
 *   │                       │ ▾ Contact us                │
 *   └───────────────────────┴─────────────────────────────┘
 *
 * Color/Size rows are <details> — collapsed by default, showing
 * the current value + chevron in the summary, expanding to reveal
 * a chip picker (so variant browsing without burying interaction).
 *
 * Theme cascade through var(--shop-*) so each store's design family
 * carries the accent.
 */
import { useMemo, useState } from "react";
import { useCart } from "@/lib/store/cart";
import { useCartConfirmation } from "@/lib/store/cartConfirm";
import { formatTHB } from "@/lib/utils";
import { ChevronDown, ShoppingBag } from "lucide-react";

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
  /** Optional collection / category subtitle shown above the title */
  subtitle?: string;
  description: string;
  priceTHB: number;
  imageUrl?: string;
  images: string[];
  storeName: string;
  storeSlug: string;
  storePrimaryColor: string;
  variants: Variant[];
  /** Optional supplier SKU shown in the meta strip */
  productCode?: string;
}

export function ProductDetail({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const [qty, setQty] = useState(1);

  // ── Variant attribute groups ─────────────────────────────────
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

  // All product images (deduped)
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
    <div className="md:flex items-start justify-center py-8 2xl:px-20 md:px-6 px-0">
      {/* ── Gallery (desktop: stacked, mobile: hero + thumb row) ── */}
      <Gallery images={allImages} title={product.title} />

      {/* ── Info column ────────────────────────────────────────── */}
      <div className="xl:w-2/5 md:w-1/2 lg:ml-8 md:ml-6 md:mt-0 mt-6 px-4 md:px-0">
        {/* Subtitle + title */}
        <div className="border-b pb-6" style={{ borderColor: "var(--shop-border)" }}>
          {product.subtitle && (
            <p className="text-sm leading-none" style={{ color: "var(--shop-ink-muted)" }}>
              {product.subtitle}
            </p>
          )}
          <h1
            className="lg:text-2xl text-xl font-semibold leading-7 mt-2"
            style={{ color: "var(--shop-ink)" }}
          >
            {product.title}
          </h1>
          <p
            className="lg:text-3xl text-2xl font-bold mt-3"
            style={{ color: "var(--shop-ink)" }}
          >
            {formatTHB(displayPrice)}
          </p>
        </div>

        {/* Variant pickers — disclosure style (header shows selection) */}
        {Object.entries(attributeGroups).map(([attrName, values]) => (
          <VariantDisclosure
            key={attrName}
            attrName={attrName}
            values={values}
            selected={selectedAttrs[attrName]}
            onSelect={(val) =>
              setSelectedAttrs((prev) => ({
                ...prev,
                [attrName]: prev[attrName] === val ? "" : val,
              }))
            }
          />
        ))}

        {/* Quantity + stock */}
        <div
          className="py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--shop-border)" }}
        >
          <p
            className="text-base leading-4"
            style={{ color: "var(--shop-ink)" }}
          >
            จำนวน
          </p>
          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center rounded-md border"
              style={{ borderColor: "var(--shop-border)" }}
            >
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="ลด"
                className="px-3 py-1.5 text-lg disabled:opacity-50"
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
                className="w-12 bg-transparent py-1.5 text-center text-sm focus:outline-none"
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
                className="px-3 py-1.5 text-lg"
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
                {stock > 0 ? `เหลือ ${stock} ชิ้น` : "หมด"}
              </span>
            )}
          </div>
        </div>

        {/* Primary CTA — single, full-width, solid */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="mt-6 text-base flex items-center justify-center leading-none w-full py-4 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: canAdd
              ? "var(--shop-primary)"
              : "var(--shop-ink-muted)",
            color: "white",
          }}
        >
          <ShoppingBag className="mr-3 h-4 w-4" />
          {requiresVariant && !allAttrsPicked
            ? `กรุณาเลือก${Object.keys(attributeGroups).join(" / ")}`
            : stock === 0
              ? "แจ้งเตือนเมื่อสินค้าเข้า"
              : "เพิ่มลงตะกร้า"}
        </button>

        {/* Description + meta */}
        {product.description && (
          <div className="mt-7">
            <p
              className="text-base leading-relaxed lg:leading-tight"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              <span className="whitespace-pre-line">{product.description}</span>
            </p>
            {product.productCode && (
              <p
                className="text-base leading-4 mt-7"
                style={{ color: "var(--shop-ink-muted)" }}
              >
                Product Code: {product.productCode}
              </p>
            )}
          </div>
        )}

        {/* Shipping & returns */}
        <Disclosure title="การจัดส่งและคืนสินค้า" topBorder>
          <p>จัดส่งทั่วไทย 1-3 วันทำการ ผ่าน Kerry / Flash / EMS</p>
          <p className="mt-2">
            เปลี่ยน / คืนสินค้าได้ภายใน 7 วัน หากสินค้ามีตำหนิจากโรงงาน
          </p>
          <p className="mt-2">
            รายละเอียดเพิ่มเติม:{" "}
            <a
              href={`/stores/${product.storeSlug}/shipping`}
              className="underline"
              style={{ color: "var(--shop-primary)" }}
            >
              นโยบายการจัดส่ง
            </a>
            {" • "}
            <a
              href={`/stores/${product.storeSlug}/returns`}
              className="underline"
              style={{ color: "var(--shop-primary)" }}
            >
              เงื่อนไขการคืน
            </a>
          </p>
        </Disclosure>

        {/* Contact us */}
        <Disclosure title="ติดต่อสอบถาม">
          <p>
            หากมีคำถามเกี่ยวกับสินค้า การสั่งซื้อ หรือการจัดส่ง
            ติดต่อ {product.storeName} ได้ที่{" "}
            <a
              href={`/stores/${product.storeSlug}/contact`}
              className="underline"
              style={{ color: "var(--shop-primary)" }}
            >
              หน้าติดต่อเรา
            </a>
          </p>
        </Disclosure>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Gallery — TWO stacked images on desktop, hero + 4 thumbs on mobile
 * Reference: tailwinduikit "Balenciaga" — image stack uses
 *   xl:w-2/6 lg:w-2/5 w-80 (~40% on desktop, 320px on mobile)
 * ────────────────────────────────────────────────────────────── */
function Gallery({ images, title }: { images: string[]; title: string }) {
  const hero = images[0];
  const second = images[1];
  const thumbs = images.slice(0, 4);

  if (!hero) {
    return (
      <div className="xl:w-2/6 lg:w-2/5 w-80 md:block hidden">
        <div
          className="aspect-square rounded flex items-center justify-center text-sm"
          style={{
            background: "var(--shop-bg)",
            color: "var(--shop-ink-muted)",
          }}
        >
          ไม่มีรูปภาพ
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: two stacked images */}
      <div className="xl:w-2/6 lg:w-2/5 w-80 md:block hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt={title}
          className="w-full rounded"
          referrerPolicy="no-referrer"
        />
        {second && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={second}
            alt={title}
            className="mt-6 w-full rounded"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Mobile: hero + 4 thumbnail row */}
      <div className="md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt={title}
          className="w-full rounded"
          referrerPolicy="no-referrer"
        />
        {thumbs.length > 1 && (
          <div className="flex items-center justify-between mt-3 gap-2">
            {thumbs.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img}
                alt=""
                className="w-1/4 aspect-square object-cover rounded"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Variant disclosure — collapsed row showing current pick + chevron;
 * expanded view shows the chips so user can pick.
 * ────────────────────────────────────────────────────────────── */
function VariantDisclosure({
  attrName,
  values,
  selected,
  onSelect,
}: {
  attrName: string;
  values: string[];
  selected: string | undefined;
  onSelect: (val: string) => void;
}) {
  return (
    <details
      open={!selected /* auto-open when nothing picked yet */}
      className="py-4 border-b group"
      style={{ borderColor: "var(--shop-border)" }}
    >
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <p className="text-base leading-4" style={{ color: "var(--shop-ink)" }}>
          {attrName}
        </p>
        <div className="flex items-center gap-3">
          {selected ? (
            <span
              className="text-sm leading-none"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              {selected}
            </span>
          ) : (
            <span
              className="text-sm leading-none"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              เลือก{attrName}
            </span>
          )}
          <ChevronDown
            className="h-3 w-3 transition-transform group-open:rotate-180"
            style={{ color: "var(--shop-ink-muted)" }}
          />
        </div>
      </summary>
      <div className="mt-4 flex flex-wrap gap-2">
        {values.map((val) => {
          const picked = selected === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onSelect(val)}
              className="rounded-md border px-4 py-2 text-sm font-medium uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
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
    </details>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Disclosure — chevron rotates on open; native <details>
 * ────────────────────────────────────────────────────────────── */
function Disclosure({
  title,
  topBorder,
  children,
}: {
  title: string;
  topBorder?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      className={`${topBorder ? "border-t" : ""} border-b py-4 mt-7 group`}
      style={{ borderColor: "var(--shop-border)" }}
    >
      <summary className="flex justify-between items-center cursor-pointer list-none">
        <p className="text-base leading-4" style={{ color: "var(--shop-ink)" }}>
          {title}
        </p>
        <ChevronDown
          className="h-3 w-3 transition-transform group-open:rotate-180"
          style={{ color: "var(--shop-ink-muted)" }}
        />
      </summary>
      <div
        className="pt-4 text-base leading-relaxed pr-4 mt-4"
        style={{ color: "var(--shop-ink-muted)" }}
      >
        {children}
      </div>
    </details>
  );
}
