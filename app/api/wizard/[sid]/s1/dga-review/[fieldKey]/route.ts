import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  buildChecklist,
  // buildChecklist is enough for the response — every PATCH returns the
  // full checklist so the UI can re-render without a separate GET.
} from "@/lib/kyc/dga-image-processor";
import {
  DGA_REQUIRED_KEYS,
  DGA_OPTIONAL_KEYS,
  getFieldRule,
  isLockedField,
  type DgaFieldKey,
} from "@/lib/kyc/dga-fields";
import { auditWizardEvent, transitionWizardSession, invalidateWizardSteps } from "@/lib/kyc/wizard-state";
import {
  createStopwatch,
  jsonError,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// S1_DGA_REVIEW — single-field edit. Vendor PATCHes one field value at a
// time (debounced from the UI on input blur). The first edit captures
// `originalValue` so the UI can show "OCR อ่านได้: <old>" beside the
// (now possibly different) current value. Cross-match uses the post-edit
// value; provenance lives in `originalValue` for audit.

const PatchBodySchema = z.object({
  value: z.string().min(1, "value cannot be empty").max(500, "value is too long"),
});

const ALL_FIELD_KEYS = new Set<DgaFieldKey>([
  ...DGA_REQUIRED_KEYS,
  ...DGA_OPTIONAL_KEYS,
]);

export async function PATCH(
  req: Request,
  { params }: { params: { sid: string; fieldKey: string } },
) {
  const sw = createStopwatch();

  try {
    const session = await requireWizardSession(params.sid);
    const ACTIVE_FLOW_STATES = [
      "S1_DGA_REVIEW",
      "S2_ID_SELFIE",
      "S3_PHONE_RESPONSE",
      "S4_BANKBOOK_UPLOAD",
      "S5_SUMMARY",
    ];
    if (!ACTIVE_FLOW_STATES.includes(session.state)) {
      return jsonError(`Expected active wizard session, got ${session.state}`, 409);
    }

    if (session.state !== "S1_DGA_REVIEW") {
      await transitionWizardSession({
        sessionId: params.sid,
        toState: "S1_DGA_REVIEW",
        actor: "vendor",
        event: "s1.dga_review.reopened_field_edit",
        payload: { priorState: session.state },
      });
      await invalidateWizardSteps(params.sid, "S1_DGA_REVIEW");
    }

    if (!ALL_FIELD_KEYS.has(params.fieldKey as DgaFieldKey)) {
      return jsonError(`Unknown DGA field key: ${params.fieldKey}`, 400);
    }

    if (isLockedField(params.fieldKey)) {
      return jsonError(
        `Field is locked and cannot be edited: ${params.fieldKey}. ` +
          `Upload a clearer DGA screenshot instead.`,
        400,
        { fieldKey: params.fieldKey, locked: true },
      );
    }

    const rule = getFieldRule(params.fieldKey);
    if (!rule) return jsonError(`Field rule not found: ${params.fieldKey}`, 500);

    const body = PatchBodySchema.parse(await req.json());
    const newValue = body.value.trim();

    const existing = await prisma.wizardDgaField.findUnique({
      where: {
        sessionId_fieldKey: { sessionId: params.sid, fieldKey: params.fieldKey },
      },
      select: {
        value: true,
        originalValue: true,
        editedByUser: true,
        evidenceId: true,
      },
    });

    if (!existing) {
      return jsonError(
        `Field has no row yet — cannot edit a field that was never captured: ${params.fieldKey}`,
        404,
      );
    }

    if (existing.value === newValue) {
      // No-op: return current checklist without writing a row or audit.
      return NextResponse.json({
        ok: true,
        checklist: await buildChecklist(params.sid),
        _timings_ms: sw.snapshot(),
      });
    }

    const evaluation = rule.evaluate(newValue);
    // Preserve the FIRST OCR-extracted value. Subsequent edits keep the
    // original original (don't overwrite on every edit) so audit reflects
    // OCR-vs-final, not edit-vs-edit.
    const originalValue = existing.originalValue ?? existing.value;

    await prisma.wizardDgaField.update({
      where: {
        sessionId_fieldKey: { sessionId: params.sid, fieldKey: params.fieldKey },
      },
      data: {
        value: newValue,
        originalValue,
        editedByUser: true,
        editedAt: new Date(),
        shapeOk: evaluation.state === "captured",
        warning:
          evaluation.state === "captured_warn" ? evaluation.warning ?? null : null,
      },
    });

    await auditWizardEvent({
      sessionId: params.sid,
      actor: "vendor",
      event: "s1.dga_review.field_edited",
      payload: {
        field_key: params.fieldKey,
        original_value: originalValue,
        previous_value: existing.value,
        new_value: newValue,
        shape_ok: evaluation.state === "captured",
        warning:
          evaluation.state === "captured_warn" ? evaluation.warning ?? null : null,
      },
    });

    const checklist = await buildChecklist(params.sid);
    return NextResponse.json({
      ok: true,
      checklist,
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("Invalid request body", 400, { issues: error.issues });
    }
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
