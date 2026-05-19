-- S1 v2: incremental multi-image DGA capture
-- Accumulating label→value checklist per session.
-- See prisma/schema.prisma model WizardDgaField for context.

CREATE TABLE "dga_fields" (
    "id"          UUID NOT NULL,
    "session_id"  UUID NOT NULL,
    "field_key"   TEXT NOT NULL,
    "value"       TEXT NOT NULL,
    "evidence_id" UUID NOT NULL,
    "confidence"  DECIMAL(4,3),
    "shape_ok"    BOOLEAN NOT NULL DEFAULT true,
    "warning"     TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dga_fields_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "dga_fields_session_id_field_key_key"
    ON "dga_fields"("session_id", "field_key");

CREATE INDEX "dga_fields_session_id_idx"
    ON "dga_fields"("session_id");

CREATE INDEX "dga_fields_evidence_id_idx"
    ON "dga_fields"("evidence_id");

ALTER TABLE "dga_fields"
    ADD CONSTRAINT "dga_fields_session_id_fkey"
    FOREIGN KEY ("session_id") REFERENCES "wizard_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dga_fields"
    ADD CONSTRAINT "dga_fields_evidence_id_fkey"
    FOREIGN KEY ("evidence_id") REFERENCES "evidence"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
