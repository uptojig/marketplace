'use client';

/**
 * Mu Wallpaper — Homepage
 *
 * Faithful translation of the design export `index.html` for a สายมู
 * (auspicious / lucky) DIGITAL wallpaper store paid for with STORE CREDIT.
 * Mystical-premium dark look: gilded-on-midnight, radial halos, floating
 * 9:16 wallpaper previews, blessing script overlay.
 *
 * Sections (top → bottom), matching the export:
 *   1. Hero        — eyebrow + headline + lead + dual CTA + trust row,
 *                    floating wallpaper art (CSS keyframes, no framer)
 *   2. Wallet      — store-credit card ("1 บาท = 1 เครดิต")
 *   3. Lucky-day   — pick day-of-birth → auspicious colour + category
 *   4. Featured    — product grid (up to 6) styled as wallpaper cards
 *   5. Bundle      — "เซ็ตมงคลครบ 5 ด้าน" upsell
 *   6. How         — 3 Thai-numeral steps
 *   7. Reviews     — 3 testimonials
 *   8. FAQ         — 4 native <details> rows
 *
 * No framer-motion: the floating preview + reveal use `<style jsx>` CSS
 * keyframes. Hero image fallback chain:
 *   landingContent.heroImageUrl → store.bannerUrl → first product image.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { formatTHB } from '@/lib/utils';
import {
  MU_WALLPAPER_HEX,
  MU_WALLPAPER_GOLD_GRADIENT,
  MU_CATEGORY_GLOW,
} from '../palette';
import { WallpaperTile, motifFor } from '../../../mu-wallpaper-motifs';

const H = MU_WALLPAPER_HEX;

interface ProductCard {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface CategoryEntry {
  id: string;
  name: string;
}

interface MuWallpaperHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
  };
  products: ProductCard[];
  categories: CategoryEntry[];
  landingContent?: {
    heroHeadline?: string | null;
    heroSubheadline?: string | null;
    heroCtaLabel?: string | null;
    heroImageUrl?: string | null;
  } | null;
}

// Auspicious day-of-birth tool data, verbatim from the export's `DAYS`.
const DAYS: {
  th: string;
  color: string;
  cn: string;
  cat: string;
  catLabel: string;
  note: string;
}[] = [
  { th: 'อาทิตย์', color: '#e0483d', cn: 'แดง', cat: 'career', catLabel: 'การงาน', note: 'เสริมอำนาจบารมีและความก้าวหน้า' },
  { th: 'จันทร์', color: '#f4e7c3', cn: 'ครีม-เหลือง', cat: 'love', catLabel: 'ความรัก', note: 'เสริมเมตตามหานิยมและความรัก' },
  { th: 'อังคาร', color: '#ff86b0', cn: 'ชมพู', cat: 'love', catLabel: 'ความรัก', note: 'เสริมเสน่ห์และความสัมพันธ์' },
  { th: 'พุธ', color: '#54c98a', cn: 'เขียว', cat: 'wealth', catLabel: 'การเงิน', note: 'เสริมการค้าขายและการเงิน' },
  { th: 'พฤหัส', color: '#ff9d4d', cn: 'ส้ม', cat: 'career', catLabel: 'การงาน', note: 'เสริมการงานและการเรียน' },
  { th: 'ศุกร์', color: '#5aa9ff', cn: 'ฟ้า', cat: 'protect', catLabel: 'แคล้วคลาด', note: 'เสริมความแคล้วคลาดปลอดภัย' },
  { th: 'เสาร์', color: '#9b6cff', cn: 'ม่วง', cat: 'protect', catLabel: 'แคล้วคลาด', note: 'เสริมการป้องกันและความมั่นคง' },
];

const STEPS = [
  { n: '๑', title: 'เติมเครดิต', body: 'เติมเครดิตเข้ากระเป๋าผ่านพร้อมเพย์ บัตรเครดิต หรือทรูมันนี่ 1 บาท = 1 เครดิต ไม่มีโปรโมชั่น' },
  { n: '๒', title: 'พรีวิว & เลือกลาย', body: 'เปิดดูตัวอย่างได้ทุกลาย (บันทึกภาพตัวอย่างไม่ได้) เลือกลายที่ถูกใจตามดวงของคุณ' },
  { n: '๓', title: 'ซื้อด้วยเครดิต', body: 'กดซื้อแล้วระบบหักเครดิตทันที รับไฟล์เต็มความละเอียดสูงแบบไม่มีลายน้ำ ดาวน์โหลดซ้ำได้' },
];

const REVIEWS = [
  {
    av: 'ก',
    text: 'ตั้งวอลล์ท้าวเวสสุวรรณได้อาทิตย์เดียว ยอดขายร้านดีขึ้นจริง ลายสวยมากด้วย ไม่เคยเจอที่ไหนทำสวยขนาดนี้',
    who: 'คุณกานต์',
    sub: 'แม่ค้าออนไลน์ · กรุงเทพฯ',
  },
  {
    av: 'น',
    text: 'เติมเครดิตทีเดียวค่อย ๆ เลือกซื้อทีละลายได้ สะดวกดี พรีวิวก่อนซื้อทำให้ไม่ผิดหวังเลยค่ะ',
    who: 'คุณนิดา',
    sub: 'พนักงานออฟฟิศ · เชียงใหม่',
  },
  {
    av: 'ภ',
    text: 'ดาวน์โหลดง่าย ได้ไฟล์ชัดเต็มจอ ตั้งแล้วสวยเหมือนภาพตัวอย่างเป๊ะ ซื้อเซ็ต 5 ด้านคุ้มสุด',
    who: 'คุณภูมิ',
    sub: 'ฟรีแลนซ์ · ขอนแก่น',
  },
];

const FAQ = [
  {
    q: 'ระบบเครดิตทำงานอย่างไร?',
    a: 'เติมเครดิตเข้ากระเป๋าก่อน (1 บาท = 1 เครดิต) จากนั้นใช้เครดิตซื้อวอลล์เปเปอร์ลายที่ต้องการ ระบบหักเครดิตทันทีและให้สิทธิ์ดาวน์โหลดไฟล์เต็ม',
  },
  {
    q: 'พรีวิวแล้วบันทึกภาพได้ไหม?',
    a: 'โหมดพรีวิวมีไว้ดูตัวอย่างเท่านั้น ภาพมีลายน้ำกำกับและบันทึกไม่ได้ เมื่อซื้อด้วยเครดิตแล้วจึงจะได้ไฟล์เต็มความละเอียดสูงแบบไม่มีลายน้ำ',
  },
  {
    q: 'เติมเครดิตมีโปรโมชั่นหรือโบนัสไหม?',
    a: 'ไม่มี — เราคิดตรงไปตรงมา เติมเท่าไรได้เครดิตเท่านั้นตามอัตรา 1 บาท = 1 เครดิต ไม่มีโบนัส ไม่มีโค้ดส่วนลด เพื่อความโปร่งใส',
  },
  {
    q: 'ใช้ได้กับมือถือรุ่นไหนบ้าง?',
    a: 'ไฟล์ความละเอียดสูง 1440×3120px รองรับทั้ง iPhone และ Android ทุกรุ่น ตั้งเป็นหน้าจอล็อกหรือหน้าจอหลักได้ทั้งหมด',
  },
];

export function MuWallpaperHomepage({
  store,
  products,
  categories,
  landingContent,
}: MuWallpaperHomepageProps) {
  const catalogUrl = `/stores/${store.slug}/category`;
  const topupUrl = `/stores/${store.slug}/account/credit/topup`;

  const headline =
    landingContent?.heroHeadline?.trim() ||
    'เปลี่ยนหน้าจอมือถือให้เป็นเครื่องรางนำโชค';
  const subheadline =
    landingContent?.heroSubheadline?.trim() ||
    'วอลล์เปเปอร์เสริมดวงดีไซน์พรีเมียม ผ่านการปลุกเสกตามตำรา เติมเครดิตไว้ในกระเป๋า แล้วเลือกซื้อลายที่ใช่ — พรีวิวก่อนได้ทุกลาย ซื้อแล้วดาวน์โหลดไฟล์เต็มทันที';
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || 'เลือกวอลล์เปเปอร์';

  // Hero image fallback chain: landingContent → bannerUrl → first product.
  const heroImage =
    landingContent?.heroImageUrl ||
    store.bannerUrl ||
    products[0]?.imageUrl ||
    null;

  const featured = products.slice(0, 6);
  const bundleStrip = products.slice(0, 5);

  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const day = activeDay !== null ? DAYS[activeDay] : null;

  // Map a product's category to a สายมู glow; default to gold.
  const glowFor = (categoryName: string | null, idx: number) => {
    const keys = Object.keys(MU_CATEGORY_GLOW);
    if (categoryName && MU_CATEGORY_GLOW[categoryName])
      return MU_CATEGORY_GLOW[categoryName];
    return MU_CATEGORY_GLOW[keys[idx % keys.length]] ?? H.gold;
  };

  return (
    <div
      className="mu-home min-h-screen font-[family:var(--font-prompt)]"
      style={{
        background: `var(--shop-bg, ${H.bg})`,
        color: `var(--shop-ink, ${H.ink})`,
        ['--shop-primary' as string]: H.gold,
        backgroundImage:
          'radial-gradient(70% 50% at 82% -5%, rgba(233,205,132,.10), transparent 60%), radial-gradient(80% 55% at 12% 8%, rgba(124,102,210,.18), transparent 62%), radial-gradient(90% 60% at 50% 120%, rgba(124,102,210,.10), transparent 60%)',
      }}
    >
      <div className="max-w-[1180px] mx-auto px-4">
        {/* ───── Hero ───── */}
        <section className="pt-10 pb-7 sm:pt-14">
          <div className="grid gap-8 items-center lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <span
                className="text-[12px] tracking-[0.26em] uppercase font-semibold"
                style={{ color: 'var(--shop-primary)' }}
              >
                ปลุกเสกตามฤกษ์ · ระบบเครดิตเติมเท่าไรใช้เท่านั้น
              </span>
              <h1 className="mt-3.5 font-[family:var(--font-kanit)] font-bold leading-[1.18] tracking-[-0.01em] text-[clamp(30px,8.5vw,52px)]">
                {headline.includes('เครื่องราง') ? (
                  <>
                    เปลี่ยนหน้าจอมือถือ
                    <br />
                    ให้เป็น
                    <span className="mu-gold-text">เครื่องรางนำโชค</span>
                  </>
                ) : (
                  headline
                )}
              </h1>
              <p
                className="mt-3.5 max-w-[42ch] text-[clamp(15px,4vw,18px)] leading-relaxed"
                style={{ color: H.inkMuted }}
              >
                {subheadline}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={catalogUrl} className="mu-btn mu-btn-gold">
                  {ctaLabel}
                </Link>
                <Link href={topupUrl} className="mu-btn mu-btn-ghost">
                  เติมเครดิต
                </Link>
              </div>
              <div
                className="mt-6 flex flex-wrap gap-[18px] text-[13px]"
                style={{ color: H.inkMuted }}
              >
                <span>
                  <span style={{ color: H.gold }}>★</span>{' '}
                  <b style={{ color: H.ink }}>4.9</b> จาก 8,200+ รีวิว
                </span>
                <span>
                  <b style={{ color: H.ink }}>120,000+</b> ดาวน์โหลด
                </span>
                <span>
                  <b style={{ color: H.ink }}>ปลุกเสก</b> ทุกชิ้น
                </span>
              </div>
            </div>

            {/* Hero art — floating wallpaper previews + halo */}
            <div className="mu-hero-art">
              <div className="mu-halo" />
              <WallpaperTile
                glow={H.wealth}
                imageUrl={heroImage}
                motif="naga"
                bless="ทรัพย์ไหลมา"
                style={{
                  position: 'absolute',
                  width: 150,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%,-50%) rotate(-9deg) translateX(-54px)',
                  boxShadow: H.shadow,
                }}
              />
              <WallpaperTile
                glow={H.career}
                imageUrl={products[1]?.imageUrl ?? null}
                motif="mandala"
                bless="สำเร็จ"
                style={{
                  position: 'absolute',
                  width: 150,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%,-50%) rotate(7deg) translateX(56px) translateY(18px)',
                  zIndex: 2,
                  boxShadow: H.shadow,
                }}
              />
            </div>
          </div>
        </section>

        {/* ───── Wallet card ───── */}
        <section
          className="mu-panel-gold flex flex-wrap items-center justify-between gap-4 px-5 py-5"
          aria-label="กระเป๋าเครดิต"
        >
          <div>
            <small
              className="block text-[12px] tracking-[0.16em] uppercase font-semibold"
              style={{ color: H.gold2 }}
            >
              กระเป๋าเครดิตของคุณ
            </small>
            <p className="mt-1.5 text-[12.5px]" style={{ color: H.inkMuted }}>
              อัตรา 1 บาท = 1 เครดิต · เติมเท่าไรได้เท่านั้น ไม่มีโปรโมชั่นแอบแฝง
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-[170px] flex-1 max-w-[240px]">
            <Link href={topupUrl} className="mu-btn mu-btn-gold">
              เติมเครดิต
            </Link>
            <Link href={catalogUrl} className="mu-btn mu-btn-ghost">
              ใช้เครดิตเลือกลาย
            </Link>
          </div>
        </section>

        {/* ───── Lucky-day tool ───── */}
        <section className="mu-daytool mt-5">
          <span
            className="text-[12px] tracking-[0.26em] uppercase font-semibold"
            style={{ color: 'var(--shop-primary)' }}
          >
            เครื่องมือเสริมดวง
          </span>
          <h2 className="mt-1 font-[family:var(--font-kanit)] font-semibold text-[clamp(19px,5vw,24px)]">
            เช็กสีมงคล &amp; ดวงประจำวันเกิด
          </h2>
          <p className="mt-1 mb-4 text-[14px]" style={{ color: H.inkMuted }}>
            แตะวันเกิดของคุณ แล้วเราจะแนะนำสีมงคลและหมวดวอลล์เปเปอร์ที่ส่งเสริมดวงคุณที่สุด
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DAYS.map((d, i) => (
              <button
                key={d.th}
                type="button"
                onClick={() => setActiveDay(i)}
                className={`mu-day ${activeDay === i ? 'is-active' : ''}`}
              >
                <span className="block font-semibold text-[14px]">{d.th}</span>
                <span
                  className="mu-day-dot"
                  style={{ background: d.color }}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          {day ? (
            <div className="mu-day-result mt-4">
              <div
                className="mu-dr-swatch"
                style={{ background: day.color, color: day.color }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-[160px]">
                <b className="font-[family:var(--font-kanit)] font-semibold">
                  เกิดวัน{day.th} · สีมงคล {day.cn}
                </b>
                <small className="block text-[13px]" style={{ color: H.inkMuted }}>
                  แนะนำหมวด “{day.catLabel}” — {day.note}
                </small>
              </div>
              <Link
                href={`${catalogUrl}?cat=${encodeURIComponent(day.catLabel)}`}
                className="mu-btn mu-btn-ghost"
                style={{ padding: '10px 18px', fontSize: 14 }}
              >
                ดูวอลล์เปเปอร์แนะนำ
              </Link>
            </div>
          ) : null}
        </section>

        {/* ───── Featured grid ───── */}
        <div className="mu-shead">
          <div>
            <h2 className="font-[family:var(--font-kanit)] font-semibold text-[clamp(22px,6vw,30px)]">
              ลายแนะนำประจำเดือน
            </h2>
            <p className="mt-1 text-[14px]" style={{ color: H.inkMuted }}>
              ลายขายดีจากทุกหมวด — พรีวิวได้ก่อน ซื้อด้วยเครดิต
            </p>
          </div>
          <Link href={catalogUrl} className="mu-more">
            ดูทั้งหมด →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mu-grid">
            {featured.map((p, idx) => {
              const glow = glowFor(p.categoryName, idx);
              const hasDiscount =
                p.compareAtPriceTHB != null && p.compareAtPriceTHB > p.priceTHB;
              return (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="mu-card"
                  style={{ ['--cat' as string]: glow }}
                >
                  <div className="mu-card-media">
                    <WallpaperTile glow={glow} imageUrl={p.imageUrl} motif={motifFor(idx)} />
                    <span className="mu-card-badge">ปลุกเสกแล้ว</span>
                  </div>
                  <div className="mu-card-body">
                    <div className="flex items-center justify-between gap-2">
                      {p.categoryName ? (
                        <span className="mu-tag">{p.categoryName}</span>
                      ) : (
                        <span />
                      )}
                      <span className="text-[12.5px]" style={{ color: H.inkMuted }}>
                        <span style={{ color: H.gold }}>★</span> 4.9
                      </span>
                    </div>
                    <h3 className="font-[family:var(--font-kanit)] font-semibold text-[16px] line-clamp-1">
                      {p.title}
                    </h3>
                    <div className="mu-card-foot">
                      <span className="mu-price">
                        {formatTHB(p.priceTHB)}{' '}
                        <small style={{ color: H.faint }}>เครดิต</small>
                        {hasDiscount ? (
                          <small className="line-through ml-1.5" style={{ color: H.faint }}>
                            {formatTHB(p.compareAtPriceTHB as number)}
                          </small>
                        ) : null}
                      </span>
                      <span className="mu-add">ซื้อด้วยเครดิต</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}

        {/* ───── Bundle upsell ───── */}
        <section className="mu-panel-gold mu-bundle mt-6 px-5 py-6">
          <div>
            <span
              className="text-[12px] tracking-[0.2em] uppercase font-semibold"
              style={{ color: 'var(--shop-primary)' }}
            >
              ขายดีที่สุด
            </span>
            <h3 className="mt-1.5 mb-2 font-[family:var(--font-kanit)] font-semibold text-[clamp(21px,5.5vw,28px)]">
              เซ็ตมงคลครบ 5 ด้าน
            </h3>
            <p className="max-w-[46ch] text-[14px]" style={{ color: H.inkMuted }}>
              รวมวอลล์เปเปอร์ตัวเด่นจากทุกหมวด เสริมดวงรอบด้านทั้งการเงิน ความรัก
              การงาน แคล้วคลาด และสุขภาพ ในชุดเดียว คุ้มกว่าซื้อแยก
            </p>
            <div className="flex gap-2 mt-3">
              {(bundleStrip.length > 0
                ? bundleStrip
                : [null, null, null, null, null]
              ).map((p, i) => (
                <WallpaperTile
                  key={p?.id ?? i}
                  glow={Object.values(MU_CATEGORY_GLOW)[i] ?? H.gold}
                  imageUrl={p?.imageUrl ?? null}
                  motif={motifFor(i)}
                  style={{ width: 54, borderRadius: 10 }}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3.5 mt-3.5">
              <span className="mu-bundle-price">
                <span className="mu-gold-text font-[family:var(--font-kanit)] font-bold text-[30px]">
                  199
                </span>
                <span className="text-[14px]" style={{ color: H.inkMuted }}>
                  เครดิต
                </span>
              </span>
              <Link href={catalogUrl} className="mu-btn mu-btn-gold" style={{ padding: '12px 22px' }}>
                ซื้อเซ็ตด้วยเครดิต
              </Link>
            </div>
          </div>
          <div className="mu-hero-art" style={{ height: 200 }}>
            <div className="mu-halo" style={{ width: 200, height: 200 }} />
          </div>
        </section>

        {/* ───── How it works ───── */}
        <div className="mu-shead">
          <h2 className="font-[family:var(--font-kanit)] font-semibold text-[clamp(22px,6vw,30px)]">
            ใช้งานง่าย แค่ 3 ขั้นตอน
          </h2>
        </div>
        <div className="mu-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="mu-step">
              <div className="mu-step-n">{s.n}</div>
              <h4 className="font-[family:var(--font-kanit)] font-semibold text-[17px] mb-1.5">
                {s.title}
              </h4>
              <p className="text-[13.5px]" style={{ color: H.inkMuted }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* ───── Reviews ───── */}
        <div className="mu-shead">
          <h2 className="font-[family:var(--font-kanit)] font-semibold text-[clamp(22px,6vw,30px)]">
            เสียงจากสายมูตัวจริง
          </h2>
        </div>
        <div className="mu-reviews">
          {REVIEWS.map((r) => (
            <div key={r.who} className="mu-review">
              <div className="text-[14px] tracking-[2px]" style={{ color: H.gold }}>
                ★★★★★
              </div>
              <p className="my-2.5 text-[14.5px]">“{r.text}”</p>
              <div className="flex items-center gap-3">
                <span className="mu-rv-av">{r.av}</span>
                <span>
                  <b className="font-semibold text-[14px]">{r.who}</b>
                  <small className="block text-[12px]" style={{ color: H.faint }}>
                    {r.sub}
                  </small>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ───── FAQ ───── */}
        <div className="mu-shead">
          <h2 className="font-[family:var(--font-kanit)] font-semibold text-[clamp(22px,6vw,30px)]">
            คำถามที่พบบ่อย
          </h2>
        </div>
        <div className="mu-faq pb-12">
          {FAQ.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q} className={`mu-q ${open ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="mu-q-btn"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}
                >
                  <span>{item.q}</span>
                  <svg
                    className="mu-q-ic"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                {open ? (
                  <p className="mu-q-body">{item.a}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .mu-gold-text {
          background: ${MU_WALLPAPER_GOLD_GRADIENT};
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        /* Buttons */
        .mu-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 22px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 15px;
          border: 1px solid transparent;
          transition: 0.18s ${H.ease};
          text-align: center;
        }
        .mu-btn-gold {
          background: ${MU_WALLPAPER_GOLD_GRADIENT};
          color: ${H.goldInk};
          box-shadow: 0 12px 30px -10px rgba(233, 205, 132, 0.5);
        }
        .mu-btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 36px -10px rgba(233, 205, 132, 0.6);
        }
        .mu-btn-ghost {
          border-color: ${H.border2};
          background: rgba(255, 255, 255, 0.03);
          color: var(--shop-ink, ${H.ink});
        }
        .mu-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: ${H.goldDeep};
        }
        /* Hero art */
        .mu-hero-art {
          position: relative;
          height: 320px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .mu-halo {
          position: absolute;
          width: 290px;
          height: 290px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(233, 205, 132, 0.22), transparent 62%);
          filter: blur(8px);
        }
        /* Wallpaper preview tile */
        .mu-wp {
          position: relative;
          aspect-ratio: 9 / 16;
          border-radius: 16px;
          overflow: hidden;
          background: #0a0820;
          isolation: isolate;
        }
        .mu-wp-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          /* `contain` keeps marketing-style covers (4:5 / 16:9 graphics
             with text + mockups at the edges) fully visible inside the
             9:16 portrait tile. The dark `.mu-wp` background colour
             absorbs any letterbox so the gap is invisible. */
          object-fit: contain;
        }
        .mu-wp-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(
              120% 75% at 50% 14%,
              color-mix(in oklab, var(--glow) 42%, transparent),
              transparent 58%
            ),
            radial-gradient(100% 55% at 50% 122%, #05030f, transparent 60%),
            linear-gradient(180deg, #1a1340, #0a0820 78%);
        }
        .mu-wp-stars {
          position: absolute;
          inset: 0;
          opacity: 0.5;
          background-image: radial-gradient(1px 1px at 20% 30%, #fff, transparent),
            radial-gradient(1px 1px at 70% 18%, #fff, transparent),
            radial-gradient(1px 1px at 40% 70%, #fff, transparent),
            radial-gradient(1.4px 1.4px at 85% 60%, #fff, transparent),
            radial-gradient(1px 1px at 12% 82%, #fff, transparent),
            radial-gradient(1px 1px at 60% 90%, #fff, transparent);
        }
        .mu-wp-orb {
          position: absolute;
          left: 50%;
          top: 44%;
          transform: translate(-50%, -50%);
          width: 52%;
          aspect-ratio: 1;
          border-radius: 50%;
          border: 1.4px solid #f1d98e;
          box-shadow: 0 0 12px color-mix(in oklab, var(--glow) 70%, transparent),
            inset 0 0 18px color-mix(in oklab, var(--glow) 30%, transparent);
        }
        .mu-wp-bless {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 9%;
          text-align: center;
          font-family: var(--font-kanit), cursive;
          font-size: clamp(13px, 3.6vw, 17px);
          color: ${H.gold2};
          opacity: 0.92;
          text-shadow: 0 0 10px rgba(233, 205, 132, 0.5);
        }
        .mu-wp-ring {
          position: absolute;
          inset: 6px;
          border: 1px solid rgba(233, 205, 132, 0.22);
          border-radius: 11px;
        }
        .mu-wp-float-a,
        .mu-wp-float-b {
          position: absolute;
          width: 150px;
          left: 50%;
          top: 50%;
          box-shadow: ${H.shadow};
        }
        .mu-wp-float-a {
          transform: translate(-50%, -50%) rotate(-9deg) translateX(-54px);
          animation: mu-float-a 7s ${H.ease} infinite;
        }
        .mu-wp-float-b {
          transform: translate(-50%, -50%) rotate(7deg) translateX(56px) translateY(18px);
          z-index: 2;
          animation: mu-float-b 8s ${H.ease} infinite;
        }
        @keyframes mu-float-a {
          50% {
            transform: translate(-50%, -50%) rotate(-9deg) translateX(-54px) translateY(-14px);
          }
        }
        @keyframes mu-float-b {
          50% {
            transform: translate(-50%, -50%) rotate(7deg) translateX(56px) translateY(4px);
          }
        }
        /* Gold panels (wallet + bundle) */
        .mu-panel-gold {
          margin-top: 4px;
          border-radius: ${H.radiusLg};
          overflow: hidden;
          border: 1px solid rgba(233, 205, 132, 0.3);
          background: linear-gradient(
              135deg,
              rgba(233, 205, 132, 0.15),
              rgba(124, 102, 210, 0.16)
            ),
            var(--shop-card, ${H.surface});
        }
        .mu-bundle-price {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        /* Lucky-day tool */
        .mu-daytool {
          background: linear-gradient(160deg, var(--shop-card, ${H.surface}), ${H.bg2});
          border: 1px solid var(--shop-border, ${H.border});
          border-radius: ${H.radiusLg};
          padding: 22px 18px;
        }
        .mu-day {
          flex: none;
          min-width: 62px;
          padding: 11px 6px;
          border-radius: 14px;
          border: 1px solid var(--shop-border, ${H.border});
          background: rgba(255, 255, 255, 0.03);
          text-align: center;
          transition: 0.16s ${H.ease};
        }
        .mu-day:hover {
          border-color: ${H.border2};
        }
        .mu-day.is-active {
          border-color: ${H.gold};
          background: rgba(233, 205, 132, 0.12);
          box-shadow: 0 0 0 1px ${H.gold} inset;
        }
        .mu-day-dot {
          display: block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin: 6px auto 0;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        .mu-day-result {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--shop-border, ${H.border});
          animation: mu-rise 0.35s ${H.ease};
        }
        @keyframes mu-rise {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
        }
        .mu-dr-swatch {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          flex: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 16px -2px currentColor;
        }
        /* Section head */
        .mu-shead {
          margin: 32px 0 16px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }
        .mu-more {
          font-size: 14px;
          font-weight: 600;
          color: ${H.gold2};
          white-space: nowrap;
        }
        .mu-more:hover {
          color: ${H.gold};
        }
        /* Product grid + cards */
        .mu-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-top: 6px;
        }
        .mu-card {
          background: var(--shop-card, ${H.surface});
          border: 1px solid var(--shop-border, ${H.border});
          border-radius: ${H.radius};
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: 0.2s ${H.ease};
          position: relative;
        }
        .mu-card:hover {
          transform: translateY(-4px);
          border-color: ${H.border2};
          box-shadow: ${H.shadow};
        }
        .mu-card-media {
          position: relative;
          padding: 10px 10px 0;
        }
        .mu-card-media :global(.mu-wp) {
          border-radius: 13px;
        }
        .mu-card-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 3;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 4px 9px;
          border-radius: 999px;
          background: rgba(11, 9, 24, 0.7);
          border: 1px solid rgba(233, 205, 132, 0.4);
          color: ${H.gold2};
          backdrop-filter: blur(4px);
        }
        .mu-card-body {
          padding: 11px 13px 13px;
          display: flex;
          flex-direction: column;
          gap: 7px;
          flex: 1;
        }
        .mu-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 999px;
          background: color-mix(in oklab, var(--cat) 18%, transparent);
          color: var(--cat);
          border: 1px solid color-mix(in oklab, var(--cat) 35%, transparent);
        }
        .mu-card-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: auto;
          padding-top: 4px;
        }
        .mu-price {
          font-family: var(--font-kanit);
          font-weight: 600;
          font-size: 17px;
          color: ${H.gold2};
        }
        .mu-price small {
          font-family: var(--font-prompt);
          font-weight: 500;
          font-size: 11.5px;
        }
        .mu-add {
          display: inline-flex;
          align-items: center;
          padding: 8px 13px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          background: rgba(233, 205, 132, 0.12);
          border: 1px solid rgba(233, 205, 132, 0.4);
          color: ${H.gold2};
          transition: 0.16s ${H.ease};
          white-space: nowrap;
        }
        .mu-card:hover .mu-add {
          background: ${H.gold};
          color: ${H.goldInk};
        }
        /* Bundle layout */
        .mu-bundle {
          display: grid;
          gap: 18px;
        }
        /* Steps */
        .mu-steps {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin-top: 8px;
        }
        .mu-step {
          background: var(--shop-card, ${H.surface});
          border: 1px solid var(--shop-border, ${H.border});
          border-radius: ${H.radius};
          padding: 20px 18px;
        }
        .mu-step-n {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          font-family: var(--font-kanit);
          font-weight: 700;
          background: rgba(233, 205, 132, 0.14);
          border: 1px solid rgba(233, 205, 132, 0.35);
          color: ${H.gold2};
          margin-bottom: 12px;
        }
        /* Reviews */
        .mu-reviews {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin-top: 8px;
        }
        .mu-review {
          background: var(--shop-card, ${H.surface});
          border: 1px solid var(--shop-border, ${H.border});
          border-radius: ${H.radius};
          padding: 20px 18px;
        }
        .mu-rv-av {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          flex: none;
          display: grid;
          place-items: center;
          font-family: var(--font-kanit);
          font-weight: 600;
          background: linear-gradient(135deg, ${H.surface2}, ${H.bg2});
          border: 1px solid ${H.border2};
          color: ${H.gold2};
          font-size: 15px;
        }
        /* FAQ */
        .mu-faq {
          margin-top: 8px;
          border-top: 1px solid var(--shop-border, ${H.border});
        }
        .mu-q {
          border-bottom: 1px solid var(--shop-border, ${H.border});
        }
        .mu-q-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 18px 4px;
          background: none;
          border: 0;
          text-align: left;
          font-family: var(--font-kanit);
          font-weight: 500;
          font-size: 16px;
          color: var(--shop-ink, ${H.ink});
        }
        .mu-q-ic {
          flex: none;
          transition: transform 0.25s ${H.ease};
          color: ${H.gold};
        }
        .mu-q.is-open .mu-q-ic {
          transform: rotate(45deg);
        }
        .mu-q-body {
          padding: 0 4px 18px;
          color: ${H.inkMuted};
          font-size: 14px;
          animation: mu-rise 0.28s ${H.ease};
        }
        /* Responsive */
        @media (min-width: 560px) {
          .mu-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .mu-steps,
          .mu-reviews {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 860px) {
          .mu-hero-art {
            height: 400px;
          }
          .mu-wp-float-a,
          .mu-wp-float-b {
            width: 184px;
          }
          .mu-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .mu-bundle {
            grid-template-columns: 1.3fr 1fr;
            align-items: center;
            padding: 32px 30px;
          }
          .mu-daytool {
            padding: 30px 28px;
          }
        }
      `}</style>
    </div>
  );
}

export default MuWallpaperHomepage;
