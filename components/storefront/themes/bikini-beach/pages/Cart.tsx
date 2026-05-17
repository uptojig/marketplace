'use client';

import React, { useState } from 'react';
import {
  IconArrowRight,
  IconTrash,
  IconTruck,
  IconShieldCheck,
  IconRefresh,
  IconTag,
  IconArrowLeft,
} from '@tabler/icons-react';

// ============ Types ============
export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  /** Selected variant text e.g. "Pink · M" */
  variant: string;
  price: number;
  was?: number;
  qty: number;
  /** Hex color for swatch */
  colorHex?: string;
  /** Background variant key */
  bgVariant?: string;
  illustration?: React.ReactNode;
  /** Per-item promo applied */
  discount?: number;
}

export interface CartProps {
  items?: CartItem[];
  freeShippingThreshold?: number;
  currentSubtotal?: number;
  /** Shipping fee shown in summary when below threshold */
  shippingFee?: number;
  /** Applied promo code state */
  promoApplied?: { code: string; amount: number } | null;
  onUpdateQty?: (itemId: string, qty: number) => void;
  onRemove?: (itemId: string) => void;
  onApplyPromo?: (code: string) => void;
  onCheckout?: () => void;
  // URL prop: shop / catalog landing page (continue shopping link)
  shopUrl: string;
}

const tinyBikini = (color: string) => (
  <svg viewBox="0 0 200 250" width="80%" aria-hidden="true">
    <path d="M40 60 Q70 45 100 60 L105 100 Q80 115 50 105 Z" fill={color} />
    <path d="M100 60 Q130 45 160 60 L155 100 Q125 115 100 100 Z" fill={color} />
    <path d="M50 140 Q100 132 150 140 L145 200 Q100 210 55 200 Z" fill={color} />
  </svg>
);

const DEFAULT_ITEMS: CartItem[] = [
  { id: 'i1', productId: 'p1', slug: 'polka-pink-triangle', name: 'Polka Pink · Triangle Bikini Set', variant: 'Bubblegum Pink · Size M', price: 890, was: 1290, qty: 1, colorHex: '#EC4899', bgVariant: 'bg-rose', illustration: tinyBikini('#EC4899') },
  { id: 'i2', productId: 'p2', slug: 'ocean-blue', name: 'Ocean Blue · Bandeau Two-Piece', variant: 'Ocean Sky · Size S', price: 1290, qty: 1, colorHex: '#38BDF8', bgVariant: 'bg-sky', illustration: tinyBikini('#38BDF8') },
  { id: 'i3', productId: 'p3', slug: 'sunset-gold', name: 'Sunset Gold · Tankini Eco-Set', variant: 'Tropical Green · Size L', price: 1190, was: 1990, qty: 2, colorHex: '#10B981', bgVariant: 'bg-green', illustration: tinyBikini('#10B981') },
];

// ============ Component ============
export function Cart({
  items = DEFAULT_ITEMS,
  freeShippingThreshold = 890,
  currentSubtotal,
  shippingFee = 60,
  promoApplied = { code: 'WELCOME200', amount: 200 },
  onUpdateQty,
  onRemove,
  onApplyPromo,
  onCheckout,
  shopUrl,
}: CartProps) {
  const [promo, setPromo] = useState('');

  const subtotal = currentSubtotal ?? items.reduce((s, i) => s + i.price * i.qty, 0);
  const savings = items.reduce((s, i) => (i.was ? s + (i.was - i.price) * i.qty : s), 0);
  const promoAmount = promoApplied?.amount ?? 0;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal - promoAmount + shipping;
  const progressPct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <main>
      {/* HEADING */}
      <div className="bk-container" style={{ padding: '40px 24px 16px' }}>
        <h1 style={{ marginBottom: 8 }}>🛍️ Shopping Bag</h1>
        <p style={{ color: 'var(--bikini-text-2)', fontWeight: 600 }}>
          คุณมี <b style={{ color: 'var(--shop-primary)' }}>{items.length}</b> สินค้าในตะกร้า · พร้อมเช็คเอาท์
        </p>
      </div>

      <div className="bk-container">
        <div className="bk-cart">
          {/* ITEMS */}
          <div className="bk-cart-items">
            {/* Progress */}
            <div className="bk-cart-progress" role="status" aria-live="polite">
              <div className="lbl">
                {shipping > 0 ? (
                  <>เพิ่มอีก <b style={{ color: 'var(--shop-primary)' }}>฿{(freeShippingThreshold - subtotal).toLocaleString()}</b> รับส่งฟรี! 🚚</>
                ) : (
                  <>✨ คุณได้รับ <b style={{ color: 'var(--shop-primary)' }}>ส่งฟรี</b> แล้ว!</>
                )}
              </div>
              <div className="bar"><div className="bar-fill" style={{ width: `${progressPct}%` }} /></div>
            </div>

            {/* Rows */}
            {items.map((item) => (
              <div key={item.id} className="bk-cart-row">
                <div className={`bk-cart-img ${item.bgVariant ?? 'bg-rose'}`}>
                  {item.illustration ?? tinyBikini(item.colorHex ?? '#EC4899')}
                </div>
                <div className="bk-cart-info">
                  <div className="name">{item.name}</div>
                  <div className="variant">{item.variant}</div>
                  {item.was && (
                    <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      ✓ ประหยัด ฿{((item.was - item.price) * item.qty).toLocaleString()}
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>฿{item.price.toLocaleString()}</span>
                  {item.was && <span style={{ display: 'block', fontSize: 12, color: 'var(--bikini-muted)', textDecoration: 'line-through' }}>฿{item.was.toLocaleString()}</span>}
                </div>
                <div className="bk-qty" role="group" aria-label={`Quantity for ${item.name}`}>
                  <button type="button" onClick={() => onUpdateQty?.(item.id, Math.max(1, item.qty - 1))} aria-label="Decrease">−</button>
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => onUpdateQty?.(item.id, parseInt(e.target.value, 10) || 1)}
                    aria-label="Quantity"
                  />
                  <button type="button" onClick={() => onUpdateQty?.(item.id, item.qty + 1)} aria-label="Increase">+</button>
                </div>
                <div className="bk-cart-subtotal">฿{(item.price * item.qty).toLocaleString()}</div>
                <button
                  type="button"
                  className="bk-cart-remove"
                  onClick={() => onRemove?.(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  <IconTrash size={18} />
                </button>
              </div>
            ))}

            {/* Continue shopping */}
            <div style={{ padding: 22, borderTop: '1px solid var(--shop-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <a href={shopUrl} className="bk-btn bk-btn-ghost bk-btn-sm">
                <IconArrowLeft size={14} /> ช้อปต่อ
              </a>
              {savings > 0 && (
                <div style={{ background: 'var(--bikini-coral-pale)', padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 800, color: 'var(--shop-primary)' }}>
                  💰 คุณประหยัด ฿{savings.toLocaleString()} จากราคาเต็ม
                </div>
              )}
            </div>
          </div>

          {/* SUMMARY */}
          <aside className="bk-summary" aria-label="Order summary">
            <h4>📋 สรุปคำสั่งซื้อ</h4>

            <div className="bk-summary-row">
              <span>Subtotal ({items.length} ชิ้น)</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            {savings > 0 && (
              <div className="bk-summary-row discount">
                <span>ส่วนลด</span>
                <span>− ฿{savings.toLocaleString()}</span>
              </div>
            )}
            <div className="bk-summary-row">
              <span>ค่าจัดส่ง</span>
              <span style={shipping === 0 ? { color: '#10B981', fontWeight: 800 } : undefined}>
                {shipping === 0 ? '🎁 ฟรี' : `฿${shipping}`}
              </span>
            </div>
            {promoApplied && (
              <div className="bk-summary-row discount">
                <span>โค้ด {promoApplied.code}</span>
                <span>− ฿{promoApplied.amount.toLocaleString()}</span>
              </div>
            )}

            {/* Promo input */}
            <form
              className="bk-promo"
              onSubmit={(e) => { e.preventDefault(); onApplyPromo?.(promo); }}
            >
              <input
                type="text"
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                placeholder="ใส่โค้ดส่วนลด"
                aria-label="Promo code"
              />
              <button type="submit"><IconTag size={14} /> ใช้</button>
            </form>

            <div className="bk-summary-row total">
              <span>รวมทั้งหมด</span>
              <span className="amount">฿{total.toLocaleString()}</span>
            </div>

            <button
              type="button"
              className="bk-btn bk-btn-primary bk-btn-lg bk-btn-block"
              style={{ marginTop: 16 }}
              onClick={onCheckout}
            >
              เช็คเอาท์ <IconArrowRight size={16} />
            </button>

            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--shop-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--bikini-text-2)', fontWeight: 600 }}>
                <IconTruck size={16} color="var(--shop-primary)" /> ส่งภายใน 24 ชม.
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--bikini-text-2)', fontWeight: 600 }}>
                <IconShieldCheck size={16} color="var(--shop-primary)" /> ห่อแบบ Discreet
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--bikini-text-2)', fontWeight: 600 }}>
                <IconRefresh size={16} color="var(--shop-primary)" /> เปลี่ยนไซส์ฟรี 14 วัน
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;
