-- Upload-based KYC wizard persistence.
-- DGA remains vendor-operated; the server stores uploaded evidence, OCR output,
-- match decisions, audit transitions, cost entries, and leased Outlook accounts.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "wizard_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "state" TEXT NOT NULL DEFAULT 'INIT',
  "citizen_id" VARCHAR(13),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "terminal_at" TIMESTAMP(3),
  "final_decision" TEXT,
  "pw_context_id" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',

  CONSTRAINT "wizard_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "wizard_sessions_state_expires_at_idx" ON "wizard_sessions"("state", "expires_at");
CREATE INDEX "wizard_sessions_citizen_id_idx" ON "wizard_sessions"("citizen_id");

CREATE TABLE "evidence" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "step" TEXT NOT NULL,
  "storage_key" TEXT NOT NULL,
  "sha256" CHAR(64) NOT NULL,
  "bytes" INTEGER NOT NULL,
  "mime" TEXT NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "source" TEXT NOT NULL,
  "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "evidence_session_id_captured_at_idx" ON "evidence"("session_id", "captured_at");
CREATE INDEX "evidence_step_idx" ON "evidence"("step");

ALTER TABLE "evidence"
  ADD CONSTRAINT "evidence_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "wizard_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ocr_results" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "evidence_id" UUID NOT NULL,
  "provider" TEXT NOT NULL,
  "raw_response" JSONB NOT NULL,
  "extracted" JSONB NOT NULL,
  "confidence" NUMERIC(4,3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ocr_results_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ocr_results_session_id_provider_idx" ON "ocr_results"("session_id", "provider");
CREATE INDEX "ocr_results_evidence_id_idx" ON "ocr_results"("evidence_id");

ALTER TABLE "ocr_results"
  ADD CONSTRAINT "ocr_results_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "wizard_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ocr_results"
  ADD CONSTRAINT "ocr_results_evidence_id_fkey"
  FOREIGN KEY ("evidence_id") REFERENCES "evidence"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "match_results" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "match_type" TEXT NOT NULL,
  "left_source" TEXT NOT NULL,
  "right_source" TEXT NOT NULL,
  "left_value" TEXT,
  "right_value" TEXT,
  "score" NUMERIC(6,3),
  "threshold" NUMERIC(6,3),
  "matched" BOOLEAN NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "match_results_session_id_match_type_idx" ON "match_results"("session_id", "match_type");
CREATE INDEX "match_results_matched_idx" ON "match_results"("matched");

ALTER TABLE "match_results"
  ADD CONSTRAINT "match_results_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "wizard_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "audit_log" (
  "id" BIGSERIAL NOT NULL,
  "session_id" UUID,
  "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actor" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "from_state" TEXT,
  "to_state" TEXT,
  "payload" JSONB NOT NULL DEFAULT '{}',

  CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_log_session_id_ts_idx" ON "audit_log"("session_id", "ts");
CREATE INDEX "audit_log_event_ts_idx" ON "audit_log"("event", "ts");

ALTER TABLE "audit_log"
  ADD CONSTRAINT "audit_log_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "wizard_sessions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "cost_log" (
  "id" BIGSERIAL NOT NULL,
  "session_id" UUID,
  "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "provider" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "units" NUMERIC(8,4) NOT NULL,
  "unit_type" TEXT NOT NULL,
  "unit_cost_thb" NUMERIC(8,4) NOT NULL,
  "cost_thb" NUMERIC(10,4) NOT NULL,
  "duration_ms" INTEGER NOT NULL,
  "http_status" INTEGER,

  CONSTRAINT "cost_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cost_log_session_id_ts_idx" ON "cost_log"("session_id", "ts");
CREATE INDEX "cost_log_provider_endpoint_idx" ON "cost_log"("provider", "endpoint");

ALTER TABLE "cost_log"
  ADD CONSTRAINT "cost_log_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "wizard_sessions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "outlook_pool" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "password_encrypted" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'available',
  "leased_to" UUID,
  "leased_at" TIMESTAMP(3),
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "outlook_pool_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "outlook_pool_email_key" ON "outlook_pool"("email");
CREATE INDEX "outlook_pool_status_idx" ON "outlook_pool"("status");
CREATE INDEX "outlook_pool_leased_to_idx" ON "outlook_pool"("leased_to");

ALTER TABLE "outlook_pool"
  ADD CONSTRAINT "outlook_pool_leased_to_fkey"
  FOREIGN KEY ("leased_to") REFERENCES "wizard_sessions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
