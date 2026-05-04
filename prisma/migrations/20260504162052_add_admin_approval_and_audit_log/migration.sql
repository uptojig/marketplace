-- Admin approval workflow + audit log.
--
-- Policy:
--   - Existing stores are grandfathered as APPROVED so no live shop
--     disappears the moment this lands.
--   - New stores via /onboarding default to PENDING so admin must
--     review before they go live.
--   - Existing products are grandfathered as APPROVED. Per-product
--     moderation can be opted into per-store later via a settings
--     flag (separate change).

-- 1. StoreApprovalStatus enum + column on Store
CREATE TYPE "StoreApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- New column with default = PENDING (matches schema), but immediately
-- backfill existing rows to APPROVED so live stores keep working.
ALTER TABLE "Store" ADD COLUMN "approvalStatus" "StoreApprovalStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Store" ADD COLUMN "approvalNote" TEXT;
ALTER TABLE "Store" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "Store" ADD COLUMN "approvedById" TEXT;

UPDATE "Store" SET "approvalStatus" = 'APPROVED' WHERE "approvalStatus" = 'PENDING';

CREATE INDEX "Store_approvalStatus_idx" ON "Store"("approvalStatus");

-- 2. ProductModerationStatus enum + column on Product
CREATE TYPE "ProductModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Default APPROVED for new rows; existing rows automatically take
-- the default since the column is being added with a DEFAULT clause.
ALTER TABLE "Product" ADD COLUMN "moderationStatus" "ProductModerationStatus" NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Product" ADD COLUMN "moderationNote" TEXT;
ALTER TABLE "Product" ADD COLUMN "moderatedAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "moderatedById" TEXT;

CREATE INDEX "Product_moderationStatus_idx" ON "Product"("moderationStatus");

-- 3. AuditLog table — append-only ledger of admin actions
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "actorRole" "Role" NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
