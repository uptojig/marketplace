/**
 * Shared PDP adapter — bridges ProductDetailProps from the storefront
 * to shadcn-studio product-overview + product-reviews blocks.
 *
 * Each template picks an overview variant (01,02,04-09) and a reviews
 * variant (02-05). This adapter maps the storefront product data to
 * the shapes each block expects.
 */

import React, { lazy, Suspense } from 'react';
import type { ProductDetailProps } from '@/lib/templates/types';

// Lazy-load overview variants
const overviewVariants = {
  '01': lazy(() => import('@/components/shadcn-studio/blocks/product-overview-01/product-overview-01')),
  '02': lazy(() => import('@/components/shadcn-studio/blocks/product-overview-02/product-overview-02')),
  '04': lazy(() => import('@/components/shadcn-studio/blocks/product-overview-04/product-overview-04')),
  '05': lazy(() => import('@/components/shadcn-studio/blocks/product-overview-05/product-overview-05')),
  '06': lazy(() => import('@/components/shadcn-studio/blocks/product-overview-06/product-overview-06')),
  '07': lazy(() => import('@/components/shadcn-studio/blocks/product-overview-07/product-overview-07')),
  '08': lazy(() => import('@/components/shadcn-studio/blocks/product-overview-08/product-overview-08')),
  '09': lazy(() => import('@/components/shadcn-studio/blocks/product-overview-09/product-overview-09')),
} as const;

// Lazy-load reviews variants
const reviewVariants = {
  '02': lazy(() => import('@/components/shadcn-studio/blocks/product-reviews-02/product-reviews-02')),
  '03': lazy(() => import('@/components/shadcn-studio/blocks/product-reviews-03/product-reviews-03')),
  '04': lazy(() => import('@/components/shadcn-studio/blocks/product-reviews-04/product-reviews-04')),
  '05': lazy(() => import('@/components/shadcn-studio/blocks/product-reviews-05/product-reviews-05')),
} as const;

export type OverviewVariant = keyof typeof overviewVariants;
export type ReviewVariant = keyof typeof reviewVariants;

/** Convert ProductDetailProps → product-overview productItems */
function toProductItems(props: ProductDetailProps) {
  const p = props.product;
  const images = (p.images.length > 0 ? p.images : [p.imageUrl]).filter(Boolean).map((src, i) => ({
    src: src ?? 'https://placehold.co/600x600/f4f4f5/a1a1aa?text=No+Image',
    alt: `${p.title} ${i + 1}`,
  }));

  const discount = p.originalPriceTHB && p.originalPriceTHB > p.priceTHB
    ? Math.round((1 - p.priceTHB / p.originalPriceTHB) * 100)
    : 0;

  return [{
    name: p.title,
    description: p.description ?? '',
    totalReview: 24,
    rating: 4.5,
    price: p.priceTHB,
    hasDiscount: discount > 0,
    discountPercentage: discount,
    images,
    breadcrumbData: [
      { label: 'หน้าแรก', href: `/stores/${props.store.slug}` },
      { label: 'สินค้า', href: `/stores/${props.store.slug}/category` },
      { label: p.title },
    ],
    defaultSize: p.variants[0]?.sizeLabel ?? undefined,
    defaultColorOption: p.variants[0]?.colorLabel ?? undefined,
  }];
}

/** Build sizesChart from product variants */
function toSizesChart(props: ProductDetailProps) {
  const sizes = new Set<string>();
  props.product.variants.forEach(v => {
    if (v.sizeLabel) sizes.add(v.sizeLabel);
  });
  if (sizes.size === 0) return [{ value: 'one-size', label: 'Free Size' }];
  return Array.from(sizes).map(s => ({ value: s, label: s }));
}

/** Build colorsChart from product variants */
function toColorsChart(props: ProductDetailProps) {
  const colors = new Map<string, string>();
  props.product.variants.forEach(v => {
    if (v.colorLabel && !colors.has(v.colorLabel)) {
      // Map common Thai/English color names to hex
      const hex = colorToHex(v.colorLabel);
      colors.set(v.colorLabel, hex);
    }
  });
  if (colors.size === 0) return [{ value: 'default', colorOption: '#000000' }];
  return Array.from(colors.entries()).map(([label, hex]) => ({
    value: label,
    colorOption: hex,
  }));
}

function colorToHex(name: string): string {
  const map: Record<string, string> = {
    'ดำ': '#000000', 'black': '#000000',
    'ขาว': '#FFFFFF', 'white': '#FFFFFF',
    'แดง': '#EF4444', 'red': '#EF4444',
    'น้ำเงิน': '#3B82F6', 'blue': '#3B82F6',
    'เขียว': '#22C55E', 'green': '#22C55E',
    'เหลือง': '#EAB308', 'yellow': '#EAB308',
    'ชมพู': '#EC4899', 'pink': '#EC4899',
    'ม่วง': '#8B5CF6', 'purple': '#8B5CF6',
    'ส้ม': '#F97316', 'orange': '#F97316',
    'เทา': '#6B7280', 'gray': '#6B7280', 'grey': '#6B7280',
    'น้ำตาล': '#92400E', 'brown': '#92400E',
    'ครีม': '#FFFDD0', 'cream': '#FFFDD0',
    'กรม': '#1E3A5F', 'navy': '#1E3A5F',
  };
  return map[name.toLowerCase()] ?? '#374151';
}

/** Mock reviews for the reviews block */
const MOCK_REVIEWS = [
  { id: 1, name: 'คุณสมชาย', description: 'สินค้าดีมาก คุณภาพเยี่ยม จัดส่งเร็ว', rating: 5, image: 'https://placehold.co/40x40/6366f1/ffffff?text=ส', date: '2 วันที่แล้ว' },
  { id: 2, name: 'คุณมะลิ', description: 'ใช้ได้ดี คุ้มราคา แนะนำเลย', rating: 4, image: 'https://placehold.co/40x40/ec4899/ffffff?text=ม', date: '5 วันที่แล้ว' },
  { id: 3, name: 'คุณวิทย์', description: 'แพ็คเกจสวย ของแท้ ส่งไว', rating: 5, image: 'https://placehold.co/40x40/f97316/ffffff?text=ว', date: '1 สัปดาห์ที่แล้ว' },
  { id: 4, name: 'คุณนิด', description: 'สินค้าตรงปก ราคาถูกกว่าห้าง', rating: 4, image: 'https://placehold.co/40x40/22c55e/ffffff?text=น', date: '2 สัปดาห์ที่แล้ว' },
];

/** Features for variant 06 */
const MOCK_FEATURES = [
  { icon: '📦', title: 'จัดส่งฟรี', description: 'สั่งซื้อครบ ฿500 จัดส่งฟรีทั่วไทย' },
  { icon: '🔄', title: 'เปลี่ยนคืนได้', description: 'ภายใน 30 วัน ไม่มีเงื่อนไข' },
  { icon: '✅', title: 'รับประกัน', description: 'รับประกันคุณภาพ 1 ปีเต็ม' },
];

/** Benefits for variant 04 */
const MOCK_BENEFITS = [
  { title: 'วัสดุพรีเมียม', description: 'คัดสรรวัสดุคุณภาพสูง' },
  { title: 'ออกแบบเฉพาะ', description: 'ดีไซน์โดยนักออกแบบมืออาชีพ' },
  { title: 'จัดส่งด่วน', description: 'ส่งถึงมือภายใน 1-3 วัน' },
];

/** Payment methods for variant 08 */
const MOCK_PAYMENTS = [
  { name: 'โอนธนาคาร', icon: '🏦' },
  { name: 'พร้อมเพย์', icon: '📱' },
  { name: 'บัตรเครดิต', icon: '💳' },
];

export function makePdpAdapter(overview: OverviewVariant, review: ReviewVariant) {
  return function PdpAdapter(props: ProductDetailProps) {
    const OverviewBlock = overviewVariants[overview];
    const ReviewBlock = reviewVariants[review];

    const productItems = toProductItems(props);
    const sizesChart = toSizesChart(props);
    const colorsChart = toColorsChart(props);

    // Build variant-specific extra props
    const extraProps: Record<string, unknown> = {};
    if (overview === '04') extraProps.benefits = MOCK_BENEFITS;
    if (overview === '06') extraProps.features = MOCK_FEATURES;
    if (overview === '08') extraProps.paymentMethods = MOCK_PAYMENTS;
    if (['01', '02', '05', '07', '09'].includes(overview)) {
      extraProps.sizesChart = sizesChart;
      extraProps.colorsChart = colorsChart;
    }
    if (overview === '08') {
      extraProps.colorsChart = colorsChart;
    }

    return (
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center text-zinc-400">
            กำลังโหลด...
          </div>
        }
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <OverviewBlock productItems={productItems as any} {...extraProps as any} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ReviewBlock reviewItems={MOCK_REVIEWS as any} />
      </Suspense>
    );
  };
}
