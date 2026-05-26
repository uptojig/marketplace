-- Customer product reviews (Phase 1)
--
-- One Review row per (userId, productId). Moderation soft-delete via
-- `hidden` boolean so the row stays for audit but doesn't render on
-- the storefront. "Verified Purchase" is computed at read time, not
-- stored, so the badge stays accurate if an unlock is revoked.

CREATE TABLE "Review" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "productId"  TEXT NOT NULL,
    "storeId"    TEXT NOT NULL,
    "rating"     INTEGER NOT NULL,
    "title"      TEXT,
    "body"       TEXT NOT NULL,
    "hidden"     BOOLEAN NOT NULL DEFAULT false,
    "hiddenById" TEXT,
    "hiddenAt"   TIMESTAMP(3),
    "hiddenNote" TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");
CREATE INDEX "Review_productId_hidden_createdAt_idx" ON "Review"("productId", "hidden", "createdAt");
CREATE INDEX "Review_storeId_hidden_idx" ON "Review"("storeId", "hidden");

ALTER TABLE "Review"
    ADD CONSTRAINT "Review_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
    ADD CONSTRAINT "Review_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
    ADD CONSTRAINT "Review_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
