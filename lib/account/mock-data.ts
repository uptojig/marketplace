export interface OrderItem {
  productId: string;
  title: string;
  thumbnailUrl: string;
  variantName?: string;
  price: number;
  qty: number;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface Order {
  id: string;
  orderRef: string;
  placedAt: string;
  status: OrderStatus;
  storeId: string;
  /** Slug used to build /stores/[slug] URLs in account pages. */
  storeSlug: string;
  storeName: string;
  storeLogo?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  addressId: string;
  paymentMethod: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl?: string;
  joinedAt: string;
}

export const mockUser: UserProfile = {
  id: 'user_1',
  email: 'thanpatsorn@tas.co.th',
  phone: '081-234-5678',
  fullName: 'ธนภัทร ทอง',
  avatarUrl: 'https://picsum.photos/seed/avatar/200',
  joinedAt: '2024-08-15T00:00:00Z',
};

export const mockOrders: Order[] = [
  {
    id: 'order_1',
    orderRef: 'ORD-1746984000-XKZ4',
    placedAt: '2026-05-11T10:30:00Z',
    status: 'shipping',
    storeId: 'store_1',
    storeSlug: 'audio-house-bkk',
    storeName: 'Audio House BKK',
    storeLogo: 'https://picsum.photos/seed/logo/200',
    items: [
      {
        productId: 'p_1',
        title: 'Wireless ANC Headphones - Premium Sound',
        thumbnailUrl: 'https://picsum.photos/seed/p1/600/600',
        price: 1290,
        qty: 1,
      },
    ],
    subtotal: 1290,
    shipping: 35,
    discount: 100,
    total: 1225,
    addressId: 'addr_1',
    paymentMethod: 'promptpay',
    trackingNumber: 'TH1234567890',
    carrier: 'Kerry Express',
    estimatedDelivery: '2026-05-14T00:00:00Z',
  },
  {
    id: 'order_2',
    orderRef: 'ORD-1746811200-PLM9',
    placedAt: '2026-05-09T15:20:00Z',
    status: 'delivered',
    storeId: 'store_1',
    storeSlug: 'audio-house-bkk',
    storeName: 'Audio House BKK',
    storeLogo: 'https://picsum.photos/seed/logo/200',
    items: [
      {
        productId: 'p_3',
        title: 'True Wireless Earbuds Pro',
        thumbnailUrl: 'https://picsum.photos/seed/p3/600/600',
        price: 990,
        qty: 2,
      },
      {
        productId: 'p_6',
        title: 'USB-C Audio Adapter',
        thumbnailUrl: 'https://picsum.photos/seed/p6/600/600',
        price: 290,
        qty: 1,
      },
    ],
    subtotal: 2270,
    shipping: 0,
    discount: 50,
    total: 2220,
    addressId: 'addr_1',
    paymentMethod: 'wallet',
    trackingNumber: 'TH9876543210',
    carrier: 'Flash Express',
  },
  {
    id: 'order_3',
    orderRef: 'ORD-1746465600-DRQ2',
    placedAt: '2026-05-05T09:15:00Z',
    status: 'paid',
    storeId: 'store_2',
    storeSlug: 'thai-craft-studio',
    storeName: 'Thai Craft Studio',
    storeLogo: 'https://picsum.photos/seed/logo2/200',
    items: [
      {
        productId: 'p_2',
        title: 'Studio Reference Headphones',
        thumbnailUrl: 'https://picsum.photos/seed/p2/600/600',
        price: 3490,
        qty: 1,
      },
    ],
    subtotal: 3490,
    shipping: 65,
    discount: 0,
    total: 3555,
    addressId: 'addr_1',
    paymentMethod: 'card',
  },
  {
    id: 'order_4',
    orderRef: 'ORD-1746000000-ZZ11',
    placedAt: '2026-04-30T11:00:00Z',
    status: 'cancelled',
    storeId: 'store_3',
    storeSlug: 'glow-beauty',
    storeName: 'Glow Beauty',
    storeLogo: 'https://picsum.photos/seed/logo3/200',
    items: [
      {
        productId: 'p_99',
        title: 'Matte Lipstick Set',
        thumbnailUrl: 'https://picsum.photos/seed/p99/600/600',
        price: 590,
        qty: 1,
      },
    ],
    subtotal: 590,
    shipping: 35,
    discount: 0,
    total: 625,
    addressId: 'addr_2',
    paymentMethod: 'cod',
  },
];

export function getOrders(): Order[] {
  return mockOrders;
}

export function getOrderById(id: string): Order | null {
  // Match either internal id or orderRef
  return mockOrders.find((o) => o.id === id || o.orderRef === id) ?? null;
}

export function getOrdersByStatus(status: OrderStatus | 'all'): Order[] {
  if (status === 'all') return mockOrders;
  return mockOrders.filter((o) => o.status === status);
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'รอชำระเงิน',
  paid: 'ชำระแล้ว · รอจัดส่ง',
  shipping: 'กำลังจัดส่ง',
  delivered: 'จัดส่งสำเร็จ',
  cancelled: 'ยกเลิกแล้ว',
  returned: 'คืนสินค้าแล้ว',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  paid: 'bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
  shipping: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200',
  delivered: 'bg-green-100 text-green-900 dark:bg-green-950/40 dark:text-green-200',
  cancelled: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
  returned: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
};
