-- Link KYC wizard sessions to the vendor applicant.
-- Without user_id, a session is anonymous and the admin review queue
-- can't show whose documents are whose. Nullable so existing rows survive
-- the migration; new sessions populate it from the signed-in user.

ALTER TABLE "wizard_sessions"
  ADD COLUMN "user_id" TEXT;

ALTER TABLE "wizard_sessions"
  ADD CONSTRAINT "wizard_sessions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "wizard_sessions_user_id_idx" ON "wizard_sessions"("user_id");
