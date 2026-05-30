/**
 * Mock data for SMSUP+ pages. Replace with Prisma queries when wiring to DB.
 * Schema sketch (for future implementation):
 *  - SmsAccount { id, userId, balance, senderNames[] }
 *  - SmsPackage { id, slug, name, credits, priceTHB, pricePerSmsTHB, isPopular }
 *  - SmsOrder { id, accountId, packageId, amountTHB, status, createdAt }
 *  - SmsMessage { id, accountId, to, body, senderName, status, cost, sentAt, deliveredAt }
 *  - SmsApiKey { id, accountId, label, prefix, hashedSecret, lastUsedAt, createdAt }
 */

export type SmsPackage = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  credits: number;
  priceTHB: number;
  pricePerSmsTHB: number;
  isPopular?: boolean;
  features: string[];
};

export const SMS_PACKAGES: SmsPackage[] = [
  {
    id: 'pkg-starter',
    slug: 'starter',
    name: 'Starter',
    tagline: 'เริ่มต้นทดลอง · เหมาะกับ shop เล็กๆ',
    credits: 1_000,
    priceTHB: 500,
    pricePerSmsTHB: 0.5,
    features: [
      'API + Dashboard',
      'ส่งทันที / ตั้งเวลาได้',
      'Sender Name 1 ชื่อ',
      'รายงานพื้นฐาน',
    ],
  },
  {
    id: 'pkg-growth',
    slug: 'growth',
    name: 'Growth',
    tagline: 'SMB ส่งสม่ำเสมอ · OTP + Marketing',
    credits: 5_000,
    priceTHB: 2_000,
    pricePerSmsTHB: 0.4,
    isPopular: true,
    features: [
      'ทุกอย่างของ Starter',
      'OTP API + Rate limiting',
      'Sender Name 3 ชื่อ',
      'Audience & Segmentation',
      'Webhook callbacks',
    ],
  },
  {
    id: 'pkg-business',
    slug: 'business',
    name: 'Business',
    tagline: 'ธุรกิจขนาดกลาง · ส่งจำนวนมาก',
    credits: 20_000,
    priceTHB: 7_000,
    pricePerSmsTHB: 0.35,
    features: [
      'ทุกอย่างของ Growth',
      'Sender Name ไม่จำกัด',
      'Multi-user (5 accounts)',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    id: 'pkg-enterprise',
    slug: 'enterprise',
    name: 'Enterprise',
    tagline: 'องค์กรขนาดใหญ่ · ปริมาณ >100K/เดือน',
    credits: 100_000,
    priceTHB: 22_000,
    pricePerSmsTHB: 0.22,
    features: [
      'ทุกอย่างของ Business',
      'SLA 99.9% uptime',
      'Dedicated account manager',
      'Custom integration',
      'Volume discount',
    ],
  },
];

export const TOPUP_AMOUNTS = [500, 1_000, 2_000, 5_000, 10_000];

export function calcVolumePrice(credits: number): { total: number; rate: number; saving: number } {
  let rate: number;
  if (credits < 2_000) rate = 0.5;
  else if (credits < 10_000) rate = 0.4;
  else if (credits < 50_000) rate = 0.35;
  else rate = 0.22;
  const total = Math.round(credits * rate);
  const baseline = credits * 0.5;
  const saving = Math.round(((baseline - total) / baseline) * 100);
  return { total, rate, saving };
}

// ─── Mock account state ──────────────────────────────────────────

export type SmsAccount = {
  balance: number;
  senderNames: string[];
  monthSent: number;
  monthSpentTHB: number;
  deliveryRate: number;
};

export const MOCK_ACCOUNT: SmsAccount = {
  balance: 3_842,
  senderNames: ['SMSUP', 'SHOPPLUS', 'BOOKING'],
  monthSent: 12_847,
  monthSpentTHB: 5_138,
  deliveryRate: 99.7,
};

export type SmsMessage = {
  id: string;
  to: string;
  preview: string;
  senderName: string;
  status: 'delivered' | 'pending' | 'failed';
  sentAt: string;
  cost: number;
  kind: 'otp' | 'tx' | 'marketing';
};

export const MOCK_MESSAGES: SmsMessage[] = [
  {
    id: 'msg-001',
    to: '0812345678',
    preview: 'รหัส OTP ของคุณคือ 284917...',
    senderName: 'SMSUP',
    status: 'delivered',
    sentAt: 'วันนี้ 14:32',
    cost: 1,
    kind: 'otp',
  },
  {
    id: 'msg-002',
    to: '0998765432',
    preview: 'ออเดอร์ #ORD-29481 จัดส่งแล้ว...',
    senderName: 'SHOPPLUS',
    status: 'delivered',
    sentAt: 'วันนี้ 14:21',
    cost: 1,
    kind: 'tx',
  },
  {
    id: 'msg-003',
    to: '0826543210',
    preview: 'โปรเดือนนี้ ลด 30% ทุกรายการ...',
    senderName: 'SHOPPLUS',
    status: 'pending',
    sentAt: 'วันนี้ 13:48',
    cost: 2,
    kind: 'marketing',
  },
  {
    id: 'msg-004',
    to: '0892341567',
    preview: 'ยืนยันการจองห้องพัก booking #BK-22413...',
    senderName: 'BOOKING',
    status: 'delivered',
    sentAt: 'เมื่อวาน 18:15',
    cost: 1,
    kind: 'tx',
  },
  {
    id: 'msg-005',
    to: '0823456789',
    preview: 'รหัส OTP ของคุณคือ 947210...',
    senderName: 'SMSUP',
    status: 'failed',
    sentAt: 'เมื่อวาน 16:02',
    cost: 0,
    kind: 'otp',
  },
];

export type ApiKey = {
  id: string;
  label: string;
  prefix: string;
  lastUsedAt: string;
  createdAt: string;
};

export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'ak-prod-1',
    label: 'Production',
    prefix: 'sk_live_4f8a',
    lastUsedAt: '2 นาทีก่อน',
    createdAt: '12 มี.ค. 2569',
  },
  {
    id: 'ak-stage',
    label: 'Staging',
    prefix: 'sk_test_91bc',
    lastUsedAt: 'เมื่อวาน',
    createdAt: '14 ม.ค. 2569',
  },
];
