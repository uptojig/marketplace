-- ── Gift purchases for DIGITAL products ─────────────────────────────────
--
-- Each OrderItem can now have multiple DigitalUnlocks — one per gift
-- recipient (the buyer themselves counts as "1 recipient" for non-gift
-- purchases). The orderItemId @unique constraint on DigitalUnlock is
-- dropped to allow N unlocks per line. We add `recipientEmail` +
-- `recipientName` + `giftMessage` + `accessToken` so gift recipients
-- can access via /unlock/<token> without signing up.

-- Drop the legacy 1:1 unique so we can have multiple unlocks per line.
DROP INDEX "DigitalUnlock_orderItemId_key";

-- Add the new gift-mode columns. All nullable so existing self-purchase
-- rows (recipientEmail IS NULL → buyer's own unlock) keep working.
ALTER TABLE "DigitalUnlock"
  ADD COLUMN "recipientEmail" TEXT,
  ADD COLUMN "recipientName"  TEXT,
  ADD COLUMN "giftMessage"    TEXT,
  ADD COLUMN "accessToken"    TEXT;

-- Guest-access token must be globally unique so the URL can't collide.
-- NULLs are allowed (Postgres treats NULLs as distinct in unique index).
CREATE UNIQUE INDEX "DigitalUnlock_accessToken_key" ON "DigitalUnlock"("accessToken");

-- Help the buyer/recipient lookup paths.
CREATE INDEX "DigitalUnlock_orderItemId_idx" ON "DigitalUnlock"("orderItemId");
CREATE INDEX "DigitalUnlock_recipientEmail_idx" ON "DigitalUnlock"("recipientEmail");

-- Snapshot of the gift recipients at order placement time. We never
-- mutate this column — the post-PAID hook reads it to create one
-- DigitalUnlock per recipient (with accessToken + recipientEmail).
ALTER TABLE "OrderItem"
  ADD COLUMN "giftRecipientsJson" JSONB;
