'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  RefreshCcw,
  ShieldCheck,
  Globe,
  Sparkles,
  Plus,
  ChevronRight,
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

interface LandingContent {
  heroHeadline?: string | null;
  heroSubheadline?: string | null;
  heroCtaLabel?: string | null;
  heroCtaUrl?: string | null;
  heroImageUrl?: string | null;
  brandStory?: string | null;
}

export interface NotionMartHomepageProps {
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

const DEFAULT_HEADLINE = 'เทมเพลต Notion พร้อมใช้ — เริ่มงานได้ทันที';
const DEFAULT_SUBHEAD =
  'ระบบงาน บริหารโปรเจกต์ จัดการเวลา ฐานข้อมูล CRM และอีกหลายเทมเพลตที่ดาวน์โหลดได้ทันทีหลังชำระเงิน · อัปเดตฟรีตลอดอายุไฟล์';
const DEFAULT_CTA = 'เปิดคลังเทมเพลต';

const CATEGORY_EMOJI: Record<string, string> = {
  'ระบบงาน': '✅',
  'จัดการเวลา': '⏱️',
  'CRM': '👥',
  'ฐานข้อมูล': '📊',
  'การเงิน': '💰',
  'การตลาด': '📈',
  'นักเรียน': '🎓',
  'ฟรีแลนซ์': '🧑‍💻',
  'แดชบอร์ด': '📋',
};

function emojiFor(category: string | null, idx: number): string {
  if (!category) {
    const cycle = ['📄', '🗂️', '📋', '⚙️', '📊', '🧩'];
    return cycle[idx % cycle.length];
  }
  return CATEGORY_EMOJI[category] ?? '📄';
}

export function Homepage({ store, products, categories, landingContent }: NotionMartHomepageProps) {
  const homeUrl = `/stores/${store.slug}`;
  const catalogUrl = `/stores/${store.slug}/category`;

  const headline = landingContent?.heroHeadline?.trim() || DEFAULT_HEADLINE;
  const subhead = landingContent?.heroSubheadline?.trim() || DEFAULT_SUBHEAD;
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || DEFAULT_CTA;
  const ctaUrl = landingContent?.heroCtaUrl?.trim() || catalogUrl;
  const brandStory = landingContent?.brandStory?.trim() || null;

  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const add = useCart((s) => s.add);

  const filtered = useMemo(
    () =>
      selectedCategory === 'ทั้งหมด'
        ? products
        : products.filter((p) => p.categoryName === selectedCategory),
    [products, selectedCategory],
  );

  const featured = filtered.slice(0, 4);
  const trending = filtered.slice(4, 12);

  const handleAdd = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: p.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: p.title,
      priceTHB: p.priceTHB,
      imageUrl: p.imageUrl ?? undefined,
    });
  };

  return (
    <div className="bg-white text-[#1A1A1A] font-[family:var(--font-prompt)] min-h-screen">
      <section className="px-4 sm:px-8 lg:px-16 pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-14">
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B] mb-5 font-[family:var(--font-kanit)] tracking-wide">
            <span>📚 คลังเทมเพลต</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#1A1A1A]">{store.name}</span>
          </nav>
          <div className="text-5xl sm:text-6xl mb-4 select-none" aria-hidden>📒</div>
          <h1 className="font-[family:var(--font-kanit)] font-bold text-3xl sm:text-5xl lg:text-6xl text-[#1A1A1A] leading-[1.1] tracking-tight whitespace-pre-line">
            {headline}
          </h1>
          <p className="mt-4 sm:mt-5 text-[15px] sm:text-[17px] text-[#6B6B6B] leading-relaxed max-w-2xl whitespace-pre-line">
            {subhead}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={ctaUrl} className="inline-flex items-center gap-2 bg-black hover:bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors">
              {ctaLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href={`${homeUrl}/about`} className="inline-flex items-center gap-1.5 bg-white hover:bg-[#F7F6F3] border border-[#E5E5E5] text-[#1A1A1A] text-sm font-medium px-5 py-2.5 rounded-md transition-colors">
              <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
              ทำไมต้องเลือก {store.name}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[#E5E5E5] bg-[#F7F6F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-16 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <TrustTile icon={<Download className="h-3.5 w-3.5" />} text="ดาวน์โหลดทันที" />
            <TrustTile icon={<RefreshCcw className="h-3.5 w-3.5" />} text="อัปเดตฟรีตลอดอายุไฟล์" />
            <TrustTile icon={<Globe className="h-3.5 w-3.5" />} text="รองรับภาษาไทย" />
            <TrustTile icon={<ShieldCheck className="h-3.5 w-3.5" />} text="ลิงก์ปลอดภัย 10 นาที" />
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="px-4 sm:px-8 lg:px-16 pt-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-[family:var(--font-kanit)] font-semibold text-[#6B6B6B] text-[11px] uppercase tracking-[0.12em] mb-3">เลือกตามหมวด</h2>
            <div className="flex flex-wrap gap-1.5">
              <CategoryChip label="ทั้งหมด" emoji="📚" active={selectedCategory === 'ทั้งหมด'} onClick={() => setSelectedCategory('ทั้งหมด')} count={products.length} />
              {categories.map((c) => (
                <CategoryChip key={c} label={c} emoji={CATEGORY_EMOJI[c] ?? '📄'} active={selectedCategory === c} onClick={() => setSelectedCategory(c)} count={products.filter((p) => p.categoryName === c).length} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 sm:px-8 lg:px-16 pt-8 pb-2">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-[family:var(--font-kanit)] font-bold text-xl sm:text-2xl text-[#1A1A1A]">เทมเพลตแนะนำ</h2>
              <p className="text-[12.5px] text-[#6B6B6B] mt-0.5">คัดเทมเพลตยอดนิยมไว้ให้คุณ</p>
            </div>
            <Link href={catalogUrl} className="hidden sm:inline text-[12.5px] text-[#2563EB] hover:underline underline-offset-2">ดูทั้งหมด →</Link>
          </div>
          {featured.length === 0 ? (
            <EmptyState slug={store.slug} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {featured.map((p, idx) => (
                <FeaturedCard key={p.id} product={p} storeSlug={store.slug} emoji={emojiFor(p.categoryName, idx)} onAdd={(e) => handleAdd(p, e)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {trending.length > 0 && (
        <section className="px-4 sm:px-8 lg:px-16 pt-10 pb-2">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="font-[family:var(--font-kanit)] font-bold text-xl sm:text-2xl text-[#1A1A1A]">ดาวน์โหลดยอดนิยม</h2>
                <p className="text-[12.5px] text-[#6B6B6B] mt-0.5">เทมเพลตที่คนอื่นซื้อในสัปดาห์นี้</p>
              </div>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {trending.map((p, idx) => (
                <TrendingRow key={p.id} product={p} storeSlug={store.slug} emoji={emojiFor(p.categoryName, idx + 4)} onAdd={(e) => handleAdd(p, e)} />
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="px-4 sm:px-8 lg:px-16 pt-12">
        <div className="max-w-3xl mx-auto">
          <div className="border-l-[3px] border-[#2563EB] bg-[#F7F6F3] rounded-md px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] uppercase text-[#2563EB] font-[family:var(--font-kanit)] font-semibold mb-2">เกี่ยวกับเรา</p>
            <p className="text-[14px] text-[#1A1A1A] leading-relaxed whitespace-pre-line">
              {brandStory ?? 'เราคัดเทมเพลต Notion ที่ใช้งานได้จริงในวันแรก ทุกไฟล์ทดสอบกับเวอร์ชั่นล่าสุดและรองรับภาษาไทย พร้อมคำแนะนำการตั้งค่าเป็นภาษาไทยตลอดสาย'}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-16 pt-12 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto text-center bg-[#F7F6F3] border border-[#E5E5E5] rounded-lg p-8 sm:p-12">
          <div className="text-3xl mb-3 select-none" aria-hidden>🚀</div>
          <h2 className="font-[family:var(--font-kanit)] font-bold text-2xl sm:text-3xl text-[#1A1A1A]">เริ่มสร้าง workspace ของคุณวันนี้</h2>
          <p className="mt-2 text-[14px] text-[#6B6B6B] max-w-xl mx-auto">เลือกเทมเพลตเริ่มต้น คัดลอกเข้า Notion ของคุณ และเริ่มใช้งานได้ในไม่กี่นาที</p>
          <Link href={catalogUrl} className="inline-flex items-center gap-2 mt-6 bg-black hover:bg-[#1A1A1A] text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors">
            เปิดคลังเทมเพลต
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function TrustTile({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-[#1A1A1A]">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-white border border-[#E5E5E5] text-[#2563EB] shrink-0">{icon}</span>
      <span className="leading-tight">{text}</span>
    </div>
  );
}

function CategoryChip({ label, emoji, active, onClick, count }: { label: string; emoji: string; active: boolean; onClick: () => void; count: number; }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] border transition-colors ${active ? 'bg-black text-white border-black' : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:bg-[#F7F6F3] hover:border-[#1A1A1A]'}`}>
      <span aria-hidden>{emoji}</span>
      <span>{label}</span>
      <span className={`text-[10px] tabular-nums ${active ? 'text-[#9CA3AF]' : 'text-[#6B6B6B]'}`}>{count}</span>
    </button>
  );
}

function FeaturedCard({ product, storeSlug, emoji, onAdd }: { product: Product; storeSlug: string; emoji: string; onAdd: (e: React.MouseEvent) => void; }) {
  const hasDiscount = product.compareAtPriceTHB != null && product.compareAtPriceTHB > product.priceTHB;
  return (
    <article className="bg-white border border-[#E5E5E5] rounded-md hover:border-[#1A1A1A] transition-colors flex flex-col">
      <Link href={`/stores/${storeSlug}/products/${product.id}`} className="block aspect-[4/3] bg-[#F7F6F3] border-b border-[#E5E5E5] rounded-t-md overflow-hidden relative">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" aria-hidden>{emoji}</div>
        )}
        <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white border border-[#E5E5E5] text-[#2563EB]">Notion</span>
      </Link>
      <div className="p-3 flex-1 flex flex-col gap-2">
        {product.categoryName && (
          <span className="text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-[family:var(--font-kanit)] font-medium">{product.categoryName}</span>
        )}
        <Link href={`/stores/${storeSlug}/products/${product.id}`} className="block">
          <h3 className="text-[13.5px] font-[family:var(--font-kanit)] font-semibold text-[#1A1A1A] hover:text-[#2563EB] transition-colors leading-snug line-clamp-2">{product.title}</h3>
        </Link>
        <div className="mt-auto flex items-end justify-between pt-2 border-t border-[#E5E5E5]">
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-[#1A1A1A] tabular-nums">{formatTHB(product.priceTHB)}</span>
            {hasDiscount && product.compareAtPriceTHB != null && (
              <span className="text-[11px] text-[#6B6B6B] line-through tabular-nums">{formatTHB(product.compareAtPriceTHB)}</span>
            )}
          </div>
          <button type="button" onClick={onAdd} aria-label="เพิ่มลงตะกร้า" className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#E5E5E5] text-[#1A1A1A] hover:bg-black hover:border-black hover:text-white transition-colors">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function TrendingRow({ product, storeSlug, emoji, onAdd }: { product: Product; storeSlug: string; emoji: string; onAdd: (e: React.MouseEvent) => void; }) {
  return (
    <li className="bg-white border border-[#E5E5E5] rounded-md hover:border-[#1A1A1A] transition-colors flex items-center gap-3 p-2.5">
      <Link href={`/stores/${storeSlug}/products/${product.id}`} className="block h-12 w-12 shrink-0 rounded bg-[#F7F6F3] border border-[#E5E5E5] grid place-items-center overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xl" aria-hidden>{emoji}</span>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/stores/${storeSlug}/products/${product.id}`} className="block">
          <p className="text-[12.5px] font-[family:var(--font-kanit)] font-semibold text-[#1A1A1A] hover:text-[#2563EB] transition-colors line-clamp-1">{product.title}</p>
        </Link>
        {product.categoryName && (
          <p className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.1em] mt-0.5">{product.categoryName}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] font-semibold text-[#1A1A1A] tabular-nums">{formatTHB(product.priceTHB)}</p>
      </div>
      <button type="button" onClick={onAdd} aria-label="เพิ่มลงตะกร้า" className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#E5E5E5] text-[#1A1A1A] hover:bg-black hover:border-black hover:text-white transition-colors shrink-0">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function EmptyState({ slug }: { slug: string }) {
  return (
    <div className="border border-dashed border-[#E5E5E5] rounded-md p-10 text-center bg-[#F7F6F3]">
      <p className="text-2xl mb-2" aria-hidden>📭</p>
      <p className="text-[14px] font-[family:var(--font-kanit)] font-semibold text-[#1A1A1A]">ยังไม่มีเทมเพลตในหมวดนี้</p>
      <p className="mt-1 text-[12px] text-[#6B6B6B]">ลองเลือกหมวดอื่น หรือดูทั้งคลัง</p>
      <Link href={`/stores/${slug}/category`} className="inline-flex items-center gap-1.5 mt-4 bg-black hover:bg-[#1A1A1A] text-white text-[12px] font-medium px-4 py-2 rounded transition-colors">
        เปิดคลังเทมเพลต <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
