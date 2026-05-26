export interface CreatePaymentInput {
  /** AnyPay echoes this back unchanged in the webhook. For order
   *  payments it's the Order.id; for credit top-ups we prefix with
   *  "topup:" so the webhook can route accordingly. */
  orderId: string;
  amountTHB: number;
  customerEmail?: string;
  description?: string;
  /** Per-store slug — used to build the per-store return URL so the
   *  buyer lands inside the store's chrome + theme after payment. */
  storeSlug?: string;
  /** Override the buyer-facing return path. When omitted, the order
   *  flow's `/checkout/success` URL is built from storeSlug + orderId.
   *  Credit top-ups pass `/stores/<slug>/account/credit?topup=<id>`. */
  returnPath?: string;
}

export interface CreatePaymentResult {
  paymentUrl: string;
  transactionId: string;
  raw: unknown;
}

export interface AnyPayWebhookBody {
  status: "PAID" | "FAILED" | "PENDING";
  order_id: string;
  transaction_id: string;
  amount?: number;
  signature?: string;
  [key: string]: unknown;
}
