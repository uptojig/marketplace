-- Add vendor reply audit columns to ContactMessage.
--
-- Vendors can now reply to contact-form messages via Resend directly
-- from /dashboard/store/messages/<id>. The reply body is persisted
-- BEFORE the Resend call so:
--   • the dashboard transcript always reflects what the vendor
--     attempted, even if the email provider rejects the send;
--   • a Resend failure surfaces a "retry" affordance in the UI
--     without losing the typed body.
--
-- Hand-authored because the dev DB at localhost:5432 was unreachable
-- when running `prisma migrate dev --create-only` (P1001 — same path
-- PR #61 used). Rerun `prisma migrate dev` against a live dev DB if
-- you want Prisma to regenerate this file from the schema diff.
--
-- Production rollout (HUMAN APPROVAL REQUIRED before applying):
--   1. Purely additive — three nullable columns on an existing
--      table. No locks, no rewrites, no backfill required. Safe to
--      apply in a single transaction even on a hot table.
--   2. Existing rows get NULL for all three columns, which the
--      detail page already handles ("ยังไม่ได้ตอบกลับ" surface).
--   3. After apply: run
--      `SELECT COUNT(*) FROM "ContactMessage" WHERE "repliedAt" IS NOT NULL;`
--      to confirm the column exists. Should return 0 on the first
--      deploy.

ALTER TABLE "ContactMessage"
    -- Stamp of when the vendor's reply email was attempted.
    -- Persisted even when Resend fails so the UI can show "ส่งครั้ง
    -- สุดท้าย: HH:MM" alongside the retry button.
    ADD COLUMN "repliedAt" TIMESTAMP(3),
    -- Audit who sent the reply — useful in the multi-vendor case
    -- where multiple operators share an inbox.
    ADD COLUMN "repliedById" TEXT,
    -- Snapshot of the body text the vendor sent. The dashboard
    -- transcript reads from this column directly; we don't query
    -- Resend for delivery state.
    ADD COLUMN "replyBody" TEXT;
