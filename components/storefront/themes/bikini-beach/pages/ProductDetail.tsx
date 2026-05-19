'use client';

import React from 'react';
import {
  IconHeart,
  IconStarFilled,
  IconShoppingBag,
  IconBolt,
  IconTruck,
  IconRefresh,
  IconShieldCheck,
  IconChevronDown,
} from '@tabler/icons-react';
import type { Product, Review } from './Homepage';

// ============ Types ============
export interface ProductVariant {
  /** Hex color */
  hex: string;
  label: string;
  value: string;
}

export interface SizeOption {
  label: string;
  value: string;
  inStock: boolean;
}

export interface ProductMeasurement {
  size: string;
  bust: number;
  waist: number;
  hip: number;
}

export interface ProductDetail extends Product {
  /** Full description paragraphs */
  description?: string;
  /** Material composition string */
  material?: string;
  /** Care instructions */
  care?: string[];
  /** Color variants */
  variants?: ProductVariant[];
  /** Size options */
  sizes?: SizeOption[];
  /** Size chart rows */
  measurements?: ProductMeasurement[];
  /** Currently active color value */
  selectedColor?: string;
  /** Currently active size value */
  selectedSize?: string;
  /** Average rating */
  ratingAverage?: number;
  /** Star breakdown counts [1,2,3,4,5] */
  ratingBreakdown?: number[];
}

export interface ProductDetailProps {
  product?: ProductDetail;
  relatedProducts?: Product[];
  reviews?: Review[];
  qty?: number;
  onChangeQty?: (qty: number) => void;
  onSelectColor?: (value: string) => void;
  onSelectSize?: (value: string) => void;
  onAddToCart?: (productId: string) => void;
  onBuyNow?: (productId: string) => void;
  // URL prop: store homepage (breadcrumb root)
  homeUrl: string;
  // URL prop: shop / catalog landing page
  shopUrl: string;
}

const tinyBikini = (color: string, scale = '70%') => (
  <svg viewBox="0 0 300 380" width={scale} aria-hidden="true">
    <path d="M70 100 Q100 80 140 100 L150 160 Q120 180 80 170 Q60 160 60 130 Z" fill={color} stroke="#1E40AF" strokeWidth={2.5} />
    <path d="M160 100 Q190 80 230 100 L240 130 Q240 160 220 170 Q180 180 150 160 Z" fill={color} stroke="#1E40AF" strokeWidth={2.5} />
    <circle cx={85} cy={130} r={4} fill="white" />
    <circle cx={125} cy={125} r={4} fill="white" />
    <circle cx={200} cy={125} r={4} fill="white" />
    <path d="M80 230 Q150 215 220 230 L210 320 Q200 335 180 330 Q150 325 120 330 Q100 335 90 320 Z" fill={color} stroke="#1E40AF" strokeWidth={2.5} />
    <circle cx={150} cy={260} r={4} fill="white" />
    <circle cx={155} cy={310} r={4} fill="white" />
  </svg>
);

const DEFAULT_PRODUCT: ProductDetail = {
  id: 'polka-pink-triangle',
  slug: 'polka-pink-triangle',
  name: 'Polka Pink · Triangle Bikini Set',
  desc: 'บีกีนี่ทรง triangle ดีไซน์เก๋ ลายโปลก้าดอท · สีชมพูพาสเทล ใส่ออกมาดูสดใส',
  description: 'บีกีนี่เซ็ทดีไซน์ทรง Triangle ลายโปลก้าดอทคลาสสิก สีชมพูพาสเทลใส ผลิตจากผ้า Recycled Nylon คุณภาพสูง 80% Polyamide + 20% Spandex · ใส่สบาย ยืดหยุ่นดี ไม่อับ · มี Padding ถอดได้ ปรับสายได้ทุกจุด · เหมาะกับสาวๆ ทุก body shape · ใส่ถ่ายรูปสวย Insta-ready แน่นอน',
  price: 890,
  was: 1290,
  rating: 4.9,
  ratingAverage: 4.9,
  reviewCount: 248,
  ratingBreakdown: [2, 3, 8, 15, 220],
  bgVariant: 'bg-rose',
  tag: 'hot',
  tagLabel: 'BESTSELLER',
  material: '80% Recycled Polyamide · 20% Spandex',
  care: ['ซักด้วยมือในน้ำเย็น', 'ห้ามใช้น้ำยาฟอกขาว', 'ผึ่งให้แห้งในที่ร่ม ห้ามตากแดดจัด', 'ห้ามรีด · ห้ามซักแห้ง'],
  variants: [
    { hex: '#EC4899', label: 'Bubblegum Pink', value: 'pink' },
    { hex: '#38BDF8', label: 'Ocean Sky', value: 'sky' },
    { hex: '#FACC15', label: 'Sunshine Yellow', value: 'yellow' },
    { hex: '#10B981', label: 'Tropical Green', value: 'green' },
    { hex: '#FB923C', label: 'Sunset Orange', value: 'orange' },
  ],
  sizes: [
    { label: 'XS', value: 'XS', inStock: true },
    { label: 'S', value: 'S', inStock: true },
    { label: 'M', value: 'M', inStock: true },
    { label: 'L', value: 'L', inStock: true },
    { label: 'XL', value: 'XL', inStock: true },
    { label: '2XL', value: '2XL', inStock: false },
  ],
  measurements: [
    { size: 'XS', bust: 78, waist: 60, hip: 84 },
    { size: 'S', bust: 82, waist: 64, hip: 88 },
    { size: 'M', bust: 86, waist: 68, hip: 92 },
    { size: 'L', bust: 90, waist: 72, hip: 96 },
    { size: 'XL', bust: 94, waist: 76, hip: 100 },
    { size: '2XL', bust: 98, waist: 80, hip: 104 },
  ],
  selectedColor: 'pink',
  selectedSize: 'M',
};

const DEFAULT_RELATED: Product[] = [
  { id: 'p2', slug: 'ocean-blue', name: 'Ocean Blue · Bandeau', price: 1290, rating: 4.8, colors: ['#38BDF8'], bgVariant: 'bg-sky', illustration: <svg viewBox="0 0 200 250" width="60%"><path d="M40 60 Q70 45 100 60 L105 100 Q80 115 50 105 Z" fill="#38BDF8" /><path d="M100 60 Q130 45 160 60 L155 100 Q125 115 100 100 Z" fill="#38BDF8" /><path d="M50 140 Q100 132 150 140 L145 200 Q100 210 55 200 Z" fill="#38BDF8" /></svg> },
  { id: 'p3', slug: 'sunset-gold', name: 'Sunset Gold · Tankini', price: 1190, was: 1990, rating: 4.7, colors: ['#F59E0B'], bgVariant: 'bg-yellow', tag: 'sale', tagLabel: '−40%', illustration: <svg viewBox="0 0 200 250" width="60%"><path d="M40 60 Q70 45 100 60 L105 100 Q80 115 50 105 Z" fill="#F59E0B" /><path d="M100 60 Q130 45 160 60 L155 100 Q125 115 100 100 Z" fill="#F59E0B" /><path d="M50 140 Q100 132 150 140 L145 200 Q100 210 55 200 Z" fill="#F59E0B" /></svg> },
  { id: 'p4', slug: 'coral-wave', name: 'Coral Wave · Cutout', price: 1490, rating: 5.0, colors: ['#FB923C'], bgVariant: 'bg-orange', illustration: <svg viewBox="0 0 200 250" width="55%"><path d="M55 30 Q100 22 145 30 L148 95 Q145 145 130 195 Q115 218 100 222 Q85 218 70 195 Q55 145 52 95 Z" fill="#FB923C" /></svg> },
  { id: 'p5', slug: 'tropical-bloom', name: 'Tropical Bloom · Halter', price: 1090, rating: 4.9, colors: ['#3B82F6'], bgVariant: 'bg-blue', illustration: <svg viewBox="0 0 200 250" width="60%"><path d="M40 60 Q70 45 100 60 L105 100 Q80 115 50 105 Z" fill="#3B82F6" /><path d="M100 60 Q130 45 160 60 L155 100 Q125 115 100 100 Z" fill="#3B82F6" /><path d="M50 140 Q100 132 150 140 L145 200 Q100 210 55 200 Z" fill="#3B82F6" /></svg> },
];

const DEFAULT_REVIEWS: Review[] = [
  { id: 'r1', author: 'นภัส ม.', initial: 'น', stars: 5, title: '"ผ้าดีมาก ใส่สบาย"', body: 'ซื้อมา 3 สีแล้ว ผ้านุ่ม ใส่ไม่อับ ลายโปลก้าน่ารักมาก ส่งเร็ว ห่อมาดี', meta: 'Pink · Size M · 28.04.2569', verified: true },
  { id: 'r2', author: 'กัญญา ส.', initial: 'ก', stars: 5, title: '"ขอบคุณ size guide ที่ละเอียดมาก"', body: 'เลือกไซส์ง่ายมาก ใส่พอดี ไม่ต้องเปลี่ยน · ลายโปลก้าน่ารัก สีไม่ตก', meta: 'Pink · Size L · 22.04.2569', verified: true },
  { id: 'r3', author: 'ภัสรา พ.', initial: 'ภ', stars: 4, title: '"คุ้มราคา แต่อยากให้มีสีดำ"', body: 'โดยรวมดี ผ้านุ่ม ใส่สบาย ฟิตทรงดี แต่อยากให้มีสีดำเพิ่มด้วย', meta: 'Sky · Size S · 18.04.2569', verified: true },
];

// ============ Component ============
export function ProductDetail({
  product = DEFAULT_PRODUCT,
  relatedProducts = DEFAULT_RELATED,
  reviews = DEFAULT_REVIEWS,
  qty = 1,
  onChangeQty,
  onSelectColor,
  onSelectSize,
  onAddToCart,
  onBuyNow,
  homeUrl,
  shopUrl,
}: ProductDetailProps) {
  const totalReviews = product.ratingBreakdown?.reduce((a, b) => a + b, 0) ?? product.reviewCount ?? 0;

  return (
    <main>
      {/* BREADCRUMB */}
      <div className="bk-container">
        <nav className="bk-crumb" aria-label="Breadcrumb">
          <a href={homeUrl}>Home</a>
          <span>/</span>
          <a href={shopUrl}>Shop</a>
          <span>/</span>
          <a href={`${shopUrl}?cat=bikini`}>Bikini</a>
          <span>/</span>
          <span className="current">{product.name}</span>
        </nav>
      </div>

      <div className="bk-container">
        <div className="bk-pdetail">
          {/* GALLERY */}
          <div className="bk-gallery">
            <div className="bk-thumbs" aria-label="Product images">
              {[0, 1, 2, 3, 4].map((i) => (
                <button key={i} type="button" className={`bk-thumb ${i === 0 ? 'active' : ''} ${product.bgVariant ?? 'bg-rose'}`} aria-label={`View image ${i + 1}`}>
                  {tinyBikini(product.variants?.[0]?.hex ?? '#EC4899', '70%')}
                </button>
              ))}
            </div>
            <div className={`bk-main-img ${product.bgVariant ?? 'bg-rose'}`}>
              {tinyBikini(product.variants?.[0]?.hex ?? '#EC4899', '70%')}
            </div>
          </div>

          {/* INFO */}
          <div>
            <div className="bk-pi-meta">
              {product.tag && <span className={`bk-tag bk-tag-${product.tag}`}>{product.tagLabel ?? '★ BESTSELLER'}</span>}
              <span className="bk-pill bk-pill-sky">★ SUMMER 2026 DROP</span>
            </div>
            <h1 className="bk-pi-h1">{product.name}</h1>
            {product.desc && <p style={{ marginBottom: 16, color: 'var(--bikini-text-2)' }}>{product.desc}</p>}

            <div className="bk-pi-stars">
              <span className="stars" aria-hidden="true">{'★'.repeat(Math.round(product.ratingAverage ?? 5))}</span>
              <b>{product.ratingAverage ?? '4.9'}</b>
              <span style={{ color: 'var(--bikini-muted)' }}>({totalReviews.toLocaleString()} รีวิว)</span>
              <span style={{ color: 'var(--shop-primary)', fontWeight: 800 }}>· ขายแล้ว 1,420+ ชิ้น</span>
            </div>

            <div className="bk-pi-price">
              <span className="now">฿{product.price.toLocaleString()}</span>
              {product.was && (
                <>
                  <span className="was">฿{product.was.toLocaleString()}</span>
                  <span className="bk-save-badge">ประหยัด ฿{(product.was - product.price).toLocaleString()}</span>
                </>
              )}
            </div>
            <p style={{ marginBottom: 20, fontSize: 13, color: 'var(--bikini-text-2)' }}>
              หรือผ่อน <b style={{ color: 'var(--shop-ink)' }}>0% นาน 3 เดือน</b> · ตั้งแต่ ฿{Math.round(product.price / 3).toLocaleString()}/เดือน
            </p>

            {/* COLOR VARIANTS */}
            {product.variants && (
              <div className="bk-variant">
                <div className="bk-variant-label">
                  <span>COLOR · <span className="selected">{product.variants.find(v => v.value === product.selectedColor)?.label ?? product.variants[0].label}</span></span>
                  <span style={{ color: 'var(--bikini-text-2)' }}>{product.variants.length} สี</span>
                </div>
                <div className="bk-color-opts">
                  {product.variants.map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      className={`bk-color-opt${v.value === product.selectedColor ? ' active' : ''}`}
                      style={{ background: v.hex }}
                      aria-label={`Color: ${v.label}`}
                      aria-pressed={v.value === product.selectedColor}
                      onClick={() => onSelectColor?.(v.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SIZE OPTIONS */}
            {product.sizes && (
              <div className="bk-variant">
                <div className="bk-variant-label">
                  <span>SIZE · <span className="selected">{product.selectedSize ?? 'เลือกไซส์'}</span></span>
                  <a href="#size-guide" style={{ fontSize: 11, color: 'var(--shop-primary)', fontWeight: 800 }}>📏 SIZE GUIDE ↗</a>
                </div>
                <div className="bk-size-opts">
                  {product.sizes.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      disabled={!s.inStock}
                      className={`bk-size-opt${s.value === product.selectedSize ? ' active' : ''}${!s.inStock ? ' oos' : ''}`}
                      aria-pressed={s.value === product.selectedSize}
                      aria-label={`Size ${s.label}${!s.inStock ? ' out of stock' : ''}`}
                      onClick={() => s.inStock && onSelectSize?.(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QTY */}
            <div className="bk-qty-row">
              <div className="bk-qty" role="group" aria-label="Quantity">
                <button type="button" onClick={() => onChangeQty?.(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) => onChangeQty?.(parseInt(e.target.value, 10) || 1)}
                  aria-label="Quantity"
                />
                <button type="button" onClick={() => onChangeQty?.(qty + 1)} aria-label="Increase quantity">+</button>
              </div>
              <span style={{ fontSize: 12, color: '#10B981', fontWeight: 800 }}>✓ สินค้าพร้อมส่ง · ส่งภายใน 24 ชม.</span>
            </div>

            {/* CTAs */}
            <div className="bk-pdetail-ctas">
              <button type="button" className="bk-btn bk-btn-secondary bk-btn-lg" onClick={() => onAddToCart?.(product.id)}>
                <IconShoppingBag size={18} /> Add to Cart
              </button>
              <button type="button" className="bk-btn bk-btn-primary bk-btn-lg" onClick={() => onBuyNow?.(product.id)}>
                <IconBolt size={18} /> Buy Now
              </button>
            </div>

            {/* TRUST */}
            <div className="bk-trust" role="list" aria-label="Trust signals">
              <div className="item" role="listitem">
                <IconTruck size={18} color="var(--shop-primary)" />
                <div><b>ส่งฟรี ฿890+</b>ส่งภายใน 24 ชม.</div>
              </div>
              <div className="item" role="listitem">
                <IconRefresh size={18} color="var(--shop-primary)" />
                <div><b>เปลี่ยนไซส์ฟรี</b>ภายใน 14 วัน</div>
              </div>
              <div className="item" role="listitem">
                <IconShieldCheck size={18} color="var(--shop-primary)" />
                <div><b>Discreet Box</b>ห่อแบบส่วนตัว</div>
              </div>
            </div>

            {/* ACCORDION */}
            <div className="bk-acc">
              <details className="bk-acc-item" open>
                <summary>
                  รายละเอียดสินค้า
                  <IconChevronDown size={18} />
                </summary>
                <div className="bk-acc-body">
                  <p>{product.description}</p>
                </div>
              </details>

              <details className="bk-acc-item">
                <summary>
                  ผ้า &amp; การดูแลรักษา
                  <IconChevronDown size={18} />
                </summary>
                <div className="bk-acc-body">
                  <p style={{ marginBottom: 8 }}><b>วัสดุ:</b> {product.material}</p>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {product.care?.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </details>

              <details className="bk-acc-item" id="size-guide">
                <summary>
                  ตาราง Size &amp; Fit
                  <IconChevronDown size={18} />
                </summary>
                <div className="bk-acc-body">
                  <table className="bk-size-table">
                    <thead>
                      <tr><th>Size</th><th>Bust (cm)</th><th>Waist (cm)</th><th>Hip (cm)</th></tr>
                    </thead>
                    <tbody>
                      {product.measurements?.map((m) => (
                        <tr key={m.size}><td>{m.size}</td><td>{m.bust}</td><td>{m.waist}</td><td>{m.hip}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ marginTop: 12 }}>* แนะนำเลือกตาม Bust + Hip ที่วัดจริง · ถ้าระหว่างไซส์ แนะนำเลือกใหญ่กว่า</p>
                </div>
              </details>

              <details className="bk-acc-item">
                <summary>
                  การจัดส่ง &amp; การคืนสินค้า
                  <IconChevronDown size={18} />
                </summary>
                <div className="bk-acc-body">
                  <p><b>การจัดส่ง:</b> ส่งฟรี ฿890+ · Kerry / Flash Express ภายใน 1-3 วัน (กทม.) · 2-5 วัน (ตจว.) · มี tracking real-time</p>
                  <p style={{ marginTop: 8 }}><b>การคืน/เปลี่ยน:</b> เปลี่ยนไซส์ฟรี 14 วัน · คืนเงิน 7 วัน · สินค้าต้องไม่ผ่านการใช้งาน Hygiene seal ติดอยู่</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <section className="bk-section bk-section-sand">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker">★ Customer Reviews</span>
              <h2>รีวิว <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>{totalReviews.toLocaleString()} คน</em></h2>
            </div>
            <button type="button" className="bk-btn bk-btn-primary bk-btn-sm">✍️ เขียนรีวิว</button>
          </div>

          {/* Summary */}
          <div className="bk-summary" style={{ position: 'static', padding: 32, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 40, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--shop-primary)', letterSpacing: '-2px', lineHeight: 1 }}>{product.ratingAverage ?? '4.9'}</div>
                <div style={{ color: 'var(--bikini-yellow)', fontSize: 18, letterSpacing: 2, margin: '8px 0' }}>★★★★★</div>
                <div style={{ fontSize: 11, color: 'var(--bikini-muted)', fontWeight: 700, letterSpacing: 1 }}>FROM {totalReviews.toLocaleString()} REVIEWS</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = product.ratingBreakdown?.[stars - 1] ?? 0;
                  const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                  return (
                    <div key={stars} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12 }}>
                      <span style={{ width: 28, fontWeight: 800 }}>{stars}★</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--shop-border)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--bikini-grad-coral)', width: `${pct}%`, borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--bikini-muted)', width: 44, textAlign: 'right', fontWeight: 700 }}>{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review list */}
          <div className="bk-reviews">
            {reviews.map((r) => (
              <article key={r.id} className="bk-review">
                <div className="bk-review-stars" aria-label={`${r.stars} stars`}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
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

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button type="button" className="bk-btn bk-btn-secondary">ดูรีวิวทั้งหมด ({totalReviews}) →</button>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-section-head">
            <div>
              <span className="bk-kicker">★ You May Also Love</span>
              <h2>คุณอาจจะ <em className="bk-grad-coral" style={{ fontStyle: 'normal' }}>ชอบเหล่านี้</em></h2>
            </div>
          </div>
          <div className="bk-products-grid">
            {relatedProducts.map((p) => (
              <a key={p.id} className="bk-pcard" href={`/shop/${p.slug}`}>
                <div className={`bk-pcard-img ${p.bgVariant ?? 'bg-rose'}`}>
                  {p.tag && <div className="bk-pcard-tags"><span className={`bk-tag bk-tag-${p.tag}`}>{p.tagLabel ?? p.tag.toUpperCase()}</span></div>}
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
    </main>
  );
}

export default ProductDetail;
