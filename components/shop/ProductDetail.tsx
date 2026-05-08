"use client";

/**
 * Product detail (PDP).
 *
 * Rebuilt on daisyUI 5 primitives so the page recolors across all
 * 35 themes via semantic tokens (bg-primary / text-base-content /
 * border-base-300 / btn-primary) instead of the legacy --shop-*
 * cascade. Layout reference is the tailwinduikit "Balenciaga
 * Signature Sweatshirt" pattern (gallery left, info right, sticky
 * mobile bottom bar).
 *
 * Key daisyUI swaps:
 *   - .btn / .btn-primary       → primary CTA + variant chips
 *   - .join / .join-item        → quantity stepper (-/qty/+)
 *   - .collapse.collapse-arrow  → variant disclosures + shipping/contact panels
 *   - .badge                    → not used here yet but available
 *   - bg-base-100/200/300       → card / page / surface backgrounds
 *   - text-base-content[/70]    → body / muted copy
 *
 * The sticky mobile bottom-bar stays custom — no daisyUI primitive
 * matches that shape and we want the IntersectionObserver hookup.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/store/cart";
import { useCartConfirmation } from "@/lib/store/cartConfirm";
import { formatTHB } from "@/lib/utils";
import { WishlistButton } from "@/components/storefront/Wishlist";
import { FamilyDCustomizer } from "@/components/storefront/FamilyDCustomizer";
import { ShoppingBag, Truck, RotateCcw, Banknote } from "lucide-react";

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

  // Sticky mobile bottom bar visibility — show when the in-flow CTA
  // scrolls out of viewport. IntersectionObserver is the cheapest
  // way to do this; no scroll listeners.
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const node = ctaRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" /* offset for sticky header */ },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

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
      {/* ── Gallery ── */}
      <div className="relative">
        <Gallery images={allImages} title={product.title} />
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton
            storeSlug={product.storeSlug}
            product={{
              id: product.id,
              title: product.title,
              priceTHB: displayPrice,
              imageUrl: product.imageUrl ?? null,
            }}
            size="lg"
          />
        </div>
      </div>

      {/* ── Info column ── */}
      <div className="xl:w-2/5 md:w-1/2 lg:ml-8 md:ml-6 md:mt-0 mt-6 px-4 md:px-0">
        {/* Subtitle + title + price */}
        <div className="border-b border-base-300 pb-6">
          {product.subtitle && (
            <p className="text-sm leading-none text-base-content/70">
              {product.subtitle}
            </p>
          )}
          <h1 className="lg:text-2xl text-xl font-semibold leading-7 mt-2 text-base-content">
            {product.title}
          </h1>
          <p className="lg:text-3xl text-2xl font-bold mt-3 text-base-content">
            {formatTHB(displayPrice)}
          </p>
        </div>

        {/* Variant pickers — each is a daisyUI .collapse */}
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

        {/* Quantity + stock — daisyUI .join group for the stepper */}
        <div className="py-4 border-b border-base-300 flex items-center justify-between">
          <p className="text-base leading-4 text-base-content">จำนวน</p>
          <div className="flex items-center gap-3">
            <div className="join border border-base-300 rounded-md">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="ลด"
                className="join-item btn btn-ghost btn-sm text-lg"
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
                className="join-item input input-sm w-14 text-center bg-transparent border-0 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="เพิ่ม"
                className="join-item btn btn-ghost btn-sm text-lg"
              >
                +
              </button>
            </div>
            {stock != null && (
              <span className="text-xs text-base-content/70">
                {stock > 0 ? `เหลือ ${stock} ชิ้น` : "หมด"}
              </span>
            )}
          </div>
        </div>

        {/* Family D customizer — engraving + material picker.
            CSS-gated to .theme-D so other families never render it. */}
        <FamilyDCustomizer productId={product.id} />

        {/* Primary CTA */}
        <button
          ref={ctaRef}
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="btn btn-primary btn-lg w-full mt-6 text-base"
        >
          <ShoppingBag className="h-4 w-4" />
          {requiresVariant && !allAttrsPicked
            ? `กรุณาเลือก${Object.keys(attributeGroups).join(" / ")}`
            : stock === 0
              ? "แจ้งเตือนเมื่อสินค้าเข้า"
              : "เพิ่มลงตะกร้า"}
        </button>

        {/* Trust strip */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Truck, label: "ส่งฟรี ฿990+" },
            { icon: RotateCcw, label: "คืนได้ 7 วัน" },
            { icon: Banknote, label: "เก็บเงินปลายทาง" },
          ].map(({ icon: Icon, label }, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 py-2 rounded-lg bg-base-100 border border-base-300"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-base-content/70">{label}</span>
            </div>
          ))}
        </div>

        {/* Description + meta */}
        {product.description && (
          <div className="mt-7">
            <p className="text-base leading-relaxed lg:leading-tight text-base-content/70">
              <span className="whitespace-pre-line">{product.description}</span>
            </p>
            {product.productCode && (
              <p className="text-base leading-4 mt-7 text-base-content/70">
                Product Code: {product.productCode}
              </p>
            )}
          </div>
        )}

        {/* Shipping & returns */}
        <Disclosure title="การจัดส่งและคืนสินค้า">
          <p>จัดส่งทั่วไทย 1-3 วันทำการ ผ่าน Kerry / Flash / EMS</p>
          <p className="mt-2">
            เปลี่ยน / คืนสินค้าได้ภายใน 7 วัน หากสินค้ามีตำหนิจากโรงงาน
          </p>
          <p className="mt-2">
            รายละเอียดเพิ่มเติม:{" "}
            <a
              href={`/stores/${product.storeSlug}/shipping`}
              className="link link-primary"
            >
              นโยบายการจัดส่ง
            </a>
            {" • "}
            <a
              href={`/stores/${product.storeSlug}/returns`}
              className="link link-primary"
            >
              เงื่อนไขการคืน
            </a>
          </p>
        </Disclosure>

        <Disclosure title="ติดต่อสอบถาม">
          <p>
            หากมีคำถามเกี่ยวกับสินค้า การสั่งซื้อ หรือการจัดส่ง ติดต่อ{" "}
            {product.storeName} ได้ที่{" "}
            <a
              href={`/stores/${product.storeSlug}/contact`}
              className="link link-primary"
            >
              หน้าติดต่อเรา
            </a>
          </p>
        </Disclosure>
      </div>

      {/* Sticky mobile bottom bar — appears once the in-flow CTA
          scrolls out of viewport. */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-50 bg-base-100 border-t border-base-300 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-200 ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs truncate text-base-content/70">
              {product.title}
            </div>
            <div className="text-base font-bold text-base-content">
              {formatTHB(displayPrice)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="btn btn-primary btn-sm shrink-0"
          >
            <ShoppingBag className="h-4 w-4" />
            {requiresVariant && !allAttrsPicked ? "เลือกตัวเลือก" : "เพิ่ม"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Gallery — TWO stacked images on desktop, hero + 4 thumbs mobile
 * ────────────────────────────────────────────────────────────── */
function Gallery({ images, title }: { images: string[]; title: string }) {
  const hero = images[0];
  const second = images[1];
  const thumbs = images.slice(0, 4);

  if (!hero) {
    return (
      <div className="xl:w-2/6 lg:w-2/5 w-80 md:block hidden">
        <div className="aspect-square rounded flex items-center justify-center text-sm bg-base-200 text-base-content/70">
          ไม่มีรูปภาพ
        </div>
      </div>
    );
  }

  // Force aspect-[3/4] + object-cover so every store gets a tall
  // gallery hero regardless of supplier image dimensions (CJ / AE
  // default to 1:1 which looks short next to the info column).
  const imgClass = "w-full rounded aspect-[3/4] object-cover bg-base-200";

  return (
    <>
      {/* Desktop: two stacked portrait images */}
      <div className="xl:w-2/6 lg:w-2/5 w-80 md:block hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt={title}
          className={imgClass}
          referrerPolicy="no-referrer"
        />
        {second && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={second}
            alt={title}
            className={`${imgClass} mt-6`}
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
          className={imgClass}
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
                className="w-1/4 aspect-square object-cover rounded bg-base-200"
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
 * Variant disclosure — daisyUI .collapse.collapse-arrow on a
 * <details>-style chip picker. Defaults open when no value is
 * selected; collapses on first pick.
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
      open={!selected}
      className="collapse collapse-arrow border-b border-base-300 rounded-none"
    >
      <summary className="collapse-title px-0 py-4 min-h-0 flex items-center justify-between cursor-pointer">
        <span className="text-base text-base-content">{attrName}</span>
        <span className="text-sm text-base-content/70 mr-6">
          {selected || `เลือก${attrName}`}
        </span>
      </summary>
      <div className="collapse-content px-0">
        <div className="flex flex-wrap gap-2 pt-2">
          {values.map((val) => {
            const picked = selected === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onSelect(val)}
                className={`btn btn-sm uppercase ${
                  picked ? "btn-primary" : "btn-outline"
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Disclosure — daisyUI .collapse.collapse-arrow for shipping /
 * contact panels at the bottom of the info column.
 * ────────────────────────────────────────────────────────────── */
function Disclosure({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="collapse collapse-arrow border-t border-base-300 rounded-none mt-7">
      <summary className="collapse-title px-0 py-4 min-h-0 text-base text-base-content cursor-pointer">
        {title}
      </summary>
      <div className="collapse-content px-0 text-base leading-relaxed text-base-content/70">
        <div className="pt-2">{children}</div>
      </div>
    </details>
  );
}
