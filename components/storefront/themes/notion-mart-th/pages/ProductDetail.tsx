'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Download,
  RefreshCcw,
  ShieldCheck,
  Globe,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Star,
  Check,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

type TabKey = 'description' | 'specs' | 'reviews' | 'shipping';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

export default function NotionMartProductDetail({ store, product, related }: ProductDetailProps) {
  const add = useCart((s) => s.add);

  const gallery = useMemo(() => {
    const all = [product.imageUrl, ...(product.images ?? [])].filter(
      (s): s is string => typeof s === 'string' && s.length > 0,
    );
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState<string | null>(gallery[0] ?? null);

  const variantOptions = useMemo(() => {
    return product.variants
      .map((v) => {
        const parts = [v.colorLabel, v.sizeLabel, v.materialLabel].filter(
          (p): p is string => typeof p === 'string' && p.length > 0,
        );
        return { id: v.id, label: parts.join(' / ') || 'มาตรฐาน', priceTHB: v.priceTHB };
      })
      .filter((v) => v.label !== 'มาตรฐาน' || product.variants.length > 1);
  }, [product.variants]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variantOptions[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<TabKey>('description');

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const effectivePrice = selectedVariant?.priceTHB ?? product.priceTHB;
  const originalPrice = product.originalPriceTHB ?? null;
  const hasDiscount = originalPrice !== null && originalPrice > effectivePrice;
  const discountPct = hasDiscount && originalPrice ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : 0;

  const stockLeft = product.stockLeft ?? null;
  const inStock = stockLeft === null || stockLeft > 0;

  const addToCart = () => {
    if (!inStock) return;
    add({ productId: product.id, title: product.title, priceTHB: effectivePrice, imageUrl: gallery[0] ?? undefined, storeSlug: store.slug, storeName: store.name }, qty);
  };

  return (
    <main className={`bg-white text-[#1A1A1A] min-h-screen ${FONT_BODY}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-8">
        <nav className="flex items-center gap-1 text-[11px] text-[#6B6B6B] tracking-wide">
          <Link href={`/stores/${store.slug}`} className="hover:text-[#2563EB] hover:underline underline-offset-2">หน้าร้าน</Link>
          <ChevronRight className="h-3 w-3" />
          {product.categoryName && (
            <>
              <Link href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`} className="hover:text-[#2563EB] hover:underline underline-offset-2">{product.categoryName}</Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-[#1A1A1A] truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-[#F7F6F3] border border-[#E5E5E5] rounded-md aspect-[4/3] overflow-hidden">
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImage} alt={product.title} className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-[#6B6B6B] gap-2">
                  <span className="text-5xl" aria-hidden>📄</span>
                  <p className="text-[12px]">ไม่มีตัวอย่าง</p>
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.slice(0, 5).map((src) => {
                  const isActive = src === activeImage;
                  return (
                    <button key={src} type="button" onClick={() => setActiveImage(src)} className={`aspect-square overflow-hidden border rounded transition-colors ${isActive ? 'border-[#1A1A1A]' : 'border-[#E5E5E5] hover:border-[#1A1A1A]'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}

            <section className="border-t border-[#E5E5E5] pt-5">
              <div role="tablist" aria-label="รายละเอียดสินค้า" className="flex flex-wrap gap-1 mb-4 border-b border-[#E5E5E5]">
                {([['description', 'รายละเอียด'], ['specs', 'สเปก'], ['reviews', 'รีวิว'], ['shipping', 'การจัดส่ง']] as [TabKey, string][]).map(([k, label]) => (
                  <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`text-[13px] ${FONT_HEADING} font-medium px-3 py-2 -mb-px border-b-2 transition-colors ${tab === k ? 'text-[#1A1A1A] border-[#1A1A1A]' : 'text-[#6B6B6B] border-transparent hover:text-[#1A1A1A]'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {tab === 'description' && (
                <div className="space-y-3 text-[14px] leading-[1.75] text-[#1A1A1A]">
                  {product.description ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <div className="space-y-2">
                      <p>เทมเพลต Notion พร้อมใช้ คัดลอกเข้า workspace ของคุณได้ทันทีหลังชำระ</p>
                      <ul className="list-disc pl-5 space-y-1 text-[#1A1A1A]">
                        <li>โครงสร้างฐานข้อมูลปรับแก้ได้</li>
                        <li>คู่มือการตั้งค่าเป็นภาษาไทย</li>
                        <li>อัปเดตฟรีเมื่อมีเวอร์ชั่นใหม่</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {tab === 'specs' && (
                <ul className="divide-y divide-[#E5E5E5] text-[13px]">
                  <SpecRow label="ประเภทไฟล์" value="Notion Template (.url คัดลอก)" />
                  <SpecRow label="รูปแบบใช้งาน" value="Duplicate to workspace" />
                  <SpecRow label="รองรับภาษา" value="ไทย · อังกฤษ" />
                  <SpecRow label="อัปเดต" value="ฟรีตลอดอายุไฟล์" />
                  <SpecRow label="ขนาดไฟล์" value="< 5 MB" />
                  <SpecRow label="ใช้ได้บน" value="Notion Desktop · Mobile · Web" />
                </ul>
              )}

              {tab === 'reviews' && (
                <ul className="space-y-3">
                  {MOCK_REVIEWS.map((r) => (
                    <li key={r.name} className="border border-[#E5E5E5] rounded-md p-3 bg-white">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-7 w-7 rounded-full bg-[#F7F6F3] border border-[#E5E5E5] grid place-items-center text-[12px] font-bold text-[#1A1A1A]" aria-hidden>{r.name.slice(0, 1)}</div>
                        <p className={`text-[12.5px] ${FONT_HEADING} font-semibold text-[#1A1A1A]`}>{r.name}</p>
                        <div className="ml-auto flex items-center gap-0.5 text-[#2563EB]">
                          {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-3 w-3 fill-current" aria-hidden />))}
                        </div>
                      </div>
                      <p className="text-[13px] text-[#1A1A1A] leading-relaxed">{r.body}</p>
                    </li>
                  ))}
                </ul>
              )}

              {tab === 'shipping' && (
                <div className="space-y-3 text-[13.5px] leading-relaxed">
                  <p className="flex items-center gap-2"><Download className="h-4 w-4 text-[#2563EB]" />ดาวน์โหลดทันทีหลังชำระเงิน (ไม่มีการจัดส่งสินค้า)</p>
                  <p className="flex items-center gap-2"><RefreshCcw className="h-4 w-4 text-[#2563EB]" />อัปเดตฟรีตลอดอายุไฟล์</p>
                  <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#2563EB]" />ลิงก์ดาวน์โหลดส่วนตัว · หมดอายุภายใน 10 นาทีหลังเปิด</p>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:col-span-5 space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div>
              <p className={`text-[10px] tracking-[0.16em] uppercase ${FONT_HEADING} font-medium text-[#6B6B6B]`}>เทมเพลต Notion</p>
              <h1 className={`mt-1 ${FONT_HEADING} font-bold text-2xl sm:text-3xl text-[#1A1A1A] leading-tight`}>{product.title}</h1>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-[#6B6B6B]">
                <span className="inline-flex items-center gap-0.5 text-[#2563EB]"><Star className="h-3 w-3 fill-current" aria-hidden /><span>4.9</span></span>
                <span>·</span><span>248 รีวิว</span><span>·</span><span>ดาวน์โหลดแล้ว 12,400+ ครั้ง</span>
              </div>
            </div>

            <div className="border border-[#E5E5E5] rounded-md p-4 bg-white space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`${FONT_HEADING} font-bold text-3xl text-[#1A1A1A] tabular-nums`}>{formatTHB(effectivePrice)}</span>
                {hasDiscount && originalPrice !== null && (
                  <>
                    <span className="text-[13px] text-[#6B6B6B] line-through tabular-nums">{formatTHB(originalPrice)}</span>
                    <span className="bg-[#DC2626] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{discountPct}%</span>
                  </>
                )}
              </div>
              {!inStock ? (
                <p className="text-[12px] font-medium text-[#DC2626]">สินค้าหมด</p>
              ) : (
                <p className="inline-flex items-center gap-1 text-[12px] text-[#16A34A]"><Check className="h-3 w-3" />พร้อมดาวน์โหลด · ไม่ต้องรอจัดส่ง</p>
              )}
            </div>

            {variantOptions.length > 0 && (
              <div className="space-y-2">
                <p className={`text-[11px] tracking-[0.12em] uppercase ${FONT_HEADING} font-medium text-[#6B6B6B]`}>ตัวเลือก</p>
                <div className="flex flex-wrap gap-1.5">
                  {variantOptions.map((v) => {
                    const active = v.id === selectedVariantId;
                    return (
                      <button key={v.id} type="button" onClick={() => setSelectedVariantId(v.id)} className={`text-[12px] px-3 py-1.5 rounded border transition-colors ${active ? 'bg-black text-white border-black' : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:bg-[#F7F6F3] hover:border-[#1A1A1A]'}`}>
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className={`text-[11px] tracking-[0.12em] uppercase ${FONT_HEADING} font-medium text-[#6B6B6B]`}>จำนวน License</p>
              <div className="inline-flex items-stretch border border-[#E5E5E5] rounded">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="ลดจำนวน" className="px-2.5 hover:bg-[#F7F6F3] text-[#1A1A1A] disabled:opacity-40" disabled={qty <= 1}><Minus className="h-3 w-3" /></button>
                <span className={`px-4 py-1.5 ${FONT_HEADING} font-semibold text-[14px] text-[#1A1A1A] min-w-[3rem] text-center border-x border-[#E5E5E5] tabular-nums`}>{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="เพิ่มจำนวน" className="px-2.5 hover:bg-[#F7F6F3] text-[#1A1A1A]"><Plus className="h-3 w-3" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button type="button" onClick={addToCart} disabled={!inStock} className="inline-flex items-center justify-center gap-1.5 bg-white border border-[#E5E5E5] hover:bg-[#F7F6F3] hover:border-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed text-[#1A1A1A] text-[13px] font-medium px-4 py-2.5 rounded transition-colors">
                <ShoppingCart className="h-3.5 w-3.5" />ใส่ตะกร้า
              </button>
              <Link href={inStock ? `/stores/${store.slug}/cart` : '#'} onClick={(e) => { if (!inStock) { e.preventDefault(); return; } addToCart(); }} className={`inline-flex items-center justify-center gap-1.5 bg-black hover:bg-[#1A1A1A] text-white text-[13px] font-medium px-4 py-2.5 rounded transition-colors ${!inStock ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}>
                <Zap className="h-3.5 w-3.5" />ซื้อเลย
              </Link>
            </div>

            <ul className="border border-[#E5E5E5] rounded-md p-3 space-y-1.5 text-[12.5px] text-[#1A1A1A] bg-white">
              <TrustRow icon={<Download className="h-3.5 w-3.5" />} text="ดาวน์โหลดทันทีหลังชำระเงิน" />
              <TrustRow icon={<RefreshCcw className="h-3.5 w-3.5" />} text="อัปเดตฟรีตลอดอายุไฟล์" />
              <TrustRow icon={<Globe className="h-3.5 w-3.5" />} text="รองรับภาษาไทย · ทดสอบบน Notion ล่าสุด" />
              <TrustRow icon={<ShieldCheck className="h-3.5 w-3.5" />} text="ชำระเงินปลอดภัยผ่าน AnyPay" />
            </ul>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="pt-6 border-t border-[#E5E5E5]">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className={`${FONT_HEADING} font-bold text-xl text-[#1A1A1A]`}>เทมเพลตที่เกี่ยวข้อง</h2>
                <p className="text-[12px] text-[#6B6B6B] mt-0.5">จาก {store.name}</p>
              </div>
              <Link href={`/stores/${store.slug}/category`} className="text-[12.5px] text-[#2563EB] hover:underline underline-offset-2">ดูทั้งหมด →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {related.slice(0, 4).map((r) => {
                const onSale = r.compareAtPriceTHB != null && r.compareAtPriceTHB > r.priceTHB;
                return (
                  <Link key={r.id} href={`/stores/${store.slug}/products/${r.id}`} className="block bg-white border border-[#E5E5E5] rounded-md hover:border-[#1A1A1A] transition-colors">
                    <div className="aspect-[4/3] bg-[#F7F6F3] border-b border-[#E5E5E5] rounded-t-md overflow-hidden flex items-center justify-center">
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.imageUrl} alt={r.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl" aria-hidden>📄</span>
                      )}
                    </div>
                    <div className="p-2.5 space-y-1">
                      <p className={`text-[12.5px] ${FONT_HEADING} font-semibold text-[#1A1A1A] line-clamp-2 leading-snug`}>{r.title}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[13px] font-semibold text-[#1A1A1A] tabular-nums">{formatTHB(r.priceTHB)}</span>
                        {onSale && r.compareAtPriceTHB != null && (
                          <span className="text-[10px] text-[#6B6B6B] line-through tabular-nums">{formatTHB(r.compareAtPriceTHB)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="grid grid-cols-[140px_1fr] py-2.5">
      <span className="text-[#6B6B6B] uppercase tracking-[0.08em] text-[11px] font-[family:var(--font-kanit)] font-medium">{label}</span>
      <span className="text-[#1A1A1A]">{value}</span>
    </li>
  );
}

function TrustRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-[#2563EB] shrink-0 mt-0.5">{icon}</span>
      <span>{text}</span>
    </li>
  );
}

const MOCK_REVIEWS: { name: string; body: string }[] = [
  { name: 'พลอย', body: 'ใช้งานง่ายมาก คัดลอกเข้า workspace แล้วเริ่มได้เลย คู่มือไทยอ่านเข้าใจชัด' },
  { name: 'อาทิตย์', body: 'จัดระบบงานในทีมได้ดีขึ้นเยอะ ทำตามขั้นตอนที่บอกครบ ไม่ติดปัญหาเลย' },
  { name: 'นัท', body: 'อัปเดตเวอร์ชั่นใหม่ฟรีจริง ทักไปสอบถาม admin ตอบไว ดูแลดี' },
];
