import type { Coupon } from './types';

/**
 * Mock coupon catalog. Replace with DB query in production.
 * Includes platform-wide, store-scoped, and category-specific samples.
 */

const TODAY = new Date();
const futureISO = (days: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};
const pastISO = (days: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const mockCoupons: Coupon[] = [
  // ===== Bulk-buyer ladder (surfaced on BusinessModelCouponStrip) =====
  {
    id: 'cp_bulk10',
    code: 'BULK10',
    scope: { type: 'platform' },
    discount: { kind: 'percent', percent: 10 },
    validTo: futureISO(365),
    title: 'ลด 10% ทุกออเดอร์ขายส่ง',
    description: 'ไม่มีขั้นต่ำ',
    issuer: 'Basketplace',
    colorScheme: 'red',
  },
  {
    id: 'cp_bulk15',
    code: 'BULK15',
    scope: { type: 'platform' },
    discount: { kind: 'percent', percent: 15 },
    minSpend: 5000,
    validTo: futureISO(365),
    title: 'ลด 15% เมื่อยอดถึง ฿5,000',
    description: 'ขั้นต่ำ ฿5,000 ต่อออเดอร์',
    issuer: 'Basketplace',
    colorScheme: 'red',
  },
  {
    id: 'cp_bulk20',
    code: 'BULK20',
    scope: { type: 'platform' },
    discount: { kind: 'percent', percent: 20 },
    minSpend: 20000,
    validTo: futureISO(365),
    title: 'ลด 20% เมื่อยอดถึง ฿20,000',
    description: 'ขั้นต่ำ ฿20,000 ต่อออเดอร์',
    issuer: 'Basketplace',
    colorScheme: 'red',
  },

  // ===== Platform-wide =====
  {
    id: 'cp_welcome100',
    code: 'WELCOME100',
    scope: { type: 'platform' },
    discount: { kind: 'fixed', amount: 100 },
    minSpend: 500,
    validTo: futureISO(30),
    newUsersOnly: true,
    title: 'ลด ฿100 สำหรับสมาชิกใหม่',
    description: 'ใช้ได้กับยอดสั่งซื้อตั้งแต่ ฿500',
    issuer: 'Basketplace',
    colorScheme: 'blue',
  },
  {
    id: 'cp_save15',
    code: 'SAVE15',
    scope: { type: 'platform' },
    discount: { kind: 'percent', percent: 15, maxDiscount: 300 },
    minSpend: 1000,
    validTo: futureISO(14),
    title: 'ลด 15% สูงสุด ฿300',
    description: 'ขั้นต่ำ ฿1,000',
    issuer: 'Basketplace',
    colorScheme: 'red',
  },
  {
    id: 'cp_anypay50',
    code: 'ANYPAY50',
    scope: { type: 'platform' },
    discount: { kind: 'fixed', amount: 50 },
    minSpend: 200,
    requiredPaymentMethod: 'wallet',
    validTo: futureISO(60),
    title: 'ลด ฿50 เมื่อจ่ายด้วย Anypay Wallet',
    description: 'ขั้นต่ำ ฿200',
    issuer: 'Anypay',
    colorScheme: 'purple',
  },

  // ===== Free shipping =====
  {
    id: 'cp_freeship',
    code: 'FREESHIP',
    scope: { type: 'platform' },
    discount: { kind: 'free_shipping' },
    minSpend: 300,
    validTo: futureISO(7),
    title: 'ส่งฟรีทุกร้าน',
    description: 'ใช้ได้เมื่อยอดถึง ฿300 ต่อร้าน',
    issuer: 'Basketplace',
    colorScheme: 'green',
  },

  // ===== Store-scoped =====
  {
    id: 'cp_audio200',
    code: 'AUDIO200',
    scope: { type: 'store', storeId: 'store_1' },
    discount: { kind: 'fixed', amount: 200 },
    minSpend: 1500,
    validTo: futureISO(10),
    title: 'Audio House ลด ฿200',
    description: 'ขั้นต่ำ ฿1,500',
    issuer: 'Audio House BKK',
    colorScheme: 'amber',
  },
  {
    id: 'cp_audio10',
    code: 'AUDIO10',
    scope: { type: 'store', storeId: 'store_1' },
    discount: { kind: 'percent', percent: 10, maxDiscount: 500 },
    minSpend: 800,
    validTo: futureISO(21),
    title: 'Audio House ลด 10%',
    description: 'สูงสุด ฿500',
    issuer: 'Audio House BKK',
    colorScheme: 'red',
  },

  // ===== Expired (for "expired" tab) =====
  {
    id: 'cp_expired1',
    code: 'OLDPROMO',
    scope: { type: 'platform' },
    discount: { kind: 'fixed', amount: 50 },
    minSpend: 100,
    validTo: pastISO(5),
    title: 'ลด ฿50 (หมดอายุ)',
    issuer: 'Basketplace',
    colorScheme: 'red',
  },

  // ===== Category-scoped =====
  {
    id: 'cp_electronics',
    code: 'TECH20',
    scope: { type: 'category', categorySlugs: ['electronics'] },
    discount: { kind: 'percent', percent: 20, maxDiscount: 1000 },
    minSpend: 2000,
    validTo: futureISO(45),
    title: 'หมวดอิเล็กทรอนิกส์ ลด 20%',
    description: 'สูงสุด ฿1,000',
    issuer: 'Basketplace',
    colorScheme: 'blue',
  },
];

export function getAllCoupons(): Coupon[] {
  return mockCoupons;
}

export function getCouponById(id: string): Coupon | null {
  return mockCoupons.find((c) => c.id === id) ?? null;
}

export function getCouponByCode(code: string): Coupon | null {
  return mockCoupons.find((c) => c.code.toLowerCase() === code.toLowerCase()) ?? null;
}

export function getActiveCoupons(): Coupon[] {
  const now = Date.now();
  return mockCoupons.filter(
    (c) => new Date(c.validTo).getTime() > now && (!c.validFrom || new Date(c.validFrom).getTime() <= now),
  );
}
