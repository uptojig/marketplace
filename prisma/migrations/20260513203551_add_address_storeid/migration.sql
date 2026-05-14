-- Phase 1C: scope Address by storeId for the per-store address book.
--
-- Per Q1=A from the architecture review, each store owns its own
-- customers + addresses (Shopify-style multi-tenant). Before this
-- migration `Address.userId` was the only scope key, so an address
-- saved at store A leaked into store B's checkout picker. After this
-- migration every read/write must include storeId.
--
-- ⚠️  Production rollout (HUMAN APPROVAL REQUIRED before applying):
--   1. Audit existing Address rows.
--      SELECT COUNT(*) FROM "Address";
--   2. If non-zero, run a per-user backfill picking the user's
--      most-recently-active store as the owning store:
--        UPDATE "Address" a SET "storeId" = (
--          SELECT o."storeId" FROM "Order" o
--          WHERE o."userId" = a."userId" AND o."storeId" IS NOT NULL
--          ORDER BY o."createdAt" DESC LIMIT 1
--        )
--        WHERE a."storeId" IS NULL;
--      For users with no orders, fall back to a store the user owns
--      (Store.ownerId = a.userId) or move the address to the first
--      APPROVED store in the system as a last-resort holding pen.
--   3. SELECT COUNT(*) FROM "Address" WHERE "storeId" IS NULL;
--      must return 0 before running step 4.
--   4. Run the ALTER TABLE … SET NOT NULL + index swap below.
--
-- Dev DB note: this migration is written for the fresh-column case
-- (no existing Address rows in dev). If your dev DB has Address rows
-- without a storeId you'll either need to (a) `TRUNCATE "Address";`
-- before applying, or (b) split the NOT NULL constraint off and run
-- the backfill from step 2 above first.

-- 1. Add storeId column. NOT NULL — every saved address now belongs
--    to exactly one (user, store) tuple. No default, since no sane
--    default exists for a foreign key.
ALTER TABLE "Address" ADD COLUMN "storeId" TEXT NOT NULL;

-- 2. Foreign key to Store. ON DELETE CASCADE so a deleted store
--    drops its address book along with its products/orders (same
--    policy as Address.userId → User).
ALTER TABLE "Address"
  ADD CONSTRAINT "Address_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Index swap: drop the single-column (userId) index in favour of a
--    composite (userId, storeId). Every Phase 1C query filters on the
--    tuple, so a single composite index serves both the userId-only
--    legacy path (left-prefix scan) and the new scoped path.
DROP INDEX "Address_userId_idx";
CREATE INDEX "Address_userId_storeId_idx" ON "Address"("userId", "storeId");
