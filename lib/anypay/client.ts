import { signPayload } from "./signature";
import type { CreatePaymentInput, CreatePaymentResult } from "./types";

const MODE = process.env.ANYPAY_MODE ?? "mock";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  if (MODE === "mock") {
    return createMockPayment(input);
  }
  return createLivePayment(input);
}

async function createMockPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  const res = await fetch(`${BASE_URL}/api/mock/anypay/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ order_id: input.orderId, amount: input.amountTHB }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Mock AnyPay create-payment failed: ${res.status}`);
  }
  const data = (await res.json()) as { payment_url: string; transaction_id: string };
  return {
    paymentUrl: data.payment_url,
    transactionId: data.transaction_id,
    raw: data,
  };
}

async function createLivePayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  const apiBase = required("ANYPAY_API_BASE");
  const merchantId = required("ANYPAY_MERCHANT_ID");
  const apiKey = required("ANYPAY_API_KEY");
  const secret = required("ANYPAY_SECRET");

  const body = {
    merchant_id: merchantId,
    order_id: input.orderId,
    amount: input.amountTHB,
    currency: "THB",
    description: input.description ?? `Order ${input.orderId}`,
    customer_email: input.customerEmail,
    return_url: `${BASE_URL}/order-success?orderId=${input.orderId}`,
    webhook_url: `${BASE_URL}/api/webhook/anypay`,
  };
  const payload = JSON.stringify(body);
  const signature = signPayload(payload, secret);

  const res = await fetch(`${apiBase}/payments`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "x-signature": signature,
    },
    body: payload,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AnyPay create-payment failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { payment_url: string; transaction_id: string };
  return {
    paymentUrl: data.payment_url,
    transactionId: data.transaction_id,
    raw: data,
  };
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function isMockMode() {
  return MODE === "mock";
}
