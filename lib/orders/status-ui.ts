// Maps Prisma OrderStatus enum to Thai labels + badge colors for the
// buyer-facing account pages (orders list, order detail).
//
// Keep this in one place so the order list, order detail, and account
// dashboard stay visually consistent. The mock-data variant in
// lib/account/mock-data.ts uses lowercase keys; this is the real
// source of truth driven off the Prisma enum.

import type { OrderStatus } from '@prisma/client';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'รอชำระเงิน',
  PAID: 'ชำระแล้ว · รอจัดส่ง',
  SUPPLIER_PLACED: 'ส่งให้ซัพพลายเออร์',
  SHIPPED: 'กำลังจัดส่ง',
  DELIVERED: 'จัดส่งสำเร็จ',
  CANCELLED: 'ยกเลิกแล้ว',
  FAILED: 'การชำระเงินล้มเหลว',
  RETURNED: 'คืนสินค้าแล้ว',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING_PAYMENT:
    'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  PAID: 'bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
  SUPPLIER_PLACED:
    'bg-sky-100 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200',
  SHIPPED:
    'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200',
  DELIVERED:
    'bg-green-100 text-green-900 dark:bg-green-950/40 dark:text-green-200',
  CANCELLED: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
  FAILED: 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200',
  RETURNED: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
};

// Linear lifecycle shown on the order-detail stepper. SUPPLIER_PLACED
// is collapsed under PAID because buyers don't care which 3PL we
// pushed to — they care about "did the seller fulfil it yet".
// FAILED / CANCELLED / RETURNED are terminal branches and skip the
// stepper UI entirely.
export const ORDER_TIMELINE: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'SHIPPED',
  'DELIVERED',
];

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === 'CANCELLED' || status === 'RETURNED' || status === 'FAILED';
}

// Where on the timeline is this status? SUPPLIER_PLACED maps to PAID
// so the stepper doesn't have a dead segment.
export function timelineIndex(status: OrderStatus): number {
  const normalised: OrderStatus =
    status === 'SUPPLIER_PLACED' ? 'PAID' : status;
  return ORDER_TIMELINE.indexOf(normalised);
}

// Used by the tab filter on the orders list page. Buyers care about
// "what's happening with my order", which is a coarser grouping than
// the underlying enum.
export type OrderTabKey =
  | 'all'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export const ORDER_TABS: { key: OrderTabKey; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'PENDING_PAYMENT', label: 'รอชำระ' },
  { key: 'PAID', label: 'รอจัดส่ง' },
  { key: 'SHIPPED', label: 'กำลังจัดส่ง' },
  { key: 'DELIVERED', label: 'สำเร็จ' },
  { key: 'CANCELLED', label: 'ยกเลิก' },
];

// Tab match helper — collapses SUPPLIER_PLACED → PAID and groups
// FAILED + CANCELLED together for the buyer's "ยกเลิก" tab.
export function matchesTab(status: OrderStatus, tab: OrderTabKey): boolean {
  if (tab === 'all') return true;
  if (tab === 'PAID') return status === 'PAID' || status === 'SUPPLIER_PLACED';
  if (tab === 'CANCELLED') return status === 'CANCELLED' || status === 'FAILED';
  return status === tab;
}
