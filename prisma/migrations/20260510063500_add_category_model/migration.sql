-- Vendor-managed product categories.
--
-- Adds a Category table (per-store grouping with slug + banner image)
-- and a nullable Product.categoryId FK so products can be bulk-assigned.
-- Product.categoryName is retained as a denormalized fallback so legacy
-- supplier-imported rows keep displaying their supplier category until
-- the operator buckets them into a real Category.

-- 1. Category table
CREATE TABLE "Category" (
  "id"          TEXT NOT NULL,
  "storeId"     TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "description" TEXT,
  "bannerUrl"   TEXT,
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Slugs unique per store (different stores can both have "shoes")
CREATE UNIQUE INDEX "Category_storeId_slug_key" ON "Category"("storeId", "slug");
CREATE INDEX "Category_storeId_sortOrder_idx" ON "Category"("storeId", "sortOrder");

ALTER TABLE "Category"
  ADD CONSTRAINT "Category_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Product.categoryId FK — nullable, ON DELETE SET NULL so deleting
--    a Category orphans rather than removing the products.
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
