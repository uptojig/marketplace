"use client";

/**
 * Story Quick-View — Family C signature feature.
 *
 * Editorial-luxury preview modal that opens from a small "Quick View"
 * pill on the product card (top-left of the image, mirroring the
 * wishlist heart at top-right).
 *
 * The trigger is rendered for every card but gated by CSS — only
 * visible inside `.theme-C` (Luxury Heritage Gold).  No JS theme check
 * needed; the trigger is a plain element with a `data-` attribute and
 * `globals.css` flips it on for Family C.
 *
 * Modal layout matches the family signature: large image left, italic
 * serif headline right, gold rule, body paragraph (drop-cap inherits
 * from .theme-C CSS), price, then a "ดูรายละเอียด" link with the gold
 * underline grow + a primary "เพิ่มลงตะกร้า" CTA pointing at the PDP.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, X } from "lucide-react";
import { formatTHB } from "@/lib/utils";

interface StoryProduct {
  id: string;
  title: string;
  titleTh?: string | null;
  description?: string | null;
  descriptionTh?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  imageUrl: string | null;
  categoryName?: string | null;
}

export function StoryQuickViewTrigger({
  storeSlug,
  product,
}: {
  storeSlug: string;
  product: StoryProduct;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger pill — gated by CSS to .theme-C only.
          Pointer-events on the wrapper so it sits ABOVE the
          card link's absolute-inset overlay. */}
      <button
        type="button"
        data-story-quick-view-trigger
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="hidden items-center gap-1.5 rounded-none border bg-[var(--shop-card)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm hover:opacity-80"
        style={{
          borderColor: "var(--shop-primary)",
          color: "var(--shop-ink)",
        }}
        aria-label="ดูสินค้าโดยย่อ"
      >
        <Eye className="h-3 w-3" style={{ color: "var(--shop-primary)" }} />
        <span>Quick View</span>
      </button>

      {open && (
        <StoryModal
          storeSlug={storeSlug}
          product={product}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Modal — editorial-luxury layout, framed like a magazine spread
 * ────────────────────────────────────────────────────────────── */
function StoryModal({
  storeSlug,
  product,
  onClose,
}: {
  storeSlug: string;
  product: StoryProduct;
  onClose: () => void;
}) {
  // ESC to close + body scroll lock while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const title = product.titleTh || product.title;
  const description = product.descriptionTh || product.description || "";
  const onSale =
    product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="รายละเอียดสินค้าโดยย่อ"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop — desaturated heritage green-black wash */}
      <button
        type="button"
        aria-label="ปิด"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
      />

      {/* Spread */}
      <article
        className="relative grid w-full max-w-4xl overflow-hidden bg-[var(--shop-card)] shadow-2xl sm:grid-cols-[1.1fr_1fr]"
        style={{
          // Sharp corners — Family C signature (override any rounding)
          borderRadius: 0,
          // Hairline gold ring + soft shadow
          boxShadow:
            "0 0 0 1px var(--shop-primary), 0 30px 80px -20px rgba(0,0,0,0.5)",
          maxHeight: "90vh",
        }}
      >
        {/* Close — sits above everything */}
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center bg-[var(--shop-card)] shadow-sm hover:opacity-80"
          style={{
            borderRadius: 0,
            color: "var(--shop-ink)",
            border: "1px solid var(--shop-border)",
          }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image side — fills the column with object-cover */}
        <div
          className="relative aspect-square sm:aspect-auto sm:min-h-[480px]"
          style={{ background: "var(--shop-bg)" }}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-xs"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              ไม่มีรูปภาพ
            </div>
          )}
          {/* Tiny gold rule-frame inside the photo, magazine style */}
          <div
            className="pointer-events-none absolute inset-3 border"
            style={{
              borderColor: "color-mix(in srgb, var(--shop-primary) 40%, transparent)",
            }}
          />
        </div>

        {/* Story side */}
        <div
          className="prose flex max-w-none flex-col overflow-y-auto p-8 sm:p-10"
          style={{ color: "var(--shop-ink)" }}
        >
          {/* Eyebrow — uppercase wide-tracking microcopy */}
          {product.categoryName && (
            <p
              className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: "var(--shop-primary)" }}
            >
              {product.categoryName}
            </p>
          )}

          {/* Headline — italic serif, the drop-cap CSS in globals
              targets `.theme-C .prose > p:first-child::first-letter`,
              so we render the description as the first <p> below. */}
          <h2
            className="mb-3 font-serif text-3xl font-semibold italic leading-tight tracking-tight"
            style={{ color: "var(--shop-ink)" }}
          >
            {title}
          </h2>

          {/* Gold hairline rule */}
          <div
            className="mb-5 h-px w-12"
            style={{ background: "var(--shop-primary)" }}
          />

          {/* Body — first paragraph picks up Family C's drop-cap */}
          {description ? (
            <p
              className="mb-6 text-sm leading-relaxed"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              {truncate(description, 320)}
            </p>
          ) : (
            <p
              className="mb-6 text-sm italic leading-relaxed"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              ค้นพบเรื่องราวเต็มของสินค้าชิ้นนี้ในหน้ารายละเอียด
            </p>
          )}

          {/* Price block — sale-aware */}
          <div className="mt-auto">
            <div
              className="mb-1 text-[10px] uppercase tracking-[0.3em]"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              ราคา
            </div>
            <div className="flex items-baseline gap-3">
              <span
                className="font-serif text-3xl font-semibold"
                style={{ color: "var(--shop-ink)" }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {onSale && product.compareAtPriceTHB && (
                <span
                  className="text-sm line-through"
                  style={{ color: "var(--shop-ink-muted)" }}
                >
                  {formatTHB(product.compareAtPriceTHB)}
                </span>
              )}
            </div>
          </div>

          {/* Actions — primary solid CTA + gold-underline secondary
              link.  Sharp corners inherited from .theme-C; the bg
              color targets the link rule chain so the underline-grow
              animation only applies to the secondary one. */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/stores/${storeSlug}/products/${product.id}`}
              onClick={onClose}
              className="inline-flex items-center justify-center px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{
                background: "var(--shop-ink)",
                color: "var(--shop-card)",
                borderRadius: 0,
              }}
            >
              เพิ่มลงตะกร้า
            </Link>
            <Link
              href={`/stores/${storeSlug}/products/${product.id}`}
              onClick={onClose}
              className="text-xs font-medium uppercase tracking-[0.2em]"
              style={{ color: "var(--shop-ink)" }}
            >
              ดูรายละเอียดเต็ม →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

/* Soft truncation that respects word boundaries — magazine bodies
 * never end mid-word.  Adds a thin ellipsis + " (อ่านต่อ...)" hint. */
function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.7 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed}…`;
}
