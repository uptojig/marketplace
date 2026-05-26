-- ── CreditTxType enum ──────────────────────────────────────────────────
CREATE TYPE "CreditTxType" AS ENUM ('TOPUP', 'SPEND', 'REFUND', 'ADJUST');

-- ── CreditTopupStatus enum ─────────────────────────────────────────────
CREATE TYPE "CreditTopupStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');

-- ── CreditBalance ──────────────────────────────────────────────────────
CREATE TABLE "CreditBalance" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "storeId"    TEXT NOT NULL,
    "balanceTHB" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditBalance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreditBalance_userId_storeId_key" ON "CreditBalance"("userId", "storeId");
CREATE INDEX "CreditBalance_storeId_idx" ON "CreditBalance"("storeId");

ALTER TABLE "CreditBalance"
    ADD CONSTRAINT "CreditBalance_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CreditBalance"
    ADD CONSTRAINT "CreditBalance_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── CreditLedger ───────────────────────────────────────────────────────
CREATE TABLE "CreditLedger" (
    "id"            TEXT NOT NULL,
    "balanceId"     TEXT NOT NULL,
    "type"          "CreditTxType" NOT NULL,
    "amountTHB"     DECIMAL(12,2) NOT NULL,
    "balanceAfter"  DECIMAL(12,2) NOT NULL,
    "orderId"       TEXT,
    "topupId"       TEXT,
    "note"          TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CreditLedger_balanceId_createdAt_idx" ON "CreditLedger"("balanceId", "createdAt");
CREATE INDEX "CreditLedger_orderId_idx" ON "CreditLedger"("orderId");
CREATE INDEX "CreditLedger_topupId_idx" ON "CreditLedger"("topupId");

ALTER TABLE "CreditLedger"
    ADD CONSTRAINT "CreditLedger_balanceId_fkey"
    FOREIGN KEY ("balanceId") REFERENCES "CreditBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── CreditTopup ────────────────────────────────────────────────────────
CREATE TABLE "CreditTopup" (
    "id"                  TEXT NOT NULL,
    "userId"              TEXT NOT NULL,
    "storeId"             TEXT NOT NULL,
    "amountTHB"           DECIMAL(12,2) NOT NULL,
    "status"              "CreditTopupStatus" NOT NULL DEFAULT 'PENDING',
    "anypayTransactionId" TEXT,
    "paymentUrl"          TEXT,
    "paidAt"              TIMESTAMP(3),
    "rawCreateResponse"   JSONB,
    "rawWebhookPayload"   JSONB,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditTopup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreditTopup_anypayTransactionId_key" ON "CreditTopup"("anypayTransactionId");
CREATE INDEX "CreditTopup_userId_status_idx" ON "CreditTopup"("userId", "status");
CREATE INDEX "CreditTopup_storeId_idx" ON "CreditTopup"("storeId");

ALTER TABLE "CreditTopup"
    ADD CONSTRAINT "CreditTopup_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CreditTopup"
    ADD CONSTRAINT "CreditTopup_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

