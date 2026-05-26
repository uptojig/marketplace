-- Chargeback / fraud-defense evidence for CreditTopup
--
-- Adds:
--   referenceNumber  - human-readable id (TOP-YYYYMMDD-XXXXXX)
--   ipAddress        - captured at intent creation time
--   userAgent        - captured at intent creation time
--   tosVersion       - which ToS doc revision the buyer accepted
--   tosAcceptedAt    - timestamp of the checkbox tick

ALTER TABLE "CreditTopup"
  ADD COLUMN "referenceNumber" TEXT,
  ADD COLUMN "ipAddress"       TEXT,
  ADD COLUMN "userAgent"       TEXT,
  ADD COLUMN "tosVersion"      TEXT,
  ADD COLUMN "tosAcceptedAt"   TIMESTAMP(3);

CREATE UNIQUE INDEX "CreditTopup_referenceNumber_key" ON "CreditTopup"("referenceNumber");
CREATE INDEX "CreditTopup_referenceNumber_idx" ON "CreditTopup"("referenceNumber");
