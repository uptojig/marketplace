/**
 * QuickPay Payment Hub — Type definitions
 * Covers both QuickPay direct and AnyPay deposit callbacks
 */

export type QuickPayEventType =
  | "DEPOSIT"          // Customer deposited money
  | "WITHDRAWAL"       // Payout processed
  | "PAYMENT_SUCCESS"  // Payment completed
  | "PAYMENT_FAILED"   // Payment failed
  | "REFUND";          // Refund processed

export interface QuickPayWebhookBody {
  /** Webhook event type */
  event: QuickPayEventType;
  /** QuickPay internal transaction ID */
  transaction_id: string;
  /** Merchant's order reference (our order ID) */
  order_id?: string;
  /** Merchant reference for linking */
  merchant_ref?: string;
  /** Deposit amount in THB */
  amount: number;
  /** Currency code */
  currency: string;
  /** Payment channel: BANK_TRANSFER, PROMPTPAY, CREDIT_CARD, etc. */
  channel?: string;
  /** Customer info (from QuickPay) */
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  /** Bank/payment details */
  bank_code?: string;
  account_number_masked?: string;
  /** Timestamp from QuickPay */
  timestamp: string;
  /** HMAC signature from QuickPay */
  signature?: string;
  /** Any additional metadata */
  metadata?: Record<string, unknown>;
  /** Catch-all for unknown fields */
  [key: string]: unknown;
}

export interface QuickPayDomainConfig {
  /** Domain name */
  domain: string;
  /** Dedicated IP address for this domain */
  dedicatedIp: string;
  /** QuickPay Merchant ID for this domain */
  merchantId: string;
  /** QuickPay API Key for this domain */
  apiKey: string;
  /** QuickPay Secret for signature verification */
  secret: string;
  /** Store ID in our system (optional — auto-resolve from domain) */
  storeId?: string;
  /** Whether this domain is active */
  active: boolean;
}

export interface DemoOrderResult {
  orderId: string;
  status: "CREATED" | "ALREADY_EXISTS";
  amountTHB: number;
  transactionId: string;
  domain: string;
}
