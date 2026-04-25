export interface CreatePaymentInput {
  orderId: string;
  amountTHB: number;
  customerEmail?: string;
  description?: string;
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
