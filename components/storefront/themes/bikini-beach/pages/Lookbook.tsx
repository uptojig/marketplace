'use client';

import React from 'react';
import { IconArrowRight, IconHeart, IconStarFilled } from '@tabler/icons-react';
import type { Product } from './Homepage';

// ============ Types ============
export interface LookbookStory {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  meta?: string;
  /** Background variant b1-b6 */
  bg?: 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6';
  /** Layout: ed-large / ed-tall / ed-half / ed-third */
  layout?: 'large' | 'tall' | 'half' | 'third';
  illustration?: React.ReactNode;
  /** Corner label e.g. "★ COVER" */
  corner?: string;
}

export interface LookbookProps {
  /** Editorial stories shown in the main grid */
  stories?: LookbookStory[];
  /** Products to render in the "Shop the Look" section */
  featuredLookProducts?: Product[];
  /** Hero copy override */
  heroTitle?: string;
  heroLead?: string;
  /** Newsletter subscribe callback */
  onSubscribe?: (email: string) => void;
  // URL prop: shop / catalog landing page
  shopUrl: string;
}

const LOOK_BG = {
  b1: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)',
  b2: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
  b3: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)',
  b4: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
  b5: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
  b6: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
};

const personSilhouette = (color: string) => (
  <svg viewBox="0 0 200 280" width="40%" aria-hidden="true">
    <ellipse cx={100} cy={50} rx={28} ry={32} fill="#FBBF77" opacity={0.9} />
    <path d="M75 35 Q100 5 125 35 L125 70 Q100 60 75 70 Z" fill="#3D332D" />
    <path d="M75 100 Q100 90 125 100 L130 130 Q120 145 100 145 Q80 145 70 130 Z" fill={color} />
    <path d="M75 165 Q100 158 125 165 L122 200 Q100 210 78 200 Z" fill={color} />
    <rect x={88} y={210} width={10} height={50} fill="#F5D5B5" />
    <rect x={102} y={210} width={10} height={50} fill="#F5D5B5" />
  </svg>
);

const DEFAULT_STORIES: LookbookStory[] = [
  { id: 's1', href: '/lookbook/pink-sands', title: 'Pink Sands Paradise', subtitle: 'เซ็ทสีพาสเทล · ผ้าโปลก้าดอท · สไตล์ Y2K ที่ฮอตที่สุดปีนี้', meta: 'VOL. 12 · MAY 2569 · 8 LOOKS', corner: '★ COVER STORY', bg: 'b1', layout: 'large', illustration: personSilhouette('#EC4899') },
  { id: 's2', href: '/lookbook/ocean-vibes', title: 'Ocean Vibes', subtitle: '5 looks · สีทะเล', meta: 'JUNE EDITORIAL', bg: 'b2', layout: 'tall', illustration: personSilhouette('#38BDF8') },
  { id: 's3', href: '/lookbook/sunset-hour', title: 'Sunset Hour', subtitle: '6 looks · สีพระอาทิตย์ตก', meta: 'GOLDEN HOUR', bg: 'b3', layout: 'half', illustration: personSilhouette('#FB923C') },
  { id: 's4', href: '/lookbook/lavender-dream', title: 'Lavender Dream', subtitle: '4 looks · พาสเทลม่วง', meta: 'SPRING DROP', bg: 'b4', layout: 'half', illustration: personSilhouette('#A855F7') },
  { id: 's5', href: '/lookbook/golden-glow', title: 'Golden Glow', subtitle: '7 looks · ทองอร่าม', meta: 'SUMMER VIP', bg: 'b5', layout: 'third', illustration: personSilhouette('#FACC15') },
  { id: 's6', href: '/lookbook/emerald-escape', title: 'Emerald Escape', subtitle: '5 looks · เขียวมรกต', meta: 'TROPICAL', bg: 'b6', layout: 'third', illustration: personSilhouette('#10B981') },
];

const tinyBikini = (color: string) => (
  <svg viewBox="0 0 200 250" width="60%" aria-hidden="true">
    <path d="M40 60 Q70 45 100 60 L105 100 Q80 115 50 105 Z" fill={color} />
    <path d="M100 60 Q130 45 160 60 L155 100 Q125 115 100 100 Z" fill={color} />
    <path d="M50 140 Q100 132 150 140 L145 200 Q100 210 55 200 Z" fill={color} />
  </svg>
);

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', slug: 'polka-pink-triangle', name: 'Polka Pink · Triangle Set', price: 890, was: 1290, rating: 4.9, colors: ['#EC4899'], tag: 'hot', tagLabel: 'BESTSELLER', bgVariant: 'bg-rose', illustration: tinyBikini('#EC4899') },
  { id: 'p2', slug: 'ocean-blue', name: 'Ocean Blue · Bandeau', price: 1290, rating: 4.8, colors: ['#38BDF8'], tag: 'new', tagLabel: 'NEW', bgVariant: 'bg-sky', illustration: tinyBikini('#38BDF8') },
  { id: 'p3', slug: 'sunset-gold', name: 'Sunset Gold · Tankini', price: 1190, was: 1990, rating: 4.7, colors: ['#F59E0B'], tag: 'sale', tagLabel: '−40%', bgVariant: 'bg-yellow', illustration: tinyBikini('#F59E0B') },
  { id: 'p4', slug: 'coral-wave', name: 'Coral Wave · Cutout', price: 1490, rating: 5.0, colors: ['#FB923C'], bgVariant: 'bg-orange', illustration: tinyBikini('#FB923C') },
];

// ============ Component ============
export function Lookbook({
  stories = DEFAULT_STORIES,
  featuredLookProducts = DEFAULT_PRODUCTS,
  heroTitle = 'Summer 2026',
  heroLead = 'Stories from the shore · 6 editorial collections · pieces for every moment in the sun',
  onSubscribe,
  shopUrl,
}: LookbookProps) {
  const [email, setEmail] = React.useState('');

  const layoutClass = (layout?: LookbookStory['layout']) => {
    switch (layout) {
      case 'large': return 'bk-ed-large';
      case 'tall': return 'bk-ed-tall';
      case 'half': return 'bk-ed-half';
      case 'third': return 'bk-ed-third';
      default: return 'bk-ed-third';
    }
  };

  return (
    <main>
      {/* HERO */}
      <section className="bk-lookbook-hero">
        <div className="bk-container">
          <span className="bk-kicker" style={{ marginBottom: 20 }}>★ LOOKBOOK · VOL. 12</span>
          <h1>
            <span className="bk-grad-sky">{heroTitle.split(' ')[0]}</span>{' '}
            <span className="bk-grad-coral">{heroTitle.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="lead">{heroLead}</p>
        </div>
      </section>

      {/* EDITORIAL GRID */}
      <section style={{ padding: '24px 0' }}>
        <div className="bk-container">
          <div className="bk-ed-grid">
            {stories.map((s) => (
              <a key={s.id} className={`bk-ed-card ${layoutClass(s.layout)}`} href={s.href}>
                <div className="bk-ed-bg" style={{ background: LOOK_BG[s.bg ?? 'b1'] }}>
                  {s.illustration}
                </div>
                {s.corner && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      background: 'rgba(255,255,255,0.95)',
                      padding: '6px 14px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                      color: 'var(--shop-primary)',
                      letterSpacing: 1,
                    }}
                  >
                    {s.corner}
                  </span>
                )}
                <div className="bk-ed-overlay">
                  {s.meta && (
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: 2,
                        fontWeight: 800,
                        opacity: 0.9,
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      {s.meta}
                    </span>
                  )}
                  <h3>{s.title}</h3>
                  {s.subtitle && <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: 600 }}>{s.subtitle}</p>}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid white', paddingBottom: 2 }}>
                    ดู Story <IconArrowRight size={12} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP THE LOOK */}
      <section className="bk-section bk-section-sand">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker">★ Shop the Look</span>
              <h2>ช้อปสไตล์ <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>เหล่านี้ได้เลย</em></h2>
            </div>
            <a className="bk-btn bk-btn-ghost bk-btn-sm" href={shopUrl}>ดูทั้งหมด <IconArrowRight size={14} /></a>
          </div>
          <div className="bk-products-grid">
            {featuredLookProducts.map((p) => (
              <a key={p.id} className="bk-pcard" href={`/shop/${p.slug}`}>
                <div className={`bk-pcard-img ${p.bgVariant ?? 'bg-rose'}`}>
                  {p.tag && (
                    <div className="bk-pcard-tags">
                      <span className={`bk-tag bk-tag-${p.tag}`}>{p.tagLabel ?? p.tag.toUpperCase()}</span>
                    </div>
                  )}
                  <button type="button" className="bk-pcard-fav" aria-label="Add to wishlist" onClick={(e) => e.preventDefault()}><IconHeart size={16} /></button>
                  {p.illustration}
                </div>
                <div className="bk-pcard-info">
                  <div className="bk-pcard-name">{p.name}</div>
                  <div className="bk-pcard-foot">
                    <div>
                      <span className="bk-price">฿{p.price.toLocaleString()}</span>
                      {p.was && <span className="bk-was">฿{p.was.toLocaleString()}</span>}
                    </div>
                    {p.rating && <div className="bk-meta"><IconStarFilled size={11} className="star" />{p.rating}</div>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-newsletter">
            <h2>Get the next issue first 📬</h2>
            <p>Subscribe เพื่อรับ Lookbook ใหม่ก่อนใคร · พร้อมส่วนลด ฿200 สำหรับสมาชิก</p>
            <form
              className="bk-newsletter-form"
              onSubmit={(e) => { e.preventDefault(); onSubscribe?.(email); }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                required
              />
              <button type="submit">รับเลย</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Lookbook;
