/**
 * Shared homepage skeleton — hero banner + featured grid + brand-story
 * stripe. Used by the slim themes (everyday / taobao / packaging /
 * community) that don't need their own bespoke section composer like
 * BusinessModel does. Caller provides a `<Banner />` slot (the
 * theme-specific top section) and we render the rest.
 */

import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import type { Store } from '@prisma/client';
import type { BehaviorFlags } from '@/lib/templates/types';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
  /** Theme-specific top banner. */
  Banner: React.ComponentType<{
    storeSlug: string;
    storeName: string;
    bannerUrl: string | null;
    tagline: string | null;
  }>;
  /** Accent color used for chips / underlines in the featured strip. */
  accentColor: string;
  /** Primary CTA color used for the "ดูสินค้าทั้งหมด" link. */
  primaryColor: string;
  /** Header label above the products grid. */
  featuredLabel?: string;
  /** Header heading above the products grid. */
  featuredTitle?: string;
  /** Template behavior flags driving optional homepage strips. */
  behavior?: BehaviorFlags;
}

export async function SimpleHomepage({
  store,
  Banner,
  accentColor,
  primaryColor,
  featuredLabel = '★ FEATURED',
  featuredTitle = 'สินค้าน่าสนใจ',
  behavior,
}: Props) {
  const extra = await prisma.store.findUnique({
    where: { id: store.id },
    select: { bannerUrl: true, tagline: true, description: true, logoUrl: true },
  });

  const products = await prisma.product.findMany({
    where: { storeId: store.id, active: true },
    orderBy: { createdAt: 'desc' },
    take: behavior?.singleProductMode ? 1 : 8,
    select: {
      id: true,
      title: true,
      titleTh: true,
      imageUrl: true,
      priceTHB: true,
      compareAtPriceTHB: true,
    },
  });

  const showCover = behavior?.coverHidden !== true;
  const showLive = behavior?.liveBlock === 'visible';
  const showStory = behavior?.storyBlock === 'inline-visible';
  const showMakerPortrait = behavior?.makerPortrait === 'visible';
  const singleMode = behavior?.singleProductMode === true && products.length > 0;

  return (
    <div style={{ background: 'var(--shop-bg, #FAFAFA)' }}>
      {showCover && (
        <Banner
          storeSlug={store.slug}
          storeName={store.name}
          bannerUrl={extra?.bannerUrl ?? null}
          tagline={extra?.tagline ?? null}
        />
      )}

      {/* Live-commerce tile (live-commerce / video-feed templates) */}
      {showLive && (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4 text-white"
            style={{ background: primaryColor }}
          >
            <span className="relative inline-flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.06em]">Live now</span>
            <span className="text-sm" style={{ opacity: 0.92 }}>
              1.2K กำลังดู · KOL พรีวิวสินค้าแบบสด
            </span>
          </div>
        </section>
      )}

      {/* Maker portrait (handmade / storyteller templates) */}
      {showMakerPortrait && (extra?.logoUrl || extra?.tagline) && (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div
            className="flex items-center gap-5 rounded-2xl border bg-white p-5"
            style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
          >
            {extra?.logoUrl && (
              <Image
                src={extra.logoUrl}
                alt={`${store.name} maker portrait`}
                width={72}
                height={72}
                className="rounded-full object-cover"
              />
            )}
            <div>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: accentColor }}
              >
                ★ พบกับผู้สร้าง
              </p>
              <h3
                className="text-lg font-bold"
                style={{ color: 'var(--shop-ink, #0A0A0A)' }}
              >
                {store.name}
              </h3>
              {extra?.tagline && (
                <p
                  className="mt-1 text-sm italic"
                  style={{ color: 'var(--shop-ink-muted, #525252)' }}
                >
                  &quot;{extra.tagline}&quot;
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Story block (storyteller / handmade) */}
      {showStory && extra?.description && (
        <section className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
          <p
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: accentColor }}
          >
            ★ Brand story
          </p>
          <p
            className="text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--shop-ink, #0A0A0A)', fontStyle: 'italic' }}
          >
            {extra.description}
          </p>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <p
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: accentColor }}
          >
            {singleMode ? '★ FEATURED PRODUCT' : featuredLabel}
          </p>
          <h2
            className="text-2xl font-extrabold tracking-tight sm:text-3xl"
            style={{ color: 'var(--shop-ink, #0A0A0A)' }}
          >
            {singleMode ? products[0]?.titleTh ?? products[0]?.title : featuredTitle}
          </h2>
        </header>

        {products.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--shop-ink-muted, #737373)' }}>
            ร้านนี้ยังไม่มีสินค้า — กลับมาดูใหม่เร็วๆนี้
          </p>
        ) : (
          <ul
            className={
              singleMode
                ? "mx-auto max-w-2xl"
                : "grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
            }
          >
            {products.map((p) => {
              const title = p.titleTh ?? p.title;
              const price = Number(p.priceTHB);
              const compare = p.compareAtPriceTHB ? Number(p.compareAtPriceTHB) : null;
              const discount =
                compare && compare > price
                  ? Math.round((1 - price / compare) * 100)
                  : null;
              return (
                <li key={p.id}>
                  <Link
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group block"
                  >
                    <div
                      className={
                        singleMode
                          ? "relative aspect-square overflow-hidden rounded-2xl border bg-white"
                          : "relative aspect-square overflow-hidden rounded-xl border bg-white transition group-hover:shadow-md"
                      }
                      style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
                    >
                      {p.imageUrl && (
                        <Image
                          src={p.imageUrl}
                          alt={title}
                          fill
                          sizes={singleMode ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                          className="object-cover transition group-hover:scale-[1.03]"
                        />
                      )}
                      {discount != null && (
                        <span
                          className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase text-white"
                          style={{ background: primaryColor, letterSpacing: '0.04em' }}
                        >
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <p
                      className={
                        singleMode
                          ? "mt-3 text-lg font-bold"
                          : "mt-2 line-clamp-2 text-sm font-semibold"
                      }
                      style={{ color: 'var(--shop-ink, #0A0A0A)' }}
                    >
                      {title}
                    </p>
                    <p
                      className={
                        singleMode
                          ? "mt-1 text-2xl font-extrabold tabular-nums"
                          : "mt-1 text-base font-extrabold tabular-nums"
                      }
                      style={{ color: primaryColor }}
                    >
                      ฿{price.toLocaleString('th-TH')}
                      {compare && compare > price && (
                        <span
                          className="ml-2 text-xs font-medium line-through"
                          style={{ color: 'var(--shop-ink-muted, #737373)' }}
                        >
                          ฿{compare.toLocaleString('th-TH')}
                        </span>
                      )}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {!singleMode && (
          <div className="mt-8 text-center">
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] transition hover:opacity-80"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              ดูสินค้าทั้งหมด →
            </Link>
          </div>
        )}
      </section>

      {(extra?.tagline || extra?.description) && !showStory && (
        <section
          className="border-t border-b py-12"
          style={{ background: 'var(--shop-bg-soft, #fff)', borderColor: 'var(--shop-border, #E5E5E5)' }}
        >
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: accentColor }}
            >
              ★ ABOUT US
            </p>
            <h3
              className="mb-4 text-2xl font-extrabold tracking-tight sm:text-3xl"
              style={{ color: 'var(--shop-ink, #0A0A0A)' }}
            >
              {extra?.tagline ?? store.name}
            </h3>
            {extra?.description && (
              <p className="text-sm leading-relaxed sm:text-base" style={{ color: 'var(--shop-ink-muted, #525252)' }}>
                {extra.description}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
