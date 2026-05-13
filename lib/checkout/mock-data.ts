import type { Address, PaymentMethodInfo, ShippingOption } from './types';

export const mockAddresses: Address[] = [
  {
    id: 'addr_1',
    fullName: 'ธนภัทร ทอง',
    phone: '081-234-5678',
    line1: '123/45 หมู่บ้านพฤกษา ถนนรามอินทรา',
    line2: 'ใกล้แม็คโคร',
    subDistrict: 'คันนายาว',
    district: 'คันนายาว',
    province: 'กรุงเทพมหานคร',
    postalCode: '10230',
    isDefault: true,
    label: 'home',
  },
  {
    id: 'addr_2',
    fullName: 'ธนภัทร ทอง',
    phone: '02-345-6789',
    line1: '99 อาคาร TAS ชั้น 5',
    subDistrict: 'สีลม',
    district: 'บางรัก',
    province: 'กรุงเทพมหานคร',
    postalCode: '10500',
    isDefault: false,
    label: 'office',
  },
];

export const mockShippingOptions: ShippingOption[] = [
  {
    id: 'kerry-standard',
    name: 'Kerry มาตรฐาน',
    carrier: 'Kerry Express',
    estimatedDays: { min: 2, max: 4 },
    price: 35,
    freeAbove: 500,
  },
  {
    id: 'kerry-express',
    name: 'Kerry ส่งด่วน',
    carrier: 'Kerry Express',
    estimatedDays: { min: 1, max: 2 },
    price: 65,
  },
  {
    id: 'flash-standard',
    name: 'Flash Express ปกติ',
    carrier: 'Flash Express',
    estimatedDays: { min: 2, max: 3 },
    price: 30,
    freeAbove: 500,
  },
  {
    id: 'thp-ems',
    name: 'ไปรษณีย์ไทย EMS',
    carrier: 'Thailand Post',
    estimatedDays: { min: 3, max: 5 },
    price: 45,
  },
];

export const paymentMethods: PaymentMethodInfo[] = [
  {
    id: 'promptpay',
    label: 'PromptPay QR',
    description: 'สแกน QR Code ผ่านแอปธนาคาร',
    icon: '🇹🇭',
    available: true,
  },
  {
    id: 'card',
    label: 'บัตรเครดิต / เดบิต',
    description: 'Visa, Mastercard, JCB',
    icon: '💳',
    available: true,
  },
  {
    id: 'wallet',
    label: 'Anypay Wallet',
    description: 'ใช้ยอดคงเหลือใน Anypay',
    icon: '👛',
    available: true,
  },
  {
    id: 'bnpl',
    label: 'ผ่อนได้ 0%',
    description: 'จ่ายเป็นงวด ไม่มีดอกเบี้ย',
    icon: '📅',
    available: true,
  },
  {
    id: 'cod',
    label: 'เก็บเงินปลายทาง',
    description: 'จ่ายตอนได้รับสินค้า (+฿20)',
    icon: '📦',
    available: true,
  },
];

export function getAddresses(): Address[] {
  return mockAddresses;
}

export function getShippingOptions(_storeId: string): ShippingOption[] {
  // Real impl: each store can have its own shipping configuration
  return mockShippingOptions;
}

export function getDefaultAddressId(): string | null {
  return mockAddresses.find((a) => a.isDefault)?.id ?? null;
}
