-- AlterTable
ALTER TABLE "Store"
  ADD COLUMN "companyName"  TEXT,
  ADD COLUMN "taxId"        TEXT,
  ADD COLUMN "addressLine1" TEXT,
  ADD COLUMN "addressLine2" TEXT,
  ADD COLUMN "subdistrict"  TEXT,
  ADD COLUMN "district"     TEXT,
  ADD COLUMN "province"     TEXT,
  ADD COLUMN "postalCode"   TEXT,
  ADD COLUMN "country"      TEXT DEFAULT 'TH',
  ADD COLUMN "messengerUrl" TEXT,
  ADD COLUMN "twitterUrl"   TEXT,
  ADD COLUMN "instagramUrl" TEXT,
  ADD COLUMN "websiteUrl"   TEXT;
