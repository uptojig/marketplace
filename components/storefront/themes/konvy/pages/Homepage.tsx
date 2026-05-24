'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ArrowRight, Star } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}

interface LandingContent {
  heroHeadline?: string | null;
  heroSubheadline?: string | null;
  heroCtaLabel?: string | null;
  heroCtaUrl?: string | null;
  heroImageUrl?: string | null;
}

interface Props {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: string[];
  landingContent?: LandingContent | null;
}

const DEFAULT_HEADLINE = 'K-Beauty ของแท้ คัดสรรจากเกาหลี';
const DEFAULT_SUB =
  'รวมสกินแคร์ เมคอัพ และของใช้ความงามสไตล์เกาหลี ส่งตรงจากแบรนด์ การันตีของแท้ 100%';
const DEFAULT_CTA = 'ช้อปเลย';
const MAX_FEATURED = 12;

/**
 * Konvy — K-beauty marketplace homepage.
 *
 * Layout:
 *   1. Soft pastel hero (gradient + brand image + sparkles)
 *   2. Palette swatch row (7 K-beauty shades preview)
 *   3. Featured product grid (cap 12, then "ดูสินค้าทั้งหมด" CTA)
 *   4. Category cards
 *   5. Reviews snippet
 *
 * All gradients fall back to `var(--shop-primary)` when the palette
 * preset doesn't define a gradient. Add-to-cart silently adds — no
 * confirmation modal per project rule.
 */
export function Homepage({ store, products, categories, landingContent }: Props) {
  const headline = landingContent?.heroHeadline?.trim() || DEFAULT_HEADLINE;
  const sub = landingContent?.heroSubheadline?.trim() || DEFAULT_SUB;
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || DEFAULT_CTA;
  const ctaUrl =
    landingContent?.heroCtaUrl?.trim() || `/stores/${store.slug}/category`;
  const heroImage = landingContent?.heroImageUrl?.trim() || null;

  const add = useCart((s) => s.add);
  const featured = products.slice(0, MAX_FEATURED);
  const remainder = Math.max(0, products.length - MAX_FEATURED);

  const handleAdd = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: p.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: p.title,
      priceTHB: p.priceTHB,
      imageUrl: p.imageUrl || undefined,
    });
  };

  return (
    <div
      className="font-[family:var(--font-prompt)] text-[var(--shop-ink)]"
      style={{ background: 'var(--shop-bg, #FFFFFF)' }}
    >
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'var(--shop-primary-gradient, var(--shop-bg-soft, var(--shop-primary)))',
        }}
      >
        <div className="absolute top-12 left-8 opacity-30 hidden sm:block" aria-hidden>
          <Sparkles className="h-14 w-14 text-white" />
        </div>
        <div
          className="absolute bottom-12 right-10 opacity-25 hidden sm:block"
          aria-hidden
        >
          <Heart className="h-20 w-20 text-white" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid gap-10 lg:grid-cols-2 items-center">
          <div className="text-white">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              K-Beauty Marketplace
            </span>
            <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-5 tracking-tight">
              {headline}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed mb-8 text-white/90 max-w-xl">
              {sub}
            </p>
            <Link
              href={ctaUrl}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-sm font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5"
              style={{ color: 'var(--shop-primary)' }}
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="h-24 w-24 text-white/40" aria-hidden />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* (Palette swatch row removed — it was decoration only.
          The functional skin picker now lives as a floating widget
          mounted from `app/stores/[slug]/layout.tsx → <SkinPicker />`
          so visitors actually CLICK swatches to re-skin the store.) */}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-1"
              style={{ color: 'var(--shop-primary)' }}
            >
              Bestsellers
            </p>
            <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold">
              สินค้ายอดฮิต
            </h2>
          </div>
          <Link
            href={`/stores/${store.slug}/category`}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
            style={{ color: 'var(--shop-primary)' }}
          >
            ดูทั้งหมด <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <p
            className="py-16 text-center text-sm"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            กำลังคัดสรรสินค้าสำหรับคุณ กลับมาดูใหม่อีกครั้งเร็วๆ นี้
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/stores/${store.slug}/products/${p.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--shop-border)] flex flex-col"
              >
                <div
                  className="relative aspect-square overflow-hidden"
                  style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                      <Heart className="h-12 w-12" style={{ color: 'var(--shop-primary)' }} />
                    </div>
                  )}
                  {p.compareAtPriceTHB &&
                    p.compareAtPriceTHB > p.priceTHB && (
                      <span
                        className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider text-white px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--shop-primary)' }}
                      >
                        Sale
                      </span>
                    )}
                  <button
                    type="button"
                    onClick={(e) => handleAdd(p, e)}
                    className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur text-sm font-semibold py-2.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-md hover:shadow-lg"
                    style={{ color: 'var(--shop-primary)' }}
                    aria-label={`เพิ่ม ${p.title} ลงตะกร้า`}
                  >
                    หยิบใส่ตะกร้า
                  </button>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  {p.categoryName && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      {p.categoryName}
                    </span>
                  )}
                  <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-3 flex-1">
                    {p.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-auto">
                    <span
                      className="font-[family:var(--font-kanit)] font-semibold text-base"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      {formatTHB(p.priceTHB)}
                    </span>
                    {p.compareAtPriceTHB &&
                      p.compareAtPriceTHB > p.priceTHB && (
                        <span
                          className="text-xs line-through"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {formatTHB(p.compareAtPriceTHB)}
                        </span>
                      )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* "ดูสินค้าทั้งหมด" CTA — gated on length > 12 */}
        {products.length > MAX_FEATURED && (
          <div className="text-center mt-12">
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{
                borderColor: 'var(--shop-primary)',
                color: 'var(--shop-primary)',
              }}
            >
              ดูสินค้าทั้งหมด {products.length} รายการ
              <ArrowRight className="h-4 w-4" />
            </Link>
            {remainder > 0 && (
              <p
                className="mt-3 text-xs"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                อีก {remainder} รายการรอคุณค้นพบ
              </p>
            )}
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section
          className="border-y border-[var(--shop-border)]"
          style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="text-center mb-10">
              <p
                className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-1"
                style={{ color: 'var(--shop-primary)' }}
              >
                Shop by category
              </p>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold">
                คอลเลกชัน
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat}
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                  className="group relative aspect-square rounded-3xl overflow-hidden bg-white border border-[var(--shop-border)] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 p-5 flex flex-col justify-end"
                >
                  <div
                    className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
                    style={{
                      background:
                        'var(--shop-primary-gradient, var(--shop-primary))',
                    }}
                    aria-hidden
                  />
                  <div
                    className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white grid place-items-center shadow-sm"
                    aria-hidden
                  >
                    <Heart
                      className="h-4 w-4"
                      style={{ color: 'var(--shop-primary)' }}
                    />
                  </div>
                  <div className="relative">
                    <h3 className="font-[family:var(--font-kanit)] font-semibold text-base sm:text-lg leading-tight text-white drop-shadow">
                      {cat}
                    </h3>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-white/90 group-hover:gap-2 transition-all">
                      ดูเลย <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews snippet */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center mb-10">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-1"
            style={{ color: 'var(--shop-primary)' }}
          >
            Loved by our customers
          </p>
          <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold">
            รีวิวจากลูกค้า
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              quote:
                'ของแท้ ส่งไว แพ็คดีมาก รักร้านนี้เลย จะกลับมาซื้ออีกแน่นอน',
              name: 'คุณพิม',
              tag: 'Skincare',
            },
            {
              quote:
                'สีลิปสวยตรงปก ติดทน ราคาดีกว่าซื้อจากเกาหลีโดยตรงอีก',
              name: 'คุณนุ่น',
              tag: 'Lip',
            },
            {
              quote:
                'แอดมินตอบไว แนะนำสินค้าตรงผิว ทุกชิ้นที่ลองใช้แล้วชอบหมด',
              name: 'คุณจูน',
              tag: 'Suncare',
            },
          ].map((r) => (
            <article
              key={r.name}
              className="bg-white rounded-3xl border border-[var(--shop-border)] p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="flex items-center gap-1 mb-3"
                aria-label="5 ดาว"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    style={{ color: 'var(--shop-primary)' }}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-4">{r.quote}</p>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--shop-border)]">
                <span className="text-sm font-medium">{r.name}</span>
                <span
                  className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {r.tag}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
