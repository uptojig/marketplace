'use client';

/**
 * OmniPack — homepage.
 *
 * Layout: full-width kraft-gradient hero with "ส่งทันที / สั่งได้ที่ละน้อย"
 * messaging → category tiles (กล่อง / ซองไปรษณีย์ / กันกระแทก / เทป) →
 * trust band (3 chips) → tall featured-product cards with dimension
 * chips → sustainability ribbon → bulk-order CTA.
 *
 * Featured grid caps at 12 cards and shows a "ดูสินค้าทั้งหมด N รายการ"
 * link to the catalog when there are more products.
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Leaf,
  PackageOpen,
  Mailbox,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
} from 'lucide-react';
import type { HomepageProps } from '@/lib/templates/types';
import { formatTHB } from '@/lib/utils';

/** Cap on the homepage featured grid. */
const HOMEPAGE_GRID_CAP = 12;

/**
 * Static category tile config. Categories surface DB-derived
 * `categories` (string[]) as labels — when present we substitute the
 * matching string into the tile so admin edits flow through; the static
 * icon palette stays for visual consistency.
 */
const CATEGORY_TILES: {
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
}[] = [
  {
    defaultLabel: 'กล่องไปรษณีย์',
    icon: PackageOpen,
    hint: 'กล่องลูกฟูก 3 ชั้น แข็งแรง',
  },
  {
    defaultLabel: 'ซองไปรษณีย์',
    icon: Mailbox,
    hint: 'ซองพลาสติก / ซองคราฟท์',
  },
  {
    defaultLabel: 'กันกระแทก',
    icon: Sparkles,
    hint: 'บับเบิ้ล โฟม กระดาษย่น',
  },
  {
    defaultLabel: 'เทปและอุปกรณ์',
    icon: Tag,
    hint: 'เทปกาว สติ๊กเกอร์ เครื่องตัด',
  },
];

interface OmnipackHomepageProps extends HomepageProps {
  storeSlug: string;
  totalProductCount: number;
}

export function OmnipackHomepage(props: OmnipackHomepageProps) {
  const { store, products, categories, storeSlug, totalProductCount } = props;
  const homeUrl = `/stores/${storeSlug}`;
  const shopUrl = `/stores/${storeSlug}/category`;
  const productBase = `/stores/${storeSlug}/products`;

  const featured = products.slice(0, HOMEPAGE_GRID_CAP);
  const remainingCount = totalProductCount;

  return (
    <main
      className="flex flex-col font-[family:var(--font-prompt)]"
      style={{ backgroundColor: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      {/* Hero */}
      <section
        className="relative isolate overflow-hidden text-white"
        style={{
          background: 'var(--shop-primary-gradient, var(--shop-primary))',
        }}
      >
        {/* paper-grain hint via SVG noise */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'180\' height=\'180\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.7\'/></svg>")',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-sm mb-6">
              <Leaf className="w-3.5 h-3.5" />
              บรรจุภัณฑ์สำเร็จรูป · พร้อมส่ง
            </span>
            <h1 className="font-[family:var(--font-kanit)] font-medium text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
              บรรจุภัณฑ์
              <br />
              พร้อมส่งทันที
            </h1>
            <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-xl mb-8">
              {store.name} —
              กล่องลูกฟูก ซองไปรษณีย์ กันกระแทก ครบในที่เดียว
              สั่งขั้นต่ำเพียง 50 ชิ้น ส่งภายในวันเดียว
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={shopUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-white font-medium text-sm hover:opacity-90 transition-opacity"
                style={{ color: 'var(--shop-primary)' }}
              >
                ดูสินค้าทั้งหมด
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`${homeUrl}/help`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-white/40 font-medium text-sm hover:bg-white/10 transition-colors"
              >
                สอบถามราคาขายส่ง
              </Link>
            </div>
          </div>

          {/* Stacked-box illustration in kraft tones */}
          <div className="hidden lg:flex justify-end items-center relative h-full">
            <div className="relative w-[420px] h-[320px]">
              <div className="absolute right-0 top-0 w-[280px] h-[200px] bg-white/15 rounded-lg border border-white/20 backdrop-blur-sm flex items-center justify-center">
                <Boxes className="w-20 h-20 text-white/70" />
              </div>
              <div className="absolute left-0 bottom-0 w-[300px] h-[180px] bg-white/25 rounded-lg border border-white/30 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <PackageOpen className="w-24 h-24 text-white/85" />
              </div>
              <div className="absolute right-6 bottom-14 w-[160px] h-[120px] bg-white/35 rounded-lg border border-white/40 backdrop-blur-sm flex items-center justify-center">
                <Mailbox className="w-14 h-14 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section
        className="border-b"
        style={{
          backgroundColor: 'var(--shop-card)',
          borderColor: 'var(--shop-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Leaf,
              title: 'รีไซเคิลได้ 100%',
              body: 'กระดาษคราฟท์ FSC + เทปย่อยสลายได้',
            },
            {
              icon: Truck,
              title: 'ส่งภายในวันเดียว',
              body: 'สั่งก่อน 14:00 ส่งทันที ทั่วกรุงเทพฯ และปริมณฑล',
            },
            {
              icon: ShieldCheck,
              title: 'ขั้นต่ำเพียง 50 ชิ้น',
              body: 'เริ่มต้นได้ทุกขนาดธุรกิจ ไม่ต้องสต๊อกเยอะ',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <div
                className="shrink-0 w-11 h-11 rounded-md flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--shop-bg-soft, var(--shop-bg))',
                  color: 'var(--shop-primary)',
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="font-[family:var(--font-kanit)] font-medium text-base mb-1"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category tiles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2
              className="font-[family:var(--font-kanit)] font-medium text-2xl sm:text-3xl"
              style={{ color: 'var(--shop-ink)' }}
            >
              เลือกตามประเภท
            </h2>
            <Link
              href={shopUrl}
              className="text-sm font-medium hover:opacity-80 hidden sm:flex items-center gap-1"
              style={{ color: 'var(--shop-primary)' }}
            >
              ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {CATEGORY_TILES.map((tile, i) => {
              const label = categories[i] ?? tile.defaultLabel;
              const Icon = tile.icon;
              return (
                <Link
                  key={tile.defaultLabel}
                  href={`${shopUrl}?cat=${encodeURIComponent(label)}`}
                  className="group relative rounded-2xl border p-6 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--shop-card)',
                    borderColor: 'var(--shop-border)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: 'var(--shop-bg-soft, var(--shop-bg))',
                      color: 'var(--shop-primary)',
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3
                    className="font-[family:var(--font-kanit)] font-medium text-lg mb-1"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {label}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {tile.hint}
                  </p>
                  <ArrowRight
                    className="absolute bottom-5 right-5 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    style={{ color: 'var(--shop-primary)' }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured products — tall cards with dimension chips */}
      <section
        className="py-16"
        style={{ backgroundColor: 'var(--shop-bg-soft, var(--shop-bg))' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2
                className="font-[family:var(--font-kanit)] font-medium text-2xl sm:text-3xl mb-1"
                style={{ color: 'var(--shop-ink)' }}
              >
                ขนาดยอดนิยม
              </h2>
              <p
                className="text-sm"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                บรรจุภัณฑ์ที่ลูกค้าสั่งซ้ำมากที่สุด
              </p>
            </div>
          </div>

          {featured.length === 0 ? (
            <div
              className="rounded-xl border p-10 text-center text-sm"
              style={{
                backgroundColor: 'var(--shop-card)',
                borderColor: 'var(--shop-border)',
                color: 'var(--shop-ink-muted)',
              }}
            >
              ยังไม่มีสินค้าที่จัดแสดง · เพิ่มสินค้าจากแอดมินเพื่อเริ่มต้น
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  href={`${productBase}/${p.id}`}
                  className="group flex flex-col rounded-xl border overflow-hidden transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--shop-card)',
                    borderColor: 'var(--shop-border)',
                  }}
                >
                  <div
                    className="aspect-[4/5] relative overflow-hidden"
                    style={{ backgroundColor: 'var(--shop-bg)' }}
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ color: 'var(--shop-border)' }}
                      >
                        <PackageOpen className="w-16 h-16" />
                      </div>
                    )}
                    {p.categoryName && (
                      <span
                        className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          backgroundColor: 'var(--shop-card)',
                          color: 'var(--shop-primary)',
                          border: '1px solid var(--shop-border)',
                        }}
                      >
                        {p.categoryName}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <h3
                      className="font-[family:var(--font-kanit)] font-medium text-sm leading-snug line-clamp-2"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {p.title}
                    </h3>
                    <div className="flex items-baseline justify-between mt-auto pt-2">
                      <span
                        className="font-[family:var(--font-kanit)] font-medium text-lg"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {formatTHB(p.priceTHB)}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        / ชิ้น
                      </span>
                    </div>
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
                </Link>
              ))}
            </div>
          )}

          {/* Catalog CTA */}
          {remainingCount > HOMEPAGE_GRID_CAP && (
            <div className="mt-10 flex justify-center">
              <Link
                href={shopUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md border font-medium text-sm transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--shop-card)',
                  borderColor: 'var(--shop-border)',
                  color: 'var(--shop-primary)',
                }}
              >
                ดูสินค้าทั้งหมด {remainingCount.toLocaleString('th-TH')} รายการ
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Sustainability ribbon */}
      <section
        className="py-12"
        style={{
          background: 'var(--shop-primary-gradient, var(--shop-primary))',
          color: 'white',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Leaf className="w-10 h-10 shrink-0" />
            <div>
              <h3 className="font-[family:var(--font-kanit)] font-medium text-xl mb-1">
                บรรจุภัณฑ์เพื่อโลก
              </h3>
              <p className="text-sm text-white/85 leading-relaxed max-w-md">
                ทุกชิ้นใช้กระดาษรีไซเคิลและเทปกาวที่ย่อยสลายได้
                ลดคาร์บอนตั้งแต่กระบวนการผลิตจนถึงปลายทาง
              </p>
            </div>
          </div>
          <Link
            href={`${homeUrl}/about`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white text-sm font-medium hover:opacity-90"
            style={{ color: 'var(--shop-primary)' }}
          >
            อ่านเรื่องของเรา <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Bulk-order CTA */}
      <section
        className="py-16"
        style={{ backgroundColor: 'var(--shop-card)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl border p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{
              backgroundColor: 'var(--shop-bg-soft, var(--shop-bg))',
              borderColor: 'var(--shop-border)',
            }}
          >
            <div className="max-w-xl">
              <h2
                className="font-[family:var(--font-kanit)] font-medium text-2xl md:text-3xl mb-3"
                style={{ color: 'var(--shop-ink)' }}
              >
                สั่งจำนวนมาก ราคาพิเศษ
              </h2>
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                สั่งตั้งแต่ 500 ชิ้นขึ้นไป รับส่วนลดทันที 10–25% ตามจำนวน
                พร้อมบริการพิมพ์โลโก้บนกล่อง MOQ 500 ชิ้น
              </p>
            </div>
            <Link
              href={`${homeUrl}/help`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-white font-medium text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--shop-primary)' }}
            >
              ติดต่อฝ่ายขายส่ง
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
