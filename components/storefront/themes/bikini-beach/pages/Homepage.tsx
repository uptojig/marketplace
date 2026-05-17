'use client';

import React from 'react';
import {
  IconArrowRight,
  IconPhoto,
  IconHeart,
  IconStarFilled,
  IconEye,
  IconBolt,
  IconTag,
  IconFlame,
  IconSparkles,
  IconSun,
  IconRulerMeasure,
  IconRecycle,
  IconTruckDelivery,
  IconArrowBackUp,
  IconBrandInstagram,
} from '@tabler/icons-react';

// ============ Types ============
export interface StoreInfo {
  name: string;
  tagline?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  desc?: string;
  price: number;
  was?: number;
  rating?: number;
  reviewCount?: number;
  /** Hex colors for the swatch row */
  colors?: string[];
  extraColorCount?: number;
  tag?: 'new' | 'hot' | 'sale' | 'best' | 'eco' | null;
  tagLabel?: string;
  /** One of bg-rose/bg-sky/bg-yellow/bg-orange/bg-blue/bg-green/bg-purple/bg-coral */
  bgVariant?: string;
  /** Inline SVG element (allows IP-safe placeholder illustrations) */
  illustration?: React.ReactNode;
}

export interface Category {
  id: string;
  label: string;
  href: string;
  count: number;
  topLabel?: string;
  /** Variant key for the tile color: c1-c5 */
  colorVariant?: 'c1' | 'c2' | 'c3' | 'c4' | 'c5';
  illustration?: React.ReactNode;
}

export interface LookbookEntry {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  corner?: string;
  /** Background variant b1-b5 */
  bg?: 'b1' | 'b2' | 'b3' | 'b4' | 'b5';
  big?: boolean;
  meta?: string;
}

export interface Review {
  id: string;
  author: string;
  initial: string;
  stars: number;
  title: string;
  body: string;
  meta?: string;
  verified?: boolean;
}

export interface HomepageProps {
  store?: StoreInfo;
  featuredProducts?: Product[];
  categories?: Category[];
  lookbookEntries?: LookbookEntry[];
  reviews?: Review[];
  /** Subscribed callback for newsletter form */
  onSubscribe?: (email: string) => void;
  /** Quick-add callback for product hover button */
  onQuickAdd?: (productId: string) => void;
  // URL prop: shop / catalog landing page
  shopUrl: string;
  // URL prop: lookbook editorial page
  lookbookUrl: string;
}

// ============ Default placeholder data ============
const tinyBikini = (color: string) => (
  <svg viewBox="0 0 200 250" width="55%" aria-hidden="true">
    <path d="M40 60 Q70 45 100 60 L105 100 Q80 115 50 105 Z" fill={color} />
    <path d="M100 60 Q130 45 160 60 L155 100 Q125 115 100 100 Z" fill={color} />
    <path d="M50 140 Q100 132 150 140 L145 200 Q100 210 55 200 Z" fill={color} />
  </svg>
);
const tinyOnePiece = (color: string) => (
  <svg viewBox="0 0 200 250" width="50%" aria-hidden="true">
    <path d="M55 30 Q100 22 145 30 L148 95 Q145 145 130 195 Q115 218 100 222 Q85 218 70 195 Q55 145 52 95 Z" fill={color} />
  </svg>
);

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'bikini', label: 'BIKINI', href: '/shop?cat=bikini', count: 120, topLabel: '★ TRENDING', colorVariant: 'c1', illustration: tinyBikini('#EC4899') },
  { id: 'one-piece', label: 'ONE-PIECE', href: '/shop?cat=one-piece', count: 68, topLabel: '★ CLASSIC', colorVariant: 'c2', illustration: tinyOnePiece('#38BDF8') },
  { id: 'tankini', label: 'TANKINI', href: '/shop?cat=tankini', count: 42, topLabel: '★ NEW', colorVariant: 'c3', illustration: tinyBikini('#F59E0B') },
  { id: 'cover-up', label: 'COVER-UP', href: '/shop?cat=cover-up', count: 35, topLabel: '★ MUST-HAVE', colorVariant: 'c4', illustration: tinyOnePiece('#FB923C') },
  { id: 'accessories', label: 'ACCESSORIES', href: '/shop?cat=accessories', count: 88, topLabel: '★ ESSENTIALS', colorVariant: 'c5' },
];

const TILE_COLORS = {
  c1: 'linear-gradient(160deg, #FDF2F8 0%, #FCE7F3 100%)',
  c2: 'linear-gradient(160deg, #F0F9FF 0%, #E0F2FE 100%)',
  c3: 'linear-gradient(160deg, #FEF3C7 0%, #FDE68A 100%)',
  c4: 'linear-gradient(160deg, #FED7AA 0%, #FDBA74 100%)',
  c5: 'linear-gradient(160deg, #DBEAFE 0%, #BFDBFE 100%)',
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', slug: 'polka-pink-triangle', name: 'Polka Pink · Triangle Bikini Set', desc: 'ผ้ายืด · มี Padding · ปรับสายได้', price: 890, was: 1290, rating: 4.9, reviewCount: 248, colors: ['#EC4899', '#38BDF8', '#FACC15'], extraColorCount: 3, tag: 'hot', tagLabel: 'BESTSELLER', bgVariant: 'bg-rose', illustration: tinyBikini('#EC4899') },
  { id: 'p2', slug: 'ocean-blue-bandeau', name: 'Ocean Blue · Bandeau Two-Piece', desc: 'สายถอดได้ · มี Push-up · ผ้านุ่ม', price: 1290, rating: 4.8, reviewCount: 162, colors: ['#38BDF8', '#0F172A', '#7C3AED'], tag: 'new', tagLabel: 'NEW DROP', bgVariant: 'bg-sky', illustration: tinyBikini('#38BDF8') },
  { id: 'p3', slug: 'sunset-gold-tankini', name: 'Sunset Gold · Tankini Eco-Set', desc: 'ผ้ารีไซเคิล · ปิดเอว · ใส่สบาย', price: 1190, was: 1990, rating: 4.7, reviewCount: 98, colors: ['#F59E0B', '#10B981'], tag: 'sale', tagLabel: '−40%', bgVariant: 'bg-yellow', illustration: tinyBikini('#F59E0B') },
  { id: 'p4', slug: 'coral-wave-cutout', name: 'Coral Wave · Cutout One-Piece', desc: 'เปิดหลัง · ปรับสายได้ · ผ้านุ่ม', price: 1490, was: 1890, rating: 5.0, reviewCount: 312, colors: ['#FB923C', '#EC4899', '#1E40AF'], tag: 'best', tagLabel: '★ TOP RATED', bgVariant: 'bg-orange', illustration: tinyOnePiece('#FB923C') },
  { id: 'p5', slug: 'tropical-bloom', name: 'Tropical Bloom · Halter Bikini', desc: 'ลายดอกไม้ · สายผูกคอ · เซ็กซี่', price: 1090, rating: 4.9, reviewCount: 87, colors: ['#3B82F6', '#10B981', '#FB923C'], tag: 'new', tagLabel: 'NEW', bgVariant: 'bg-blue', illustration: tinyBikini('#3B82F6') },
  { id: 'p6', slug: 'emerald-lush', name: 'Emerald Lush · Sporty Bikini', desc: 'ฟิตเซ็กซี่ · ใส่ออกกำลังกาย', price: 790, was: 1150, rating: 4.8, reviewCount: 124, colors: ['#10B981', '#7C3AED', '#0F172A'], tag: 'sale', tagLabel: '−30%', bgVariant: 'bg-green', illustration: tinyBikini('#10B981') },
  { id: 'p7', slug: 'lavender-dream', name: 'Lavender Dream · Strappy Set', desc: 'สายแคบ · เซ็กซี่ · มี Padding', price: 1190, rating: 4.7, reviewCount: 76, colors: ['#A855F7', '#EC4899'], tag: 'hot', tagLabel: 'TRENDING', bgVariant: 'bg-purple', illustration: tinyBikini('#A855F7') },
  { id: 'p8', slug: 'crimson-curve', name: 'Crimson Curve · Cutout Maillot', desc: 'เปิดข้าง · ผ้านุ่ม · ดีไซน์เด่น', price: 1690, was: 2290, rating: 4.9, reviewCount: 143, colors: ['#F43F5E', '#0F172A', '#FACC15'], tag: 'best', tagLabel: "EDITOR'S PICK", bgVariant: 'bg-coral', illustration: tinyOnePiece('#F43F5E') },
];

const DEFAULT_LOOKBOOK: LookbookEntry[] = [
  { id: 'l1', href: '/lookbook#pink-sands', title: 'Pink Sands\nParadise', subtitle: 'เซ็ทผ้าโปลก้าดอท · สไตล์ Y2K · ฮาวายเวอร์ทรอป', corner: '★ COVER LOOK', bg: 'b1', big: true, meta: 'VOL. 12 · MAY 2569' },
  { id: 'l2', href: '/lookbook#ocean', title: 'Ocean Vibes', subtitle: '5 looks', bg: 'b2' },
  { id: 'l3', href: '/lookbook#sunset', title: 'Sunset Hour', subtitle: '6 looks', bg: 'b3' },
  { id: 'l4', href: '/lookbook#lavender', title: 'Lavender Dream', subtitle: '4 looks', bg: 'b4' },
  { id: 'l5', href: '/lookbook#golden', title: 'Golden Glow', subtitle: '7 looks', bg: 'b5' },
];

const LOOK_BG = {
  b1: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)',
  b2: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
  b3: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)',
  b4: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
  b5: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
};

const DEFAULT_REVIEWS: Review[] = [
  { id: 'r1', author: 'นภัส ม.', initial: 'น', stars: 5, title: '"คุ้มเกินราคา · ผ้าดีจริง"', body: '"ซื้อมา 3 เซ็ทแล้ว ผ้านุ่ม ใส่สบาย ไซส์ตรงปก · ลายดอทน่ารักมาก ส่งเร็วด้วย ห่อมาแบบ discreet ลับสุดๆ"', meta: 'Polka Pink · Size M', verified: true },
  { id: 'r2', author: 'กัญญา ส.', initial: 'ก', stars: 5, title: '"ใส่ถ่ายรูปสวยมาก!"', body: '"ซื้อใส่ไปเที่ยวภูเก็ต ถ่ายรูปออกมาสวยมาก สีไม่ตก ไม่ขึ้นยาน · size guide ละเอียดดี · เลือกง่าย"', meta: 'Ocean Blue · Size L', verified: true },
  { id: 'r3', author: 'ภัสรา พ.', initial: 'ภ', stars: 5, title: '"ดีไซน์เด่นมาก ราคาน่ารัก"', body: '"ดีไซน์ไม่เหมือนใคร · ใส่แล้วมั่นใจ · เปิดหลังกำลังดี · 14 วันคืนได้สบายใจมาก แนะนำสำหรับสาวๆ ที่ลังเล"', meta: 'Coral Wave · Size S', verified: true },
];

// ============ Component ============
export function Homepage({
  store = { name: 'BIKINI551', tagline: 'Summer Looks Good on You' },
  featuredProducts = DEFAULT_PRODUCTS,
  categories = DEFAULT_CATEGORIES,
  lookbookEntries = DEFAULT_LOOKBOOK,
  reviews = DEFAULT_REVIEWS,
  onSubscribe,
  onQuickAdd,
  shopUrl,
  lookbookUrl,
}: HomepageProps) {
  const [email, setEmail] = React.useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubscribe?.(email);
  };

  return (
    <main>
      {/* HERO */}
      <section className="bk-hero">
        <div className="bk-container">
          <div className="bk-hero-inner">
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
                <span className="bk-pill bk-pill-coral"><IconSparkles size={13} /> SUMMER 2026 DROP</span>
                <span className="bk-pill bk-pill-sky"><IconSun size={13} /> NEW THIS WEEK</span>
              </div>
              <h1>
                <span className="bk-grad-sky">Summer</span>
                <br />
                <span className="bk-grad-coral">Looks Good</span>
                <br />
                on You ☀️
              </h1>
              <p className="lead">{store.tagline ?? 'บีกีนี่ & ชุดว่ายน้ำดีไซน์เด่น สำหรับผู้หญิงเอเชีย ทุก body shape · ผ้าคุณภาพ ส่งเร็ว · ลดสูงสุด 50% ทั้งเว็บ'}</p>
              <div className="bk-hero-ctas">
                <a className="bk-btn bk-btn-primary bk-btn-lg" href={shopUrl}>ช้อปคอลเลคชั่น <IconArrowRight size={18} /></a>
                <a className="bk-btn bk-btn-secondary bk-btn-lg" href={lookbookUrl}><IconPhoto size={18} /> ดู Lookbook</a>
              </div>
              <div className="bk-hero-stats">
                <div className="bk-hero-stat"><div className="num">200+</div><div className="lbl">SWIMWEAR STYLES</div></div>
                <div className="bk-hero-stat"><div className="num">4.9★</div><div className="lbl">12K+ REVIEWS</div></div>
                <div className="bk-hero-stat"><div className="num">14</div><div className="lbl">DAYS FREE RETURN</div></div>
              </div>
            </div>

            <div className="bk-hero-visual">
              <div className="bk-hero-card">
                <svg viewBox="0 0 300 380" width="100%" aria-hidden="true">
                  <path d="M70 100 Q100 80 140 100 L150 160 Q120 180 80 170 Q60 160 60 130 Z" fill="#F472B6" stroke="#1E40AF" strokeWidth={2.5} />
                  <path d="M160 100 Q190 80 230 100 L240 130 Q240 160 220 170 Q180 180 150 160 Z" fill="#F472B6" stroke="#1E40AF" strokeWidth={2.5} />
                  <circle cx={85} cy={130} r={4} fill="white" />
                  <circle cx={105} cy={145} r={4} fill="white" />
                  <circle cx={125} cy={125} r={4} fill="white" />
                  <circle cx={180} cy={140} r={4} fill="white" />
                  <circle cx={200} cy={125} r={4} fill="white" />
                  <circle cx={220} cy={145} r={4} fill="white" />
                  <path d="M80 230 Q150 215 220 230 L210 320 Q200 335 180 330 Q150 325 120 330 Q100 335 90 320 Z" fill="#F472B6" stroke="#1E40AF" strokeWidth={2.5} />
                  <circle cx={105} cy={265} r={4} fill="white" />
                  <circle cx={150} cy={260} r={4} fill="white" />
                  <circle cx={195} cy={265} r={4} fill="white" />
                  <circle cx={155} cy={310} r={4} fill="white" />
                  <text x={45} y={155} fontSize={24} fill="#F97316">★</text>
                  <text x={255} y={200} fontSize={20} fill="#FACC15">✦</text>
                </svg>
              </div>
              <span className="bk-hero-deco" style={{ top: '10%', left: '5%', color: 'var(--bikini-orange)' }} aria-hidden="true">★</span>
              <span className="bk-hero-deco" style={{ bottom: '15%', right: '8%', color: 'var(--shop-primary)' }} aria-hidden="true">✦</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker">★ Shop by Category</span>
              <h2>ช้อปตามสไตล์</h2>
            </div>
            <a className="bk-btn bk-btn-ghost bk-btn-sm" href={shopUrl}>ดูทั้งหมด <IconArrowRight size={14} /></a>
          </div>
          <div className="bk-cat-tiles">
            {categories.map((cat) => (
              <a key={cat.id} className="bk-cat-tile" href={cat.href} style={{ background: TILE_COLORS[cat.colorVariant ?? 'c1'] }}>
                <div className="bk-cat-tile-top">{cat.topLabel ?? '★'}</div>
                <div>
                  <h3>{cat.label}</h3>
                  <div className="count">{cat.count} สไตล์</div>
                </div>
                <div className="bk-cat-visual">{cat.illustration}</div>
                <div className="arrow" aria-hidden="true"><IconArrowRight size={18} /></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* STYLE PICKER */}
      <section className="bk-section bk-section-sand">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker" style={{ color: 'var(--bikini-sky-dark)' }}>★ Find Your Vibe</span>
              <h2>เลือกสไตล์ที่ใช่</h2>
            </div>
          </div>
          <div className="bk-style-grid">
            {[
              { em: '⚪', name: 'Polka Dot', count: 28 },
              { em: '🌴', name: 'Tropical', count: 36 },
              { em: '🌸', name: 'Floral', count: 42 },
              { em: '🎀', name: 'Solid Color', count: 54 },
              { em: '🏆', name: 'Sporty', count: 22 },
              { em: '💎', name: 'Cheeky', count: 18 },
            ].map((s) => (
              <button key={s.name} type="button" className="bk-style-card">
                <span className="em" aria-hidden="true">{s.em}</span>
                <h5>{s.name}</h5>
                <div className="count">{s.count} สไตล์</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker">★ Customer Favorites</span>
              <h2>เบสต์เซลเลอร์ <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>ขายดีที่สุด</em></h2>
            </div>
            <a className="bk-btn bk-btn-ghost bk-btn-sm" href={shopUrl}>ดูทั้งหมด <IconArrowRight size={14} /></a>
          </div>
          <div className="bk-products-grid">
            {featuredProducts.map((p) => (
              <a key={p.id} className="bk-pcard" href={`/shop/${p.slug}`}>
                <div className={`bk-pcard-img ${p.bgVariant ?? 'bg-rose'}`}>
                  {p.tag && (
                    <div className="bk-pcard-tags">
                      <span className={`bk-tag bk-tag-${p.tag}`}>{p.tagLabel ?? p.tag.toUpperCase()}</span>
                    </div>
                  )}
                  <button type="button" className="bk-pcard-fav" aria-label="Add to wishlist" onClick={(e) => { e.preventDefault(); }}><IconHeart size={16} /></button>
                  {p.illustration}
                  <button type="button" className="bk-pcard-quick" onClick={(e) => { e.preventDefault(); onQuickAdd?.(p.id); }}>
                    <IconEye size={14} /> ดูสินค้า
                  </button>
                </div>
                <div className="bk-pcard-info">
                  <div className="bk-pcard-name">{p.name}</div>
                  {p.desc && <div className="bk-pcard-desc">{p.desc}</div>}
                  <div className="bk-pcard-foot">
                    <div>
                      <span className="bk-price">฿{p.price.toLocaleString()}</span>
                      {p.was && <span className="bk-was">฿{p.was.toLocaleString()}</span>}
                    </div>
                    {p.rating && (
                      <div className="bk-meta">
                        <IconStarFilled size={11} className="star" />
                        {p.rating} {p.reviewCount && `(${p.reviewCount})`}
                      </div>
                    )}
                  </div>
                  {p.colors && (
                    <div className="bk-pcard-colors">
                      {p.colors.map((c, i) => (
                        <div key={i} className="bk-pcard-color" style={{ background: c }} />
                      ))}
                      {p.extraColorCount && <div className="bk-pcard-color more">+{p.extraColorCount}</div>}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* LOOKBOOK TEASER */}
      <section className="bk-section bk-section-coral">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker">★ Summer Editorial</span>
              <h2>Lookbook <em className="bk-grad-sky" style={{ fontStyle: 'normal' }}>2026</em></h2>
            </div>
            <a className="bk-btn bk-btn-secondary bk-btn-sm" href={lookbookUrl}>ดู Lookbook <IconArrowRight size={14} /></a>
          </div>
          <div className="bk-look-grid">
            {lookbookEntries.map((l) => (
              <a key={l.id} className={`bk-look-card ${l.big ? 'big' : ''}`} href={l.href}>
                <div className="bk-look-bg" style={{ background: LOOK_BG[l.bg ?? 'b1'] }} />
                {l.corner && <span className="bk-look-corner">{l.corner}</span>}
                <div className="bk-look-overlay">
                  {l.meta && <span className="bk-kicker" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>{l.meta}</span>}
                  {l.big ? (
                    <h3>{l.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < l.title.split('\n').length - 1 && <br />}</React.Fragment>)}</h3>
                  ) : (
                    <h4>{l.title}</h4>
                  )}
                  {l.subtitle && <p className="sub">{l.subtitle}</p>}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-section-head center">
            <div>
              <span className="bk-kicker">★ The BIKINI551 Promise</span>
              <h2>เพราะคุณ <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>สมควรได้สิ่งที่ดี</em></h2>
            </div>
          </div>
          <div className="bk-features">
            {[
              { ic: <IconRulerMeasure size={26} />, title: 'Size Inclusive', body: 'XS-3XL · ดีไซน์สำหรับสรีระเอเชีย · มี Size Guide ละเอียด' },
              { ic: <IconRecycle size={26} />, title: 'Eco Fabric', body: 'ผ้ารีไซเคิล 70% · ไนลอนจากขวดพลาสติก · ลดขยะทะเล' },
              { ic: <IconTruckDelivery size={26} />, title: 'Fast Shipping', body: 'ส่งภายใน 24 ชม. · Tracking real-time · ส่งฟรี ฿890+' },
              { ic: <IconArrowBackUp size={26} />, title: 'Free Returns', body: 'เปลี่ยนไซส์ฟรี 14 วัน · ไม่ใช่ไซส์ส่งใหม่ให้ทันที' },
            ].map((f, i) => (
              <article key={i} className="bk-feature">
                <div className="ic" aria-hidden="true">{f.ic}</div>
                <h4>{f.title}</h4>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bk-section bk-section-sky">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker">★ Real Reviews</span>
              <h2>ลูกค้า <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>รักเรา</em> 🥰</h2>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--shop-primary)', letterSpacing: '-1px' }}>4.9★</div>
              <div style={{ fontSize: 12, color: 'var(--bikini-text-2)', fontWeight: 700 }}>จาก 12,400+ รีวิว</div>
            </div>
          </div>
          <div className="bk-reviews">
            {reviews.map((r) => (
              <article key={r.id} className="bk-review">
                <div className="bk-review-stars" aria-label={`${r.stars} out of 5 stars`}>{'★'.repeat(r.stars)}</div>
                <h4>{r.title}</h4>
                <p className="bk-review-text">{r.body}</p>
                <div className="bk-review-foot">
                  <div className="bk-review-avatar" aria-hidden="true">{r.initial}</div>
                  <div>
                    <div className="bk-review-name">{r.author}</div>
                    {r.meta && <div className="bk-review-meta">{r.meta}</div>}
                  </div>
                  {r.verified && <span className="bk-review-verified">✓ Verified</span>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="bk-section-tight">
        <div className="bk-container">
          <div className="bk-section-head center">
            <div>
              <span className="bk-kicker">★ #BIKINI551 on Instagram</span>
              <h2>เห็นแล้ว <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>ต้องซื้อ</em></h2>
              <p style={{ marginTop: 8, color: 'var(--bikini-text-2)', fontWeight: 600 }}>Tag @bikini551 เพื่อเป็น Featured · รับโค้ดส่วนลด ฿200</p>
            </div>
          </div>
          <div className="bk-ig-grid">
            {[
              'linear-gradient(135deg, #FCE7F3, #FBCFE8)',
              'linear-gradient(135deg, #E0F2FE, #BAE6FD)',
              'linear-gradient(135deg, #FED7AA, #FDBA74)',
              'linear-gradient(135deg, #DDD6FE, #C4B5FD)',
              'linear-gradient(135deg, #FEF3C7, #FDE68A)',
              'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
            ].map((bg, i) => (
              <a key={i} className="bk-ig-tile" href={`/lookbook#post-${i}`} style={{ background: bg }} aria-label={`Instagram post ${i + 1}`}>
                <div className="bk-ig-overlay"><IconBrandInstagram size={22} /></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-newsletter">
            <h2>ลด ฿200 รอคุณอยู่ 💌</h2>
            <p>สมัครรับข่าวสาร รับโค้ดส่วนลด ฿200 ทันที · ได้ก่อนใครเมื่อมี Drop ใหม่ &amp; Sale ลับ</p>
            <form className="bk-newsletter-form" onSubmit={submit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                required
              />
              <button type="submit">รับโค้ดเลย</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Homepage;
