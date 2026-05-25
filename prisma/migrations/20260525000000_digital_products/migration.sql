-- Digital products (Phase 1) — additive only, doesn't touch the
-- existing CJ Dropshipping (physical) pipeline.
--
-- Adds:
--   1. ProductType + DigitalKind enums
--   2. Product.productType / digitalKind / promptText / promptSample columns
--   3. DigitalAsset table (file uploads: PDF, XLSX, AI, ZIP, ...)
--   4. DigitalUnlock table (per-buyer post-payment access record)

-- 1. Enums
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL');
CREATE TYPE "DigitalKind" AS ENUM ('EBOOK', 'EXCEL', 'VECTOR', 'PROMPT', 'ARCHIVE', 'OTHER');

-- 2. Product columns
ALTER TABLE "Product" ADD COLUMN "productType"  "ProductType" NOT NULL DEFAULT 'PHYSICAL';
ALTER TABLE "Product" ADD COLUMN "digitalKind"  "DigitalKind";
ALTER TABLE "Product" ADD COLUMN "promptText"   TEXT;
ALTER TABLE "Product" ADD COLUMN "promptSample" TEXT;

CREATE INDEX "Product_productType_idx" ON "Product"("productType");

-- 3. DigitalAsset
CREATE TABLE "DigitalAsset" (
  "id"         TEXT NOT NULL,
  "productId"  TEXT NOT NULL,
  "fileName"   TEXT NOT NULL,
  "fileFormat" TEXT NOT NULL,
  "fileSizeMB" DOUBLE PRECISION NOT NULL,
  "storageKey" TEXT NOT NULL,
  "isPreview"  BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DigitalAsset_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "DigitalAsset"
  ADD CONSTRAINT "DigitalAsset_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "DigitalAsset_productId_idx" ON "DigitalAsset"("productId");

-- 4. DigitalUnlock
CREATE TABLE "DigitalUnlock" (
  "id"            TEXT NOT NULL,
  "userId"        TEXT NOT NULL,
  "productId"     TEXT NOT NULL,
  "orderItemId"   TEXT NOT NULL,
  "licenseKey"    TEXT NOT NULL,
  "downloadCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt"     TIMESTAMP(3),
  "revokedAt"     TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DigitalUnlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DigitalUnlock_orderItemId_key" ON "DigitalUnlock"("orderItemId");
CREATE UNIQUE INDEX "DigitalUnlock_licenseKey_key" ON "DigitalUnlock"("licenseKey");
CREATE INDEX "DigitalUnlock_userId_idx"    ON "DigitalUnlock"("userId");
CREATE INDEX "DigitalUnlock_productId_idx" ON "DigitalUnlock"("productId");

ALTER TABLE "DigitalUnlock"
  ADD CONSTRAINT "DigitalUnlock_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DigitalUnlock"
  ADD CONSTRAINT "DigitalUnlock_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DigitalUnlock"
  ADD CONSTRAINT "DigitalUnlock_orderItemId_fkey"
  FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
