-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionTh" TEXT,
ADD COLUMN     "galleryUrls" JSONB,
ADD COLUMN     "hasVariants" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "titleTh" TEXT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "primaryColor" TEXT DEFAULT '#2563eb',
ADD COLUMN     "tagline" TEXT;

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "externalVariantId" TEXT NOT NULL,
    "sku" TEXT,
    "attributes" JSONB NOT NULL,
    "priceTHB" DECIMAL(12,2) NOT NULL,
    "imageUrl" TEXT,
    "inventory" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_externalVariantId_key" ON "ProductVariant"("productId", "externalVariantId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
