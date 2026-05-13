// Checkout-only shapes: address records (more detailed than the global
// Address Prisma model since checkout collects extra fields), shipping
// options offered per store, and the payment-method registry.

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  label?: "home" | "office" | "other";
}

export interface ShippingOption {
  id: string;
  name: string;
  carrier: string;
  estimatedDays: { min: number; max: number };
  price: number;
  freeAbove?: number;
}

export type PaymentMethod = "promptpay" | "card" | "wallet" | "cod" | "bnpl";

export interface PaymentMethodInfo {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  available: boolean;
}
