'use client';

/**
 * EverydayProductHero — clean consumer-retail PDP hero matching the
 * minimop24 mockup. Distinct from BusinessModelProductHero:
 *   - Photo-forward 2-col gallery (thumbs left, main right) — no tier
 *     spreadsheet, no Net-30 ledger.
 *   - Pills row (SKU / Bestseller / NEW / พร้อมส่ง) above title.
 *   - Big red price + slashed compare-at + "ประหยัด ฿X" tag + countdown note.
 *   - 2-col CTAs (ใส่ตะกร้า white, ซื้อเลย red) + 3 ghost buttons.
 *   - 2×2 trust bar (ส่งฟรี / คืน 7 วัน / รับประกัน / ชำระปลอดภัย).
 *   - Optional 4-up feature card strip below.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  BatteryMedium,
  Check,
  CreditCard,
  Eye,
  Feather,
  Flame,
  GitCompare,
  Heart,
  MessageCircle,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Volume2,
  Wind,
  Zap,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type {
  ProductDetailHeroProduct,
  ProductDetailHeroStore,
} from '@/components/storefront/ProductDetailHero';

const SAFE_LINE_LINK = 'https://line.me';

function shortSku(id: string): string {
  return `BP-${id.replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase()}`;
}

function stubCountdown(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hh = String(2 + (hash % 6)).padStart(2, '0');
  const mm = String(hash % 60).padStart(2, '0');
  const ss = String((hash >> 8) % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function EverydayProductHero({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  return (
    <div className="space-y-6">
      <CountdownBanner productId={product.id} />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <Gallery product={product} />
        <InfoColumn product={product} store={store} />
      </div>
      <FeatureCards />
    </div>
  );
}

/* ── Flash deal countdown stripe ─────────────────────────────────── */

function CountdownBanner({ productId }: { productId: string }) {
  const countdown = stubCountdown(productId);
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3 rounded-md px-4 py-3 text-sm sm:text-base"
      style={{
        background: 'linear-gradient(90deg, #DC2626 0%, #B91C1C 100%)',
        color: '#ffffff',
      }}
    >
      <Flame className="h-5 w-5 shrink-0" />
      <span className="font-extrabold uppercase tracking-[0.04em]">
        Flash deal · ลดเฉพาะวันนี้
      </span>
      <span aria-hidden style={{ opacity: 0.5 }}>
        ·
      </span>
      <span className="inline-flex items-center gap-1 font-mono font-bold">
        เหลือ
        {countdown.split(':').map((part, i, arr) => (
          <span key={i} className="inline-flex items-center gap-1">
            <span
              className="rounded px-2 py-0.5 text-sm"
              style={{ background: 'rgba(0,0,0,0.25)', minWidth: '2rem', textAlign: 'center' }}
            >
              {part}
            </span>
            {i < arr.length - 1 && <span style={{ opacity: 0.6 }}>:</span>}
          </span>
        ))}
      </span>
      <span className="text-xs opacity-90 hidden sm:inline">
        ลดเพิ่ม 20% · จำกัด 100 ออเดอร์แรก
      </span>
    </div>
  );
}

/* ── Gallery ─────────────────────────────────────────────────────── */

function Gallery({ product }: { product: ProductDetailHeroProduct }) {
  const [idx, setIdx] = useState(0);
  const images = useMemo(() => {
    const fromArr = product.images?.length ? product.images : [];
    const merged = [product.imageUrl, ...fromArr].filter(
      (x): x is string => !!x,
    );
    return Array.from(new Set(merged));
  }, [product.imageUrl, product.images]);

  const discount =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
      ? Math.round((1 - product.priceTHB / product.originalPriceTHB) * 100)
      : null;

  if (images.length === 0) {
    return (
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div
          className="aspect-square rounded-2xl border bg-white flex items-center justify-center text-sm"
          style={{ borderColor: 'var(--shop-border, #E5E5E5)', color: '#737373' }}
        >
          ไม่มีรูปภาพ
        </div>
      </div>
    );
  }

  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="lg:sticky lg:top-24 lg:self-start grid grid-cols-[68px_1fr] gap-3 sm:grid-cols-[76px_1fr]">
      {/* Thumbnails column */}
      <ul className="flex flex-col gap-2">
        {images.slice(0, 7).map((src, i) => (
          <li key={src + i}>
            <button
              type="button"
              onClick={() => setIdx(i)}
              className="relative block aspect-square w-full overflow-hidden rounded-lg border bg-white transition"
              style={{
                borderColor:
                  i === idx ? '#0A0A0A' : 'var(--shop-border, #E5E5E5)',
                borderWidth: i === idx ? 2 : 1.5,
              }}
              aria-label={`รูปที่ ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${product.title} — รูปที่ ${i + 1}`}
                fill
                sizes="76px"
                className="object-cover p-1.5"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Main image */}
      <div
        className="relative aspect-square rounded-2xl border bg-white"
        style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
      >
        {discount != null && discount > 0 && (
          <span
            className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-extrabold uppercase shadow-sm"
            style={{
              background: '#DC2626',
              color: '#ffffff',
              letterSpacing: '0.04em',
            }}
          >
            <Flame className="h-3.5 w-3.5" /> Sale −{discount}%
          </span>
        )}
        <div className="relative h-full w-full overflow-hidden rounded-2xl p-8 sm:p-12 lg:p-16">
          <Image
            src={images[idx]}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-contain"
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="รูปก่อนหน้า"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
              style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="รูปถัดไป"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
              style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
            >
              ›
            </button>
          </>
        )}
        <span
          className="absolute bottom-4 right-4 rounded-full px-3 py-1 text-xs font-semibold tracking-[0.04em]"
          style={{ background: 'rgba(0,0,0,0.75)', color: '#ffffff' }}
        >
          {idx + 1} / {images.length}
        </span>
      </div>
    </div>
  );
}

/* ── Info column ─────────────────────────────────────────────────── */

function InfoColumn({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [variantIdx, setVariantIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants[variantIdx];
  const inStock =
    selectedVariant?.inventory == null
      ? (product.stockLeft ?? 1) > 0
      : selectedVariant.inventory > 0;

  const discount =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
      ? Math.round((1 - product.priceTHB / product.originalPriceTHB) * 100)
      : null;
  const savings =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
      ? product.originalPriceTHB - product.priceTHB
      : null;

  const countdown = stubCountdown(product.id);

  const handleAdd = () => {
    if (!inStock) return;
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: product.priceTHB,
        imageUrl: product.imageUrl ?? undefined,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push(`/stores/${store.slug}/checkout`);
  };

  return (
    <div className="space-y-5">
      {/* Pills row */}
      <div className="flex flex-wrap items-center gap-2">
        <Pill mono>SKU: {shortSku(product.id)}</Pill>
        {product.badges.includes('hot') && (
          <Pill tone="deal">
            <Flame className="h-3.5 w-3.5" /> Bestseller
          </Pill>
        )}
        {product.badges.includes('new') && <Pill tone="info">NEW 2026</Pill>}
        <Pill>
          <Package className="h-3.5 w-3.5" /> พร้อมส่ง
        </Pill>
      </div>

      {/* Title */}
      <h1
        className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl"
        style={{ color: '#0A0A0A' }}
      >
        {product.title}
      </h1>

      {/* Sub row */}
      <div
        className="flex flex-wrap items-center gap-4 border-b pb-5 text-sm"
        style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
      >
        <span style={{ color: '#F59E0B', letterSpacing: '1px' }}>
          ★★★★★
          <strong className="ml-1 text-sm" style={{ color: '#0A0A0A' }}>
            {(product.rating ?? 4.8).toFixed(1)}
          </strong>
        </span>
        <span className="inline-flex items-center gap-1" style={{ color: '#404040' }}>
          <span style={{ color: '#1D4ED8', fontWeight: 600 }}>
            {(product.reviewCount ?? 248).toLocaleString()} รีวิว
          </span>
        </span>
        <span className="inline-flex items-center gap-1" style={{ color: '#404040' }}>
          <Eye className="h-4 w-4" style={{ color: '#737373' }} />
          ขายแล้ว {(product.soldCount ?? 12400).toLocaleString()}+ ชิ้น
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1"
          style={{ color: '#1D4ED8', fontWeight: 600 }}
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.share) {
              navigator.share({ title: product.title, url: window.location.href }).catch(() => {});
            }
          }}
        >
          <Share2 className="h-4 w-4" /> แชร์
        </button>
      </div>

      {/* Price block */}
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <span
            className="text-4xl font-extrabold tracking-tight"
            style={{ color: '#DC2626', lineHeight: 1 }}
          >
            {formatTHB(product.priceTHB)}
          </span>
          {product.originalPriceTHB &&
            product.originalPriceTHB > product.priceTHB && (
              <span
                className="text-base font-medium line-through"
                style={{ color: '#737373' }}
              >
                {formatTHB(product.originalPriceTHB)}
              </span>
            )}
          {savings != null && (
            <span
              className="self-center rounded-md px-2 py-1 text-xs font-extrabold tracking-wide"
              style={{ background: '#DC2626', color: '#ffffff' }}
            >
              ประหยัด {formatTHB(savings)}
            </span>
          )}
        </div>
        {discount != null && discount > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs" style={{ color: '#737373' }}>
            <Flame className="h-3.5 w-3.5" style={{ color: '#15803D' }} />
            ราคาโปรหมดใน{' '}
            <b style={{ color: '#DC2626', fontWeight: 800 }}>{countdown}</b>
            <span aria-hidden> · กลับเป็นราคาเต็ม</span>
          </p>
        )}
      </div>

      {/* Variant */}
      {product.variants.length > 0 && (
        <div>
          <div
            className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em]"
            style={{ color: '#737373' }}
          >
            ตัวเลือก{' '}
            <span
              className="font-bold normal-case tracking-normal text-[13px]"
              style={{ color: '#0A0A0A' }}
            >
              : {selectedVariant
                ? Object.values(selectedVariant.attributes).join(' / ')
                : '—'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v, i) => {
              const label = Object.values(v.attributes).join(' / ');
              const active = i === variantIdx;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantIdx(i)}
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
                  style={{
                    borderColor: active ? '#0A0A0A' : '#D4D4D4',
                    background: active ? '#0A0A0A' : '#ffffff',
                    color: active ? '#ffffff' : '#0A0A0A',
                    borderWidth: 1.5,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Qty + stock */}
      <div>
        <div
          className="mb-2.5 text-xs font-bold uppercase tracking-[0.08em]"
          style={{ color: '#737373' }}
        >
          จำนวน
        </div>
        <div className="flex flex-wrap items-center gap-3.5">
          <div
            className="flex items-center overflow-hidden rounded-lg border bg-white"
            style={{ borderColor: '#D4D4D4', borderWidth: 1.5 }}
          >
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-11 w-10 text-lg font-semibold hover:bg-zinc-50"
              aria-label="ลดจำนวน"
            >
              <Minus className="mx-auto h-4 w-4" />
            </button>
            <input
              type="text"
              value={qty}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!Number.isNaN(n)) setQty(Math.max(1, n));
              }}
              className="h-11 w-14 border-0 text-center text-base font-bold outline-none"
              style={{ background: '#ffffff' }}
            />
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="h-11 w-10 text-lg font-semibold hover:bg-zinc-50"
              aria-label="เพิ่มจำนวน"
            >
              <Plus className="mx-auto h-4 w-4" />
            </button>
          </div>
          <div className="text-xs" style={{ color: '#404040' }}>
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
              style={{ background: inStock ? '#15803D' : '#DC2626' }}
            />
            {inStock ? (
              <>
                มี{' '}
                <b style={{ color: '#15803D', fontWeight: 700 }}>ในสต๊อก</b>
                {' '}· พร้อมส่งภายใน 24 ชม.
              </>
            ) : (
              <b style={{ color: '#DC2626', fontWeight: 700 }}>สินค้าหมด</b>
            )}
          </div>
        </div>
      </div>

      {/* Primary CTAs */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inStock}
          className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-5 py-3.5 text-sm font-bold tracking-wide transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderColor: '#0A0A0A', color: '#0A0A0A', borderWidth: 1.5 }}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> เพิ่มแล้ว
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> ใส่ตะกร้า
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm font-bold tracking-wide text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: '#DC2626' }}
        >
          <Zap className="h-4 w-4" /> ซื้อเลย
        </button>
      </div>

      {/* Secondary buttons */}
      <div className="flex flex-wrap gap-2">
        <GhostButton icon={<Heart className="h-4 w-4" />} label="เก็บไว้ก่อน" />
        <GhostButton
          icon={<MessageCircle className="h-4 w-4" />}
          label="สอบถามทาง LINE"
          href={SAFE_LINE_LINK}
        />
        <GhostButton icon={<GitCompare className="h-4 w-4" />} label="เปรียบเทียบ" />
      </div>

      {/* Trust bar 2x2 */}
      <ul
        className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 sm:gap-3.5"
        style={{ borderColor: 'var(--shop-border, #E5E5E5)', borderWidth: 1.5 }}
      >
        <TrustItem
          icon={<Truck className="h-5 w-5" />}
          title="ส่งฟรี ฿590+"
          subtitle="ทั่วประเทศ 1-3 วันทำการ"
        />
        <TrustItem
          icon={<RotateCcw className="h-5 w-5" />}
          title="คืนภายใน 7 วัน"
          subtitle="ของไม่ตรงสเปค คืนได้ทันที"
        />
        <TrustItem
          icon={<ShieldCheck className="h-5 w-5" />}
          title="รับประกัน 1 ปี"
          subtitle="ครอบคลุมความเสียหายจากการใช้งาน"
        />
        <TrustItem
          icon={<CreditCard className="h-5 w-5" />}
          title="ชำระปลอดภัย"
          subtitle="SSL · COD ได้ · ผ่อน 0% นาน 3 เดือน"
        />
      </ul>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function Pill({
  children,
  tone,
  mono,
}: {
  children: React.ReactNode;
  tone?: 'deal' | 'info';
  mono?: boolean;
}) {
  const palette =
    tone === 'deal'
      ? { bg: '#FEF2F2', color: '#DC2626', border: '#FCA5A5' }
      : tone === 'info'
        ? { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' }
        : { bg: '#FAFAFA', color: '#404040', border: '#E5E5E5' };
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-semibold' +
        (mono ? ' font-mono font-bold' : '')
      }
      style={{
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
      }}
    >
      {children}
    </span>
  );
}

function GhostButton({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
}) {
  const Tag: 'a' | 'button' = href ? 'a' : 'button';
  return (
    <Tag
      {...(href
        ? { href, target: '_blank', rel: 'noopener noreferrer' }
        : { type: 'button' })}
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border bg-white px-3.5 py-2.5 text-xs font-semibold transition hover:border-zinc-900 hover:text-zinc-900"
      style={{ borderColor: 'var(--shop-border, #E5E5E5)', color: '#404040', borderWidth: 1.5 }}
    >
      {icon}
      {label}
    </Tag>
  );
}

function TrustItem({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span style={{ color: '#0A0A0A' }} className="shrink-0">
        {icon}
      </span>
      <div className="text-xs">
        <div className="font-bold" style={{ color: '#0A0A0A', fontSize: '13px' }}>
          {title}
        </div>
        <div style={{ color: '#737373' }}>{subtitle}</div>
      </div>
    </li>
  );
}

/* ── Feature cards section (4-up under the buy box) ──────────────── */

function FeatureCards() {
  return (
    <section className="mt-12">
      <div className="mb-7">
        <p
          className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ color: '#737373' }}
        >
          ★ ทำไมต้องช้อปกับเรา
        </p>
        <h2
          className="text-2xl font-extrabold tracking-tight sm:text-3xl"
          style={{ color: '#0A0A0A' }}
        >
          4 เหตุผลที่ลูกค้า <em className="not-italic" style={{ color: '#DC2626' }}>ไว้ใจ</em>
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <FeatureCard
          icon={<Truck className="h-7 w-7" />}
          title="ส่งฟรี ฿590+"
          subtitle="ทั่วประเทศ 1-3 วันทำการ · ของถึงไวจากกรุงเทพ"
        />
        <FeatureCard
          icon={<RotateCcw className="h-7 w-7" />}
          title="คืนได้ใน 7 วัน"
          subtitle="ของไม่ตรงสเปคหรือชำรุด เปลี่ยน/คืนได้ทันที"
        />
        <FeatureCard
          icon={<ShieldCheck className="h-7 w-7" />}
          title="ของแท้ 100%"
          subtitle="รับประกันจากร้าน · มีใบกำกับภาษีให้ทุกออเดอร์"
        />
        <FeatureCard
          icon={<CreditCard className="h-7 w-7" />}
          title="ชำระสบาย"
          subtitle="SSL · COD ได้ · ผ่อน 0% ผ่านบัตรเครดิต"
        />
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className="rounded-xl border bg-white p-5 sm:p-6"
      style={{ borderColor: 'var(--shop-border, #E5E5E5)', borderWidth: 1.5 }}
    >
      <div className="mb-4" style={{ color: '#0A0A0A' }}>
        {icon}
      </div>
      <h4
        className="mb-1.5 text-sm font-extrabold sm:text-base"
        style={{ color: '#0A0A0A' }}
      >
        {title}
      </h4>
      <p className="text-xs leading-relaxed" style={{ color: '#737373' }}>
        {subtitle}
      </p>
    </div>
  );
}
