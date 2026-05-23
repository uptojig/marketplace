'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  PackageCheck,
  Tag,
  Truck,
  TrendingDown,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Phone,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

export interface PackagingSupplyHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: string[];
}

// MOQ-tier preview computed off base price. Real tiers come from the
// product schema once wired — these client-side fallbacks mirror the
// bulkbox-industrial pattern so the layout works at scaffold-time.
function moqTiers(base: number) {
  return [
    { qty: 50, unit: base, label: 'ลอง' },
    { qty: 300, unit: Math.round(base * 0.9), label: 'ขายดี' },
    { qty: 1000, unit: Math.round(base * 0.82), label: 'คุ้มสุด' },
  ];
}

const CATEGORY_EMOJI: Record<string, string> = {
  กล่อง: '📦',
  'กล่องไปรษณีย์': '📮',
  ถุง: '🛍️',
  'ถุงไปรษณีย์': '✉️',
  ซอง: '✉️',
  เทป: '🎞️',
  สติกเกอร์: '🏷️',
  'บับเบิ้ล': '🫧',
  ฟิล์ม: '📜',
};

export function Homepage({ store, products, categories }: PackagingSupplyHomepageProps) {
  const add = useCart((s) => s.add);
  const [selectedCat, setSelectedCat] = useState<string>('ทั้งหมด');

  const handleAdd = (p: Product, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    add({
      productId: p.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: p.title,
      priceTHB: p.priceTHB,
      imageUrl: p.imageUrl ?? undefined,
    });
  };

  const hero = useMemo(() => products.find((p) => p.imageUrl) ?? products[0], [products]);
  const bestSellers = useMemo(() => products.slice(0, 8), [products]);

  const filtered = useMemo(() => {
    if (selectedCat === 'ทั้งหมด') return products;
    return products.filter((p) => p.categoryName === selectedCat);
  }, [products, selectedCat]);

  const shopUrl = `/stores/${store.slug}/category`;

  return (
    <main className="min-h-screen bg-[var(--shop-bg)] text-[var(--shop-ink)] font-[family:var(--font-prompt)]">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--shop-bg-soft)] via-[var(--shop-muted)] to-white">
        {/* Decorative tape strips */}
        <div className="absolute top-12 -left-12 w-72 h-12 bg-[var(--shop-accent)] -rotate-6 opacity-70 pointer-events-none" />
        <div className="absolute bottom-10 -right-12 w-60 h-10 bg-[var(--shop-primary)] rotate-6 opacity-80 pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-[var(--shop-primary)]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--shop-primary)]/10 text-[var(--pks-pink-deep)] text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} /> ขายส่งบรรจุภัณฑ์ · MOQ 50 ชิ้น
            </div>
            <h1 className="font-[family:var(--font-kanit)] font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              บรรจุภัณฑ์ราคาส่ง
              <br />
              <span className="text-[var(--shop-primary)]">สั่งเยอะยิ่งถูก</span>
              <span className="inline-block ml-2 align-middle bg-[var(--shop-accent)] text-[var(--shop-ink)] text-base font-bold px-3 py-1 rounded-full rotate-3">
                ใหม่!
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--shop-ink-muted)] max-w-xl leading-relaxed">
              กล่องไปรษณีย์ ถุงไปรษณีย์ ซอง เทป สติกเกอร์ — ครบจบในที่เดียว
              ราคาขายส่งสำหรับร้านค้าออนไลน์ ของชำ และผู้ค้าปลีก จัดส่งทั่วประเทศ
              ผ่านขนส่งคุณภาพ
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={shopUrl}
                className="inline-flex items-center gap-2 bg-[var(--shop-primary)] hover:bg-[var(--pks-pink-deep)] text-white font-bold px-6 py-3.5 rounded-full shadow-lg shadow-[var(--shop-primary)]/30 transition-all hover:-translate-y-0.5"
              >
                ดูสินค้าทั้งหมด <ArrowRight size={18} />
              </Link>
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent('ขายส่ง')}`}
                className="inline-flex items-center gap-2 bg-white hover:bg-[var(--shop-muted)] text-[var(--shop-ink)] font-bold px-6 py-3.5 rounded-full border-2 border-[var(--shop-ink)] transition-all"
              >
                <Phone size={18} /> ขอใบเสนอราคา
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--shop-ink-muted)] pt-2">
              {[
                { icon: Truck, label: 'ส่งฟรี ฿990+' },
                { icon: ShieldCheck, label: 'รับประกันคุณภาพ' },
                { icon: TrendingDown, label: 'ราคาลดตามจำนวน' },
                { icon: PackageCheck, label: 'พร้อมส่งใน 24 ชม.' },
              ].map(({ icon: I, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <I size={14} className="text-[var(--shop-primary)]" />
                  <span className="font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {hero && (
            <div className="lg:col-span-5 relative">
              <div className="relative bg-white rounded-3xl border-4 border-[var(--shop-accent)] shadow-2xl shadow-[var(--shop-primary)]/15 overflow-hidden rotate-1">
                <span className="absolute -top-3 -left-3 bg-[var(--shop-primary)] text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md z-10 rotate-[-4deg]">
                  ขายดี
                </span>
                <div className="aspect-square bg-[var(--shop-muted)]">
                  {hero.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hero.imageUrl}
                      alt={hero.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--pks-ink-dim)]">
                      <Package size={64} />
                    </div>
                  )}
                </div>
                <div className="p-5 bg-white border-t-2 border-dashed border-[var(--shop-border)]">
                  <h3 className="font-[family:var(--font-kanit)] font-bold text-lg line-clamp-1">
                    {hero.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-extrabold text-[var(--shop-primary)]">
                      {formatTHB(hero.priceTHB)}
                    </span>
                    <span className="text-xs text-[var(--shop-ink-muted)]">/ ชิ้น @ MOQ 50</span>
                    {hero.compareAtPriceTHB && (
                      <span className="text-sm text-[var(--pks-ink-dim)] line-through ml-auto">
                        {formatTHB(hero.compareAtPriceTHB)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleAdd(hero, e)}
                    className="mt-4 w-full bg-[var(--shop-ink)] hover:bg-[var(--shop-primary)] text-white font-bold py-3 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={16} /> หยิบใส่ตะกร้า
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Category tiles ─────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h2 className="font-[family:var(--font-kanit)] font-extrabold text-2xl sm:text-3xl tracking-tight">
                ช้อปตามหมวดหมู่
              </h2>
              <p className="text-sm text-[var(--shop-ink-muted)] mt-1">
                เลือกประเภทบรรจุภัณฑ์ที่ใช่กับธุรกิจของคุณ
              </p>
            </div>
            <Link
              href={shopUrl}
              className="text-sm font-bold text-[var(--shop-primary)] hover:underline"
            >
              ทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.slice(0, 12).map((c, i) => {
              const count = products.filter((p) => p.categoryName === c).length;
              const emoji = CATEGORY_EMOJI[c] ?? '📦';
              const tones = [
                'bg-[var(--shop-bg-soft)]',
                'bg-[var(--pks-yellow-soft)]',
                'bg-[var(--pks-blue-soft)]',
              ];
              return (
                <Link
                  key={c}
                  href={`${shopUrl}?cat=${encodeURIComponent(c)}`}
                  className={`group relative ${tones[i % tones.length]} rounded-2xl p-4 border border-[var(--shop-border)] hover:border-[var(--shop-primary)] hover:-translate-y-1 transition-all`}
                >
                  <div className="text-3xl mb-2" aria-hidden>{emoji}</div>
                  <div className="font-bold text-sm text-[var(--shop-ink)] line-clamp-1">{c}</div>
                  <div className="text-[11px] text-[var(--shop-ink-muted)] mt-0.5">{count} รายการ</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── MOQ tier explainer ─────────────────────────────────── */}
      <section className="bg-[var(--shop-bg-soft)] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--shop-savings)]/10 text-[var(--shop-savings)] text-xs font-bold uppercase tracking-widest mb-3">
              <TrendingDown size={14} /> ราคาลดตามจำนวน
            </div>
            <h2 className="font-[family:var(--font-kanit)] font-extrabold text-2xl sm:text-3xl tracking-tight">
              ยิ่งสั่งเยอะ ยิ่งคุ้ม
            </h2>
            <p className="text-sm text-[var(--shop-ink-muted)] mt-2">
              ระบบราคาขั้น (Volume Tier) ลดสูงสุด 18% เมื่อสั่งครบ 1,000 ชิ้น
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { qty: '50+', save: '0%', tone: 'pink', icon: Package, label: 'เริ่มต้น' },
              { qty: '300+', save: '10%', tone: 'yellow', icon: Tag, label: 'ขายดี' },
              { qty: '1,000+', save: '18%', tone: 'blue', icon: TrendingDown, label: 'คุ้มสุด' },
            ].map(({ qty, save, tone, icon: Icon, label }, i) => {
              const bg =
                tone === 'pink'
                  ? 'bg-[var(--shop-primary)] text-white'
                  : tone === 'yellow'
                  ? 'bg-[var(--shop-accent)] text-[var(--shop-ink)]'
                  : 'bg-[var(--shop-savings)] text-white';
              return (
                <div
                  key={qty}
                  className={`relative p-6 rounded-2xl ${bg} shadow-md ${
                    i === 1 ? 'md:-translate-y-2 md:scale-105' : ''
                  }`}
                >
                  <Icon size={28} className="mb-3" />
                  <div className="text-xs font-bold uppercase tracking-widest opacity-80">{label}</div>
                  <div className="font-[family:var(--font-kanit)] font-extrabold text-3xl mt-1">{qty}</div>
                  <div className="text-xs opacity-90 mt-1">ชิ้น/ครั้ง</div>
                  <div className="mt-4 inline-block bg-white/20 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm">
                    ส่วนลด {save}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Filterable best sellers ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="font-[family:var(--font-kanit)] font-extrabold text-2xl sm:text-3xl tracking-tight">
              สินค้าขายดี
            </h2>
            <p className="text-sm text-[var(--shop-ink-muted)] mt-1">
              เลือกตามหมวดหมู่ที่ต้องการ หรือดูทั้งหมด
            </p>
          </div>
          <Link href={shopUrl} className="text-sm font-bold text-[var(--shop-primary)] hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>

        {/* Chip filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
          {['ทั้งหมด', ...categories.slice(0, 8)].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCat(c)}
              className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                selectedCat === c
                  ? 'bg-[var(--shop-primary)] text-white shadow-md'
                  : 'bg-[var(--shop-muted)] text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-[var(--shop-muted)] rounded-2xl p-16 text-center">
            <Package size={48} className="mx-auto text-[var(--pks-ink-dim)] mb-3" />
            <p className="font-bold text-[var(--shop-ink-muted)]">ไม่มีสินค้าในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {(selectedCat === 'ทั้งหมด' ? bestSellers : filtered.slice(0, 8)).map((p) => {
              const tiers = moqTiers(p.priceTHB);
              const discount =
                p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB
                  ? Math.round(((p.compareAtPriceTHB - p.priceTHB) / p.compareAtPriceTHB) * 100)
                  : 0;
              return (
                <article
                  key={p.id}
                  className="group bg-white rounded-2xl border border-[var(--shop-border)] overflow-hidden hover:border-[var(--shop-primary)] hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <Link
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="block aspect-square bg-[var(--shop-muted)] relative overflow-hidden"
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--pks-ink-dim)]">
                        <Package size={42} />
                      </div>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-[var(--shop-primary)] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                    <span className="absolute top-2 right-2 bg-[var(--shop-accent)] text-[var(--shop-ink)] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      MOQ 50
                    </span>
                  </Link>
                  <div className="p-3.5 space-y-2">
                    {p.categoryName && (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--shop-primary)]">
                        {p.categoryName}
                      </div>
                    )}
                    <Link href={`/stores/${store.slug}/products/${p.id}`}>
                      <h3 className="font-bold text-sm line-clamp-2 leading-snug hover:text-[var(--shop-primary)] transition-colors">
                        {p.title}
                      </h3>
                    </Link>
                    {/* Mini MOQ tier preview */}
                    <div className="flex gap-1 text-[10px]">
                      {tiers.map((t, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-md px-1.5 py-1 text-center ${
                            i === 0
                              ? 'bg-[var(--shop-bg-soft)] text-[var(--shop-ink-muted)]'
                              : i === 1
                              ? 'bg-[var(--pks-yellow-soft)] text-[var(--shop-ink)]'
                              : 'bg-[var(--pks-blue-soft)] text-[var(--shop-savings)] font-bold'
                          }`}
                        >
                          <div className="font-bold">{t.qty}+</div>
                          <div className="text-[9px]">{formatTHB(t.unit)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-baseline justify-between pt-1.5 border-t border-dashed border-[var(--shop-border)]">
                      <span className="font-[family:var(--font-kanit)] font-extrabold text-lg text-[var(--shop-primary)]">
                        {formatTHB(p.priceTHB)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleAdd(p, e)}
                        className="bg-[var(--shop-primary)] hover:bg-[var(--pks-pink-deep)] text-white p-2 rounded-full transition-colors"
                        aria-label="หยิบใส่ตะกร้า"
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── B2B promise band ──────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[var(--shop-primary)] to-[var(--pks-pink-deep)] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-[family:var(--font-kanit)] font-extrabold text-2xl sm:text-3xl tracking-tight">
              สั่งของชำ ของขายส่ง · ปรึกษาฟรีก่อนสั่ง
            </h2>
            <p className="text-white/90 leading-relaxed">
              ทีมงานของเรามีประสบการณ์ในงานบรรจุภัณฑ์มากกว่า 10 ปี ยินดีให้คำปรึกษา
              เลือกขนาด ความหนา และวัสดุที่เหมาะกับสินค้าของคุณ — ส่งตัวอย่างให้ลอง
              ก่อนสั่งจริงได้
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center gap-2 bg-white text-[var(--shop-primary)] font-bold px-6 py-3 rounded-full hover:bg-[var(--shop-accent)] hover:text-[var(--shop-ink)] transition-colors"
              >
                ขอใบเสนอราคา <ArrowRight size={16} />
              </Link>
              <a
                href="tel:+6620000000"
                className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-6 py-3 rounded-full hover:bg-white hover:text-[var(--shop-primary)] transition-colors"
              >
                <Phone size={16} /> โทรเลย
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {[
              { label: 'ออเดอร์เฉลี่ย/เดือน', value: '12k+' },
              { label: 'ร้านค้าที่ไว้ใจเรา', value: '850+' },
              { label: 'แบบสินค้า', value: '420' },
              { label: 'รีออเดอร์ภายใน 7 วัน', value: '64%' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
              >
                <div className="font-[family:var(--font-kanit)] font-extrabold text-3xl">{s.value}</div>
                <div className="text-xs text-white/85 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Homepage;
