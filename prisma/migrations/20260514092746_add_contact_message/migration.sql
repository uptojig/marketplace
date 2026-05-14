-- Add ContactMessage model — persists submissions from /stores/<slug>/contact
-- so vendors can find buyer messages in the dashboard inbox even when
-- email delivery (Resend) is misconfigured or the store hasn't set
-- contactEmail. Email-send remains best-effort; the DB row is the
-- canonical source of truth for the inbox UI.
--
-- Hand-authored because the dev DB at localhost:5432 was unreachable
-- when running `prisma migrate dev --create-only` (P1001 — same path
-- PR #39 used). Rerun `prisma migrate dev` against a live dev DB if
-- you want Prisma to regenerate this file from the schema diff.
--
-- Production rollout (HUMAN APPROVAL REQUIRED before applying):
--   1. This is purely additive — new table + 2 indexes. No existing
--      data is rewritten. Safe to apply in a single transaction.
--   2. Backfill is a no-op: there are no historical contact-form
--      submissions to import (PR #56 only emailed; never persisted).
--      The first row will land via the next /api/stores/<slug>/contact
--      POST after the deploy.
--   3. After apply: run `SELECT COUNT(*) FROM "ContactMessage";` to
--      confirm the table exists. It should return 0.

CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    -- Null = unread; populated = the moment the vendor (or admin)
    -- toggled the row to "read" via the dashboard.
    "readAt" TIMESTAMP(3),
    -- Audit who marked it — distinct from any vendor reading via the
    -- mailto link. Multiple operators can share an inbox via the
    -- dashboard store picker, so we want to know which one ack'd it.
    "readById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- Foreign key to Store. ON DELETE CASCADE so deleting a store also
-- drops its inbox (mirrors the Address / Order behaviour).
ALTER TABLE "ContactMessage"
    ADD CONSTRAINT "ContactMessage_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Inbox list query: WHERE storeId = ? ORDER BY createdAt DESC
CREATE INDEX "ContactMessage_storeId_createdAt_idx"
    ON "ContactMessage"("storeId", "createdAt");

-- Sidebar unread-count query: WHERE storeId = ? AND readAt IS NULL
-- (left-prefix scan also serves the read-vs-unread tab filter).
CREATE INDEX "ContactMessage_storeId_readAt_idx"
    ON "ContactMessage"("storeId", "readAt");
