-- Hand-written migration for the multi-tenant provisioning schema.
-- Apply via `psql $DATABASE_URL -f docs/multi-tenant-provisioning/migration.sql`
-- if you don't want to run `npx prisma migrate dev` interactively.
--
-- Safe to re-run: all DDL uses IF NOT EXISTS where Postgres allows it.
-- The CREATE TYPE blocks use a DO ... EXCEPTION block to be re-runnable.

BEGIN;

-- ─── enums ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "ShopDeploymentStatus" AS ENUM (
    'PENDING','CREATING_DROPLET','CONFIGURING_DNS','DEPLOYING_APP',
    'READY_FOR_WHITELIST','WHITELIST_REQUESTED','ACTIVE','SUSPENDED',
    'FAILED','ARCHIVED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentWhitelistStatus" AS ENUM (
    'NOT_REQUESTED','REQUESTED','CONFIRMED','REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProvisioningJobType" AS ENUM (
    'CREATE_DROPLET','WAIT_FOR_DROPLET_ACTIVE','CONFIGURE_DNS',
    'WAIT_FOR_APP_READY','REQUEST_PAYMENT_WHITELIST','HEALTH_CHECK',
    'DEPLOY_UPDATE','DESTROY_DROPLET','ROTATE_IP'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProvisioningJobStatus" AS ENUM (
    'QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── ShopDeployment ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "ShopDeployment" (
  "id"                              TEXT NOT NULL,
  "storeId"                         TEXT NOT NULL,
  "status"                          "ShopDeploymentStatus" NOT NULL DEFAULT 'PENDING',
  "doDropletId"                     BIGINT,
  "doRegion"                        TEXT,
  "doSize"                          TEXT,
  "doImageSnapshotId"               TEXT,
  "publicIpv4"                      TEXT,
  "publicIpv6"                      TEXT,
  "privateIpv4"                     TEXT,
  "cfRecordIdSubdomain"             TEXT,
  "cfRecordIdApex"                  TEXT,
  "cfRecordIdWww"                   TEXT,
  "customDomainVerified"            BOOLEAN NOT NULL DEFAULT false,
  "customDomainVerifiedAt"          TIMESTAMP(3),
  "customDomainLastChecked"         TIMESTAMP(3),
  "paymentWhitelistStatus"          "PaymentWhitelistStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
  "paymentWhitelistRequestedAt"     TIMESTAMP(3),
  "paymentWhitelistConfirmedAt"     TIMESTAMP(3),
  "paymentWhitelistConfirmedBy"     TEXT,
  "paymentWhitelistNote"            TEXT,
  "healthyAt"                       TIMESTAMP(3),
  "missedHealthChecks"              INTEGER NOT NULL DEFAULT 0,
  "snapshotVersion"                 TEXT,
  "runningVersion"                  TEXT,
  "lastError"                       TEXT,
  "lastErrorAt"                     TIMESTAMP(3),
  "createdAt"                       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"                       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShopDeployment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ShopDeployment_storeId_key"     ON "ShopDeployment"("storeId");
CREATE UNIQUE INDEX IF NOT EXISTS "ShopDeployment_publicIpv4_key"  ON "ShopDeployment"("publicIpv4");
CREATE        INDEX IF NOT EXISTS "ShopDeployment_status_idx"      ON "ShopDeployment"("status");
CREATE        INDEX IF NOT EXISTS "ShopDeployment_pgwl_status_idx" ON "ShopDeployment"("paymentWhitelistStatus");

DO $$ BEGIN
  ALTER TABLE "ShopDeployment"
    ADD CONSTRAINT "ShopDeployment_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── ProvisioningJob ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "ProvisioningJob" (
  "id"           TEXT NOT NULL,
  "deploymentId" TEXT NOT NULL,
  "type"         "ProvisioningJobType" NOT NULL,
  "status"       "ProvisioningJobStatus" NOT NULL DEFAULT 'QUEUED',
  "attempt"      INTEGER NOT NULL DEFAULT 1,
  "maxAttempts"  INTEGER NOT NULL DEFAULT 5,
  "inputJson"    JSONB,
  "outputJson"   JSONB,
  "errorMessage" TEXT,
  "errorJson"    JSONB,
  "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt"    TIMESTAMP(3),
  "finishedAt"   TIMESTAMP(3),
  "nextJobId"    TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProvisioningJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProvisioningJob_deployment_type_idx" ON "ProvisioningJob"("deploymentId","type");
CREATE INDEX IF NOT EXISTS "ProvisioningJob_status_sched_idx"    ON "ProvisioningJob"("status","scheduledFor");
CREATE INDEX IF NOT EXISTS "ProvisioningJob_type_status_idx"     ON "ProvisioningJob"("type","status");

DO $$ BEGIN
  ALTER TABLE "ProvisioningJob"
    ADD CONSTRAINT "ProvisioningJob_deploymentId_fkey"
    FOREIGN KEY ("deploymentId") REFERENCES "ShopDeployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;
