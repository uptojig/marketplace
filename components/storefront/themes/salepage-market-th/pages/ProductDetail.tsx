'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Code2,
  ShoppingCart,
  Zap,
  ChevronRight,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  ExternalLink,
  Download,
  ShieldCheck,
  RefreshCcw,
  Tag,
  Clock,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface ProductCard {
  id: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  categoryName?: string | null;
}

interface Variant {
  id: string;
  attributes: Record<string, string>;
  colorLabel?: string | null;
  sizeLabel?: string | null;
  materialLabel?: string | null;
  priceTHB: number;
  imageUrl?: string | null;
  inventory: number | null;
}

interface ProductDetailProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  product: {
    id: string;
    title: string;
    description?: string | null;
    priceTHB: number;
    originalPriceTHB?: number | null;
    imageUrl?: string | null;
    images: string[];
    variants: Variant[];
    stockLeft?: number | null;
    videoUrl?: string | null;
    categoryName?: string | null;
    /** Server passes `externalPayload` through — typed loosely
     *  because supplier shape varies. We only read `demoUrl`,
     *  `tags`, `updatedAt`. */
    externalPayload?: unknown;
    updatedAt?: string | Date | null;
  };
  related: ProductCard[];
}

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTH: Record<DeviceSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const DEVICE_LABEL: Record<DeviceSize, string> = {
  desktop: 'เดสก์ท็อป',
  tablet: 'แท็บเล็ต',
  mobile: 'มือถือ',
};

const DEVICE_ICON: Record<DeviceSize, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

/**
 * Pull `demoUrl` and `tags` out of the loose `externalPayload`
 * blob. Returns nulls when missing or malformed so legacy products
 * still render with the fallback image gallery.
 */
function extractMeta(payload: unknown): {
  demoUrl: string | null;
  tags: string[];
} {
  if (!payload || typeof payload !== 'object') {
    return { demoUrl: null, tags: [] };
  }
  const p = payload as Record<string, unknown>;
  const demo = typeof p.demoUrl === 'string' && p.demoUrl.trim() ? p.demoUrl.trim() : null;
  const rawTags = Array.isArray(p.tags) ? p.tags : [];
  const tags = rawTags
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .slice(0, 6);
  return { demoUrl: demo, tags };
}

function formatLastUpdate(d: string | Date | null | undefined): string | null {
  if (!d) return null;
  try {
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function ProductDetail({
  store,
  product,
  related,
}: ProductDetailProps) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const { demoUrl, tags } = useMemo(
    () => extractMeta(product.externalPayload),
    [product.externalPayload],
  );

  const gallery = useMemo(() => {
    const variantImages = product.variants
      .map((v) => v.imageUrl)
      .filter((u): u is string => !!u);
    const all = [product.imageUrl, ...product.images, ...variantImages].filter(
      (u): u is string => !!u,
    );
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images, product.variants]);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [device, setDevice] = useState<DeviceSize>('desktop');
  const [activeTab, setActiveTab] =
    useState<'description' | 'specs' | 'support'>('description');
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );

  const variant = product.variants.find((v) => v.id === selectedVariantId) ?? null;
  const effectivePrice = variant?.priceTHB ?? product.priceTHB;
  const hasDiscount =
    product.originalPriceTHB && product.originalPriceTHB > effectivePrice;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.originalPriceTHB! - effectivePrice) /
          product.originalPriceTHB!) *
          100,
      )
    : 0;

  const lastUpdate = formatLastUpdate(product.updatedAt);

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: effectivePrice,
        imageUrl: variant?.imageUrl || product.imageUrl || undefined,
      },
      qty,
    );
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push(`/stores/${store.slug}/checkout`);
  };

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FAFBFC)' }}
    >
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-xs text-[color:var(--shop-ink-muted,#6B7280)] flex items-center gap-1.5 flex-wrap">
        <Link
          href={`/stores/${store.slug}`}
          className="hover:text-[color:var(--shop-primary,#82B440)]"
        >
          {store.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link
          href={`/stores/${store.slug}/category`}
          className="hover:text-[color:var(--shop-primary,#82B440)]"
        >
          เทมเพลตทั้งหมด
        </Link>
        {product.categoryName && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
              className="hover:text-[color:var(--shop-primary,#82B440)]"
            >
              {product.categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-6 lg:gap-8">
        {/* ─── MAIN COLUMN — Live demo OR gallery ───────────────── */}
        <div className="space-y-5">
          {demoUrl ? (
            <LiveDemoFrame
              demoUrl={demoUrl}
              productId={product.id}
              storeSlug={store.slug}
              device={device}
              onDeviceChange={setDevice}
            />
          ) : (
            <Gallery
              gallery={gallery}
              productTitle={product.title}
              activeImage={activeImage}
              onSelect={setActiveImage}
              hasDiscount={Boolean(hasDiscount)}
              discountPct={discountPct}
            />
          )}

          {/* Tabs: Description / Specs / Support */}
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'var(--shop-bg-soft, #FFFFFF)',
              border: '1px solid var(--shop-border, #E5E7EB)',
            }}
          >
            <div
              className="flex items-center border-b overflow-x-auto"
              style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
              role="tablist"
            >
              {[
                { id: 'description' as const, label: 'รายละเอียด' },
                { id: 'specs' as const, label: 'สเปก & คุณสมบัติ' },
                { id: 'support' as const, label: 'การส่งมอบ & การคืนเงิน' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === t.id
                      ? 'text-[color:var(--shop-primary,#82B440)]'
                      : 'text-[color:var(--shop-ink-muted,#6B7280)] border-transparent hover:text-[color:var(--shop-ink,#0D1421)]'
                  }`}
                  style={
                    activeTab === t.id
                      ? { borderBottomColor: 'var(--shop-primary, #82B440)' }
                      : undefined
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5 sm:p-6">
              {activeTab === 'description' && (
                <div className="prose prose-sm max-w-none prose-headings:font-[family:var(--font-kanit)] prose-headings:font-bold prose-p:text-[color:var(--shop-ink,#0D1421)]/85 prose-li:marker:text-[color:var(--shop-primary,#82B440)]">
                  {product.description ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p className="text-[color:var(--shop-ink-muted,#6B7280)]">
                      เทมเพลตเซลเพจ HTML คุณภาพสูง พร้อมโค้ดสะอาด อ่านง่าย ปรับแต่งได้ง่าย ใช้ได้กับเครื่องมือ landing-page ทุกแพลตฟอร์ม
                    </p>
                  )}
                </div>
              )}
              {activeTab === 'specs' && (
                <ul className="grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { k: 'ประเภทไฟล์', v: 'HTML / CSS / JS' },
                    { k: 'รองรับเบราว์เซอร์', v: 'Chrome · Safari · Edge · Firefox' },
                    { k: 'Responsive', v: 'Desktop · Tablet · Mobile' },
                    { k: 'License', v: 'Single-site Commercial' },
                    { k: 'อัปเดตฟรี', v: '12 เดือน' },
                    { k: 'การส่งมอบ', v: 'ดาวน์โหลดทันทีหลังชำระเงิน' },
                  ].map((s) => (
                    <li
                      key={s.k}
                      className="flex flex-col gap-0.5 py-2 border-b"
                      style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
                    >
                      <span className="text-xs uppercase tracking-wider text-[color:var(--shop-ink-muted,#6B7280)]">
                        {s.k}
                      </span>
                      <span className="text-sm text-[color:var(--shop-ink,#0D1421)] font-medium">
                        {s.v}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'support' && (
                <div className="space-y-3 text-sm leading-relaxed text-[color:var(--shop-ink,#0D1421)]/85">
                  <p>
                    <strong>การส่งมอบไฟล์:</strong> หลังชำระเงินสำเร็จ ระบบจะส่งลิงก์ดาวน์โหลดเข้าบัญชีของคุณภายในไม่กี่วินาที — สามารถดาวน์โหลดซ้ำได้ตลอดอายุ license
                  </p>
                  <p>
                    <strong>นโยบายคืนเงิน:</strong> รับประกันคืนเงินภายใน 14 วันหากเทมเพลตไม่ตรงตามรายละเอียดที่แสดง — เนื่องจากเป็นสินค้าดิจิทัล กรุณาพรีวิวสดและอ่านสเปกก่อนซื้อ
                  </p>
                  <p>
                    <strong>การติดต่อ:</strong> ทีมงานพร้อมตอบทุกคำถามผ่านอีเมล / LINE Official ภายใน 24 ชั่วโมงในวันทำการ
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── SIDEBAR — Price / Buy / Specs ───────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          {/* Price card */}
          <div
            className="rounded-lg p-5 sm:p-6 space-y-4"
            style={{
              background: 'var(--shop-bg-soft, #FFFFFF)',
              border: '1px solid var(--shop-border, #E5E7EB)',
              boxShadow: '0 1px 2px rgba(13, 20, 33, 0.04)',
            }}
          >
            <div className="space-y-1">
              {product.categoryName && (
                <p className="text-[11px] uppercase tracking-wider text-[color:var(--shop-ink-muted,#6B7280)]">
                  {product.categoryName}
                </p>
              )}
              <h1 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[color:var(--shop-ink,#0D1421)]">
                {product.title}
              </h1>
            </div>

            {/* Tech badges */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="salepage-tag inline-flex items-center rounded px-2 py-1 font-semibold"
                    style={{
                      background: 'var(--shop-muted, #F3F4F6)',
                      color: 'var(--shop-ink, #0D1421)',
                      border: '1px solid var(--shop-border, #E5E7EB)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Last updated */}
            {lastUpdate && (
              <p className="inline-flex items-center gap-1.5 text-xs text-[color:var(--shop-ink-muted,#6B7280)]">
                <Clock className="w-3 h-3" />
                อัปเดตล่าสุด {lastUpdate}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-3 border-t" style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}>
              <span className="font-[family:var(--font-kanit)] font-bold text-3xl text-[color:var(--shop-primary,#82B440)]">
                {formatTHB(effectivePrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-[color:var(--shop-ink-muted,#6B7280)] line-through">
                    {formatTHB(product.originalPriceTHB!)}
                  </span>
                  <span
                    className="text-xs font-bold rounded px-2 py-0.5 text-white"
                    style={{ background: 'var(--shop-savings, #FF6B35)' }}
                  >
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--shop-ink-muted,#6B7280)]">
                  ตัวเลือก License
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const active = selectedVariantId === v.id;
                    const label =
                      Object.values(v.attributes).join(' · ') || 'มาตรฐาน';
                    const inStock = v.inventory == null || v.inventory > 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => inStock && setSelectedVariantId(v.id)}
                        disabled={!inStock}
                        className={`inline-flex items-center rounded-md px-3 h-9 text-xs font-medium border transition-colors ${
                          active
                            ? 'text-white border-transparent'
                            : 'border-[color:var(--shop-border,#E5E7EB)] text-[color:var(--shop-ink,#0D1421)] hover:border-[color:var(--shop-primary,#82B440)]'
                        } ${!inStock ? 'opacity-50 cursor-not-allowed line-through' : ''}`}
                        style={
                          active
                            ? {
                                background:
                                  'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
                              }
                            : undefined
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleBuyNow}
                className="inline-flex items-center justify-center gap-2 rounded-md h-12 text-sm font-bold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
                }}
              >
                <Zap className="w-4 h-4" />
                ซื้อเลย · ดาวน์โหลดทันที
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-md h-11 text-sm font-semibold border transition-colors"
                style={{
                  borderColor: 'var(--shop-border, #E5E7EB)',
                  color: 'var(--shop-ink, #0D1421)',
                  background: 'var(--shop-bg-soft, #FFFFFF)',
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                เพิ่มในตะกร้า
              </button>
            </div>

            {/* Trust list */}
            <ul
              className="space-y-2 pt-3 border-t text-xs text-[color:var(--shop-ink-muted,#6B7280)]"
              style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
            >
              <li className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[color:var(--shop-primary,#82B440)]" />
                ดาวน์โหลดทันทีหลังชำระเงิน
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[color:var(--shop-primary,#82B440)]" />
                License เชิงพาณิชย์ · single-site
              </li>
              <li className="flex items-center gap-2">
                <RefreshCcw className="w-3.5 h-3.5 text-[color:var(--shop-primary,#82B440)]" />
                อัปเดตฟรี 12 เดือน
              </li>
              <li className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[color:var(--shop-primary,#82B440)]" />
                คืนเงิน 14 วัน (ดูเงื่อนไข)
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-[family:var(--font-kanit)] text-xl sm:text-2xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)]">
              เทมเพลตที่เกี่ยวข้อง
            </h2>
            <Link
              href={`/stores/${store.slug}/category`}
              className="text-sm font-medium text-[color:var(--shop-primary,#82B440)] hover:underline inline-flex items-center gap-1"
            >
              ดูทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/stores/${store.slug}/products/${p.id}`}
                className="group rounded-lg overflow-hidden salepage-card block"
                style={{
                  background: 'var(--shop-bg-soft, #FFFFFF)',
                  border: '1px solid var(--shop-border, #E5E7EB)',
                }}
              >
                <div
                  className="relative aspect-[16/10]"
                  style={{ background: 'var(--shop-muted, #F3F4F6)' }}
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Code2 className="w-8 h-8 text-[color:var(--shop-primary,#82B440)]/40" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-[family:var(--font-kanit)] font-semibold text-xs sm:text-sm line-clamp-2 text-[color:var(--shop-ink,#0D1421)] mb-1">
                    {p.title}
                  </h3>
                  <span className="font-[family:var(--font-kanit)] font-bold text-sm text-[color:var(--shop-primary,#82B440)]">
                    {formatTHB(p.priceTHB)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function LiveDemoFrame({
  demoUrl,
  productId,
  storeSlug,
  device,
  onDeviceChange,
}: {
  demoUrl: string;
  productId: string;
  storeSlug: string;
  device: DeviceSize;
  onDeviceChange: (d: DeviceSize) => void;
}) {
  // Truncate URL for display in the top bar
  const displayUrl = useMemo(() => {
    try {
      const u = new URL(demoUrl);
      return `${u.host}${u.pathname}`.replace(/\/$/, '');
    } catch {
      return demoUrl.replace(/^https?:\/\//, '').slice(0, 60);
    }
  }, [demoUrl]);

  return (
    <div
      className="salepage-frame-shell rounded-xl overflow-hidden"
      style={{
        border: '1px solid var(--shop-border, #E5E7EB)',
      }}
    >
      {/* Top bar — URL + device toggle + fullscreen link */}
      <div
        className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 border-b"
        style={{
          borderColor: 'var(--shop-border, #E5E7EB)',
          background: 'var(--shop-bg-soft, #FFFFFF)',
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#82B440]" />
          </div>
          <span
            className="salepage-tag truncate text-[11px] px-2 py-1 rounded"
            style={{
              background: 'var(--shop-muted, #F3F4F6)',
              color: 'var(--shop-ink-muted, #6B7280)',
              border: '1px solid var(--shop-border, #E5E7EB)',
            }}
            title={demoUrl}
          >
            {displayUrl}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Device toggle */}
          <div
            className="hidden sm:inline-flex items-center rounded-md p-0.5"
            style={{ background: 'var(--shop-muted, #F3F4F6)' }}
            role="group"
            aria-label="ขนาดอุปกรณ์"
          >
            {(['desktop', 'tablet', 'mobile'] as DeviceSize[]).map((d) => {
              const Icon = DEVICE_ICON[d];
              const active = device === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onDeviceChange(d)}
                  aria-pressed={active}
                  aria-label={DEVICE_LABEL[d]}
                  title={DEVICE_LABEL[d]}
                  className={`inline-flex items-center justify-center w-7 h-7 rounded transition-colors ${
                    active
                      ? 'bg-white text-[color:var(--shop-primary,#82B440)] shadow-sm'
                      : 'text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-ink,#0D1421)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
          <Link
            href={`/stores/${storeSlug}/products/${productId}/preview`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--shop-primary,#82B440)] hover:underline"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">เปิดเต็มจอ</span>
          </Link>
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-ink,#0D1421)]"
            aria-label="เปิดในแท็บใหม่"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Iframe surface */}
      <div
        className="relative w-full aspect-[16/10] overflow-hidden"
        style={{
          background: 'var(--shop-muted, #F3F4F6)',
        }}
      >
        <div
          className="absolute inset-0 flex items-start justify-center overflow-auto"
          style={{
            background:
              device !== 'desktop'
                ? 'linear-gradient(135deg, #FAFBFC 0%, #F3F4F6 100%)'
                : 'transparent',
          }}
        >
          <iframe
            src={demoUrl}
            title="พรีวิวเทมเพลตสด"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer"
            loading="lazy"
            className="border-0 bg-white"
            style={{
              width: DEVICE_WIDTH[device],
              height: '100%',
              maxWidth: '100%',
              transition: 'width 0.25s ease-out',
            }}
          />
        </div>
      </div>

      {/* Bottom hint band */}
      <div
        className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2 border-t text-[11px]"
        style={{
          borderColor: 'var(--shop-border, #E5E7EB)',
          background: 'var(--shop-bg-soft, #FFFFFF)',
          color: 'var(--shop-ink-muted, #6B7280)',
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-[color:var(--shop-primary,#82B440)]" />
          พรีวิวสด — ทดสอบจริงก่อนซื้อ
        </span>
        <span className="hidden sm:inline">
          ขนาดแสดงผล:{' '}
          <span className="font-semibold text-[color:var(--shop-ink,#0D1421)]">
            {DEVICE_LABEL[device]}
          </span>
        </span>
      </div>
    </div>
  );
}

function Gallery({
  gallery,
  productTitle,
  activeImage,
  onSelect,
  hasDiscount,
  discountPct,
}: {
  gallery: string[];
  productTitle: string;
  activeImage: number;
  onSelect: (i: number) => void;
  hasDiscount: boolean;
  discountPct: number;
}) {
  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[16/10] rounded-xl overflow-hidden"
        style={{
          background: 'var(--shop-muted, #F3F4F6)',
          border: '1px solid var(--shop-border, #E5E7EB)',
        }}
      >
        {hasDiscount && (
          <span
            className="absolute top-4 left-4 z-10 rounded px-2 py-1 text-xs font-bold text-white"
            style={{ background: 'var(--shop-savings, #FF6B35)' }}
          >
            -{discountPct}%
          </span>
        )}
        {gallery[activeImage] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gallery[activeImage]}
            alt={productTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(130,180,64,0.12) 0%, rgba(0,173,239,0.12) 100%)',
            }}
          >
            <Code2 className="w-16 h-16 text-[color:var(--shop-primary,#82B440)]/40" />
          </div>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {gallery.slice(0, 5).map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => onSelect(idx)}
              className={`aspect-square rounded overflow-hidden transition-all border ${
                idx === activeImage
                  ? 'border-[color:var(--shop-primary,#82B440)]'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={
                idx === activeImage
                  ? undefined
                  : { borderColor: 'var(--shop-border, #E5E7EB)' }
              }
              aria-label={`รูปที่ ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
