-- CreateEnum
CREATE TYPE "IdentityVerificationStatus" AS ENUM ('PENDING', 'EMAIL_VERIFIED', 'KYC_VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Store"
  ADD COLUMN "platformEmail"              TEXT,
  ADD COLUMN "platformEmailForwardTo"     TEXT,
  ADD COLUMN "platformEmailVerified"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "platformEmailVerifiedAt"    TIMESTAMP(3),
  ADD COLUMN "platformEmailProvisionedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Store_platformEmail_key" ON "Store"("platformEmail");

-- CreateTable
CREATE TABLE "IdentityVerification" (
    "id"              TEXT NOT NULL,
    "storeId"         TEXT NOT NULL,
    "status"          "IdentityVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "emailVerifiedAt" TIMESTAMP(3),
    "kycSubmittedAt"  TIMESTAMP(3),
    "kycReviewedAt"   TIMESTAMP(3),
    "kycEvidence"     JSONB,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdentityVerification_storeId_key" ON "IdentityVerification"("storeId");

-- AddForeignKey
ALTER TABLE "IdentityVerification" ADD CONSTRAINT "IdentityVerification_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
