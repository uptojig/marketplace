// Public entry point for the transactional email layer.
//
// Callers (order status transitions, refund flows, cron jobs) should
// import the hook functions from here; the raw `sendEmail()` and
// templates are exported for advanced use cases (admin re-send tools,
// preview pages, etc.) but most code paths should prefer the hooks
// because they handle data fetching + DTO shaping consistently.

export { sendOrderPaidEmail } from "./hooks/send-order-paid";
export type { SendOrderPaidInput } from "./hooks/send-order-paid";

export { sendOrderShippedEmail } from "./hooks/send-order-shipped";
export type { SendOrderShippedInput } from "./hooks/send-order-shipped";

export { sendOrderDeliveredEmail } from "./hooks/send-order-delivered";
export type { SendOrderDeliveredInput } from "./hooks/send-order-delivered";

export { sendOrderRefundedEmail } from "./hooks/send-order-refunded";
export type { SendOrderRefundedInput } from "./hooks/send-order-refunded";

export { sendAbandonedCartEmail } from "./hooks/send-abandoned-cart";
export type { SendAbandonedCartInput } from "./hooks/send-abandoned-cart";

// Low-level primitives.
export { sendEmail } from "./send";
export type { SendEmailOptions, SendEmailResult } from "./send";
export { getResendClient } from "./client";

// DTOs — exported so admin tools / preview routes can construct fake
// data without depending on Prisma generated types.
export type {
  EmailStoreDTO,
  EmailBuyerDTO,
  EmailOrderDTO,
  EmailOrderItemDTO,
  EmailCartItemDTO,
} from "./templates/types";
