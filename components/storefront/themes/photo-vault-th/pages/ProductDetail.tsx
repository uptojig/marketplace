'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Aperture,
  ShoppingBag,
  Download,
  Zap,
  ShieldCheck,
  Star,
  Plus,
  Minus,
  ChevronRight,
  Camera,
  Sparkles,
  FileType,
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
  store: { id: string; slug: string; name: string; logoUrl?: string | null };
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
  };
  related: ProductCard[];
}

type TabKey = 'desc' | 'specs' | 'how' | 'license';

const TABS: Array<{ id: TabKey; label: string }> = [
  { id: 'desc', label: 'รายละเอียด' },
  { id: 'specs', label: 'สเปกไฟล์' },
  { id: 'how', label: 'วิธีติดตั้ง' },
  { id: 'license', label: 'ใบอนุญาต' },
];

export default function ProductDetail({
  store,
  product,
  related,
}: ProductDetailProps) {
  const gallery = useMemo(() => {
    const all = [product.imageUrl, ...product.images].filter(
      (u): u is string => !!u,
    );
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<TabKey>('desc');
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );

  const variant = product.variants.find((v) => v.id === selectedVariant) ?? null;
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

  const add = useCart((s) => s.add);

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

  return (
    <div className="bg-[#0C0A09] text-[#F5F5F4] font-[family:var(--font-prompt)] min-h-screen">
      {/* Breadcrumb */}
      <section className="border-b border-[#44403C] bg-[#0C0A09]">
        <div className="max-w-7xl mx-auto px-4 py-3 text-xs uppercase tracking-[0.24em] text-[#A8A29E] flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <Link
            href={`/stores/${store.slug}`}
            className="hover:text-[#F59E0B] transition-colors shrink-0"
          >
            Vault
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link
            href={`/stores/${store.slug}/category`}
            className="hover:text-[#F59E0B] transition-colors shrink-0"
          >
            ทั้งหมด
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(
                  product.categoryName,
                )}`}
                className="hover:text-[#F59E0B] transition-colors shrink-0"
              >
                {product.categoryName}
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14">
        {/* Gallery — sticky on desktop */}
        <div className="space-y-4 lg:sticky lg:top-28 self-start">
          <div className="relative aspect-square border border-[#44403C] bg-[#1C1917] overflow-hidden group">
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 bg-[#E11D48] text-white text-xs font-bold uppercase tracking-[0.24em] px-3 py-1.5 pv-glow-rose">
                ลด {discountPct}%
              </div>
            )}
            {gallery[activeImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gallery[activeImage]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1C1917] via-[#0C0A09] to-[#1C1917]">
                <Aperture
                  className="w-32 h-32 text-[#44403C]"
                  strokeWidth={0.75}
                />
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {gallery.slice(0, 5).map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-square overflow-hidden border transition-colors ${
                    idx === activeImage
                      ? 'border-[#F59E0B]'
                      : 'border-[#44403C] hover:border-[#A8A29E]'
                  }`}
                  aria-label={`รูปที่ ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-7">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {product.categoryName && (
                <span className="text-[10px] uppercase tracking-[0.32em] text-[#FBBF24] font-semibold">
                  {product.categoryName}
                </span>
              )}
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#57534E]">
                · SKU {product.id.slice(-6).toUpperCase()}
              </span>
            </div>
            <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              {product.title}
            </h1>
            {/* Rating placeholder */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]"
                  />
                ))}
              </div>
              <span className="text-xs text-[#A8A29E] uppercase tracking-wider">
                4.9 · จากช่างภาพมืออาชีพ
              </span>
            </div>
          </div>

          {/* Price block */}
          <div className="border-y border-[#44403C] py-5">
            <div className="flex items-baseline gap-4">
              <span className="font-[family:var(--font-kanit)] font-bold text-4xl text-[#F59E0B]">
                {formatTHB(effectivePrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-[#57534E] line-through">
                    {formatTHB(product.originalPriceTHB!)}
                  </span>
                  <span className="bg-[#FBBF24] text-[#0C0A09] text-[10px] font-bold uppercase tracking-[0.24em] px-2 py-1">
                    ประหยัด {formatTHB(product.originalPriceTHB! - effectivePrice)}
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#A8A29E] mt-2">
              ราคารวมภาษีแล้ว · ไม่มีค่าธรรมเนียมแฝง
            </p>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#A8A29E] font-semibold">
                แพ็คเกจ
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const active = selectedVariant === v.id;
                  const label =
                    v.colorLabel ||
                    v.sizeLabel ||
                    v.materialLabel ||
                    Object.values(v.attributes).join(' · ') ||
                    'ตัวเลือก';
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v.id)}
                      className={`px-4 h-11 border text-sm font-[family:var(--font-kanit)] font-semibold tracking-wide transition-colors ${
                        active
                          ? 'border-[#F59E0B] bg-[#F59E0B] text-[#0C0A09]'
                          : 'border-[#44403C] text-[#F5F5F4] hover:border-[#F59E0B]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Qty + Add */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center border border-[#44403C]">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="ลดจำนวน"
                className="w-12 h-14 flex items-center justify-center hover:bg-[#292524] text-[#F5F5F4] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-14 h-14 flex items-center justify-center font-[family:var(--font-kanit)] font-bold text-lg border-x border-[#44403C]">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="เพิ่มจำนวน"
                className="w-12 h-14 flex items-center justify-center hover:bg-[#292524] text-[#F5F5F4] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 h-14 px-6 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold tracking-wide text-base transition-colors pv-glow-amber"
            >
              <ShoppingBag className="w-5 h-5" />
              เพิ่มในตะกร้า
            </button>
          </div>

          {/* Trust grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-[#44403C] p-4 text-center bg-[#1C1917]">
              <Download className="w-5 h-5 text-[#F59E0B] mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#A8A29E] font-semibold">
                ดาวน์โหลดทันที
              </p>
            </div>
            <div className="border border-[#44403C] p-4 text-center bg-[#1C1917]">
              <ShieldCheck className="w-5 h-5 text-[#FBBF24] mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#A8A29E] font-semibold">
                ใบอนุญาตตลอดชีพ
              </p>
            </div>
            <div className="border border-[#44403C] p-4 text-center bg-[#1C1917]">
              <Zap className="w-5 h-5 text-[#E11D48] mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#A8A29E] font-semibold">
                อัพเดทฟรี
              </p>
            </div>
          </div>

          {/* Compatibility chip */}
          <div className="flex flex-wrap gap-2">
            {['Lightroom CC', 'Lightroom Classic', 'Photoshop', 'DaVinci', 'Premiere'].map((sw) => (
              <span
                key={sw}
                className="text-[10px] uppercase tracking-[0.24em] text-[#FBBF24] border border-[#F59E0B]/30 px-2.5 py-1 bg-[#0C0A09]"
              >
                {sw}
              </span>
            ))}
          </div>

          {/* Stock indicator */}
          {typeof product.stockLeft === 'number' &&
            product.stockLeft > 0 &&
            product.stockLeft < 20 && (
              <div className="border-l-2 border-[#E11D48] bg-[#1C1917] px-4 py-3 text-sm text-[#FBBF24] font-[family:var(--font-kanit)] font-semibold">
                ⚡ ลิมิเต็ดดรอป — เหลือเพียง {product.stockLeft} ใบอนุญาต
              </div>
            )}

          {/* Tabs */}
          <div className="border-t border-[#44403C] pt-6">
            <div className="flex flex-wrap gap-1 mb-5 border-b border-[#44403C]">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 text-xs uppercase tracking-[0.24em] font-bold transition-colors -mb-px border-b-2 ${
                    tab === t.id
                      ? 'border-[#F59E0B] text-[#F59E0B]'
                      : 'border-transparent text-[#A8A29E] hover:text-[#F5F5F4]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="text-sm leading-relaxed text-[#D6D3D1]">
              {tab === 'desc' && (
                <div className="space-y-3">
                  {product.description ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p className="text-[#A8A29E] italic">
                      ผู้ขายยังไม่ได้เพิ่มรายละเอียด — ทักหาช่างภาพเพื่อขอข้อมูลเพิ่มเติม
                    </p>
                  )}
                </div>
              )}
              {tab === 'specs' && (
                <ul className="space-y-2.5">
                  <SpecRow
                    icon={FileType}
                    k="ฟอร์แมตไฟล์"
                    v=".xmp · .acr · .cube · .lrtemplate"
                  />
                  <SpecRow icon={Camera} k="แพลตฟอร์ม" v="Adobe Lightroom · Photoshop · DaVinci Resolve" />
                  <SpecRow
                    icon={ShieldCheck}
                    k="ขนาดไฟล์"
                    v="~ 50-120 MB · ZIP archive"
                  />
                  <SpecRow icon={Download} k="วิธีรับ" v="ดาวน์โหลดทันทีหลังชำระ" />
                </ul>
              )}
              {tab === 'how' && (
                <ol className="list-decimal pl-5 space-y-2">
                  <li>หลังชำระเงิน ระบบจะส่งลิงก์ดาวน์โหลดไปยังอีเมลและหน้า &quot;ออเดอร์ของฉัน&quot;</li>
                  <li>แตกไฟล์ ZIP และ Import พรีเซ็ตเข้า Lightroom (.xmp) หรือ Photoshop (.acr)</li>
                  <li>ปรับ Exposure / WB ของภาพต้นฉบับก่อนใช้พรีเซ็ตเพื่อผลลัพธ์ที่ดีที่สุด</li>
                  <li>ใช้พรีเซ็ตได้ไม่จำกัดในงานของคุณเอง</li>
                </ol>
              )}
              {tab === 'license' && (
                <div className="space-y-3">
                  <p>
                    <strong className="text-[#F5F5F4]">ใบอนุญาตส่วนบุคคล</strong> — ใช้สำหรับงานของผู้ซื้อเอง รวมถึงงานคอมเมอร์เชียลที่คุณเป็นช่างภาพหลัก
                  </p>
                  <p className="text-[#A8A29E]">
                    ห้ามจำหน่ายต่อ แจกฟรี หรือนำไปรวมในแพ็คเกจอื่น โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-[#44403C] bg-[#1C1917]">
          <div className="max-w-7xl mx-auto px-4 py-14">
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-[#44403C]">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] font-semibold mb-2">
                  More from Vault
                </p>
                <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight">
                  สินค้าที่เกี่ยวข้อง
                </h2>
              </div>
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="group block bg-[#0C0A09] border border-[#44403C] hover:border-[#F59E0B] transition-colors"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1C1917] to-[#0C0A09]">
                        <Aperture
                          className="w-10 h-10 text-[#44403C]"
                          strokeWidth={1}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm line-clamp-1 text-[#F5F5F4] group-hover:text-[#FBBF24] transition-colors">
                      {p.title}
                    </h3>
                    <p className="font-[family:var(--font-kanit)] font-bold text-base text-[#F59E0B] mt-1">
                      {formatTHB(p.priceTHB)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function SpecRow({
  icon: Icon,
  k,
  v,
}: {
  icon: React.ComponentType<{ className?: string }>;
  k: string;
  v: string;
}) {
  return (
    <li className="flex items-start gap-3 py-2 border-b border-[#292524]">
      <Icon className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
      <span className="text-[10px] uppercase tracking-[0.32em] text-[#A8A29E] w-32 shrink-0 mt-0.5">
        {k}
      </span>
      <span className="text-sm text-[#F5F5F4] flex-1">{v}</span>
    </li>
  );
}
