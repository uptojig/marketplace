'use client';

/**
 * PetHouseProductGallery — main product image + 4-up thumbnail switcher.
 *
 * Client component because the active thumb / main image swap is local
 * UI state. Renders the canvas in a soft #FAEBA0 yellow tile (matches the
 * mockup's `.g-main` rule) with rounded corners + 32px padding so the
 * actual product image floats on the pastel background — same vibe as
 * the homepage hero illustration.
 *
 * Featured badge: deliberately gated by a `featured` prop the parent
 * always passes `false` for now. Wiring is in place so the badge can
 * surface once `Product.featured` exists in Prisma; we just never
 * pass `true` until then. See PetHouseProductPage for the rationale.
 *
 * Zoom button: visual-only for now (the mockup shows a zoom-in icon
 * top-right; clicking is no-op here). We didn't ship a fullscreen
 * lightbox to avoid scope creep — defer until product asks for it.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { PlayCircle, ZoomIn } from 'lucide-react';

interface Props {
  images: string[];
  alt: string;
  /** Optional supplier-hosted promo video (CJ `videoUrl`). Surfaced as
   *  a small "ดูวิดีโอ" link under the gallery — NOT auto-embedded. */
  videoUrl?: string | null;
  /** Reserved for future use; today the parent always passes `false`
   *  because `Product.featured` isn't in the schema yet. */
  featured?: boolean;
}

export function PetHouseProductGallery({
  images,
  alt,
  videoUrl,
  featured = false,
}: Props) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeSrc = safeImages[activeIdx] ?? null;

  // Pad the thumb grid to 4 cells so the layout matches the mockup.
  // Empty slots render as muted pastel tiles (no click, no border).
  const THUMB_BGS = ['#FAEBA0', '#F0F7E5', '#FCE8DB', '#E5F0FA'];
  const thumbSlots = Array.from({ length: 4 }, (_, i) => safeImages[i] ?? null);

  return (
    <div>
      {/* Main canvas — aspect-square pastel pillow holds the product image */}
      <div
        className="relative mb-3.5"
        style={{
          aspectRatio: '1 / 1',
          background: '#FAEBA0',
          borderRadius: '14px',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Featured badge — only when parent flags this product as featured. */}
        {featured && (
          <span
            className="absolute font-semibold"
            style={{
              top: 16,
              left: 16,
              background: 'white',
              color: '#5C3D1F',
              fontSize: '11px',
              padding: '6px 12px',
              borderRadius: '999px',
              border: '0.5px solid #F4D870',
              zIndex: 2,
            }}
          >
            ⭐ Featured
          </span>
        )}
        {/* Zoom button (visual-only for now). aria-hidden because there's
            no real lightbox behaviour wired yet. */}
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          className="absolute flex items-center justify-center"
          style={{
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            color: '#5C3D1F',
            zIndex: 2,
            border: 0,
            cursor: 'default',
          }}
        >
          <ZoomIn className="h-[15px] w-[15px]" />
        </button>
        {activeSrc ? (
          // Inner padding wrapper — letterboxes the product image inside
          // the yellow tile so the cover doesn't get cropped on weird
          // aspect ratios. next/image `fill` resolves against this box.
          <div
            className="absolute inset-0"
            style={{ padding: '32px' }}
          >
            <div className="relative w-full h-full">
              <Image
                src={activeSrc}
                alt={alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </div>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: '#8A7B6A', fontSize: '14px' }}
          >
            ไม่มีรูปภาพ
          </div>
        )}
      </div>

      {/* Thumbnail row — always 4 cells. Empty slots render as muted
          pastel tiles (no border, no click) so the grid stays even when
          the product has fewer than 4 photos. */}
      <div className="grid grid-cols-4 gap-2.5">
        {thumbSlots.map((src, i) => {
          const isActive = src !== null && i === activeIdx;
          const tileBg = THUMB_BGS[i % THUMB_BGS.length];
          return (
            <button
              key={i}
              type="button"
              onClick={() => src && setActiveIdx(i)}
              disabled={!src}
              className="relative overflow-hidden transition"
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '10px',
                border: `2px solid ${isActive ? '#5BA033' : 'transparent'}`,
                background: tileBg,
                cursor: src ? 'pointer' : 'default',
                opacity: src ? 1 : 0.5,
              }}
              aria-label={src ? `ดูรูปที่ ${i + 1}` : undefined}
              aria-pressed={isActive || undefined}
            >
              {src ? (
                <Image
                  src={src}
                  alt={`${alt} ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain"
                  style={{ mixBlendMode: 'multiply', padding: '8px' }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Promo video link (CJ `videoUrl`). Same opt-in-no-embed pattern
          used by the default ProductDetailHero — opens in a new tab. */}
      {videoUrl && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 font-medium hover:underline"
          style={{ fontSize: '12px', color: '#5BA033' }}
        >
          <PlayCircle className="h-4 w-4" />
          ดูวิดีโอสินค้า
        </a>
      )}
    </div>
  );
}
