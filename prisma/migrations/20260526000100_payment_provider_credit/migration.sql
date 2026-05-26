-- PaymentProvider.CREDIT — orders paid by burning the buyer's per-store
-- credit balance. The Payment row still exists for audit, but no AnyPay
-- transaction is associated; anypayTransactionId stays NULL.

ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'CREDIT';
