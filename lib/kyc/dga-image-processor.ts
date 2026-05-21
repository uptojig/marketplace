// S1 v2: shared per-image worker + finalize helper.
//
// Each S1 v2 endpoint (add-image, checklist, delete-image, finalize) is a
// thin wrapper around the helpers in this file. The route handles HTTP /
// SSE framing; the heavy lifting (OCR, redact, UPSERT, transition) is
// here so all four endpoints share the same business logic.

import { prisma } from "@/lib/prisma";
import { recordIappCost } from "@/lib/kyc/cost-tracker";
import {
  buildChecklistFromRows,
  extractFieldsFromIdentity,
  identityFromRows,
  getFieldRule,
  readyToFinalize,
  type ChecklistEntry,
} from "@/lib/kyc/dga-fields";
import { runDgaOcrPipeline } from "@/lib/kyc/dga-ocr-pipeline";
import { compareDgaAddressesByHouseNumber } from "@/lib/kyc/identity-match";
import { redactDgaSensitiveRegions, redactDgaUsernameText, type DgaRedactionStatus } from "@/lib/kyc/image-redaction";
import {
  DGA_PROVIDER,
  fileToBuffer,
  lapAndEmit,
  saveOcrResult,
  type SSEStream,
  type Stopwatch,
} from "@/lib/kyc/wizard-api";
import { auditWizardEvent, invalidateWizardSteps, transitionWizardSession } from "@/lib/kyc/wizard-state";
import { uploadWizardEvidence } from "@/lib/kyc/wizard-storage";
import { presignDownload } from "@/lib/storage/spaces";
import type { Identity } from "@/types/identity";

export interface ProcessImageResult {
  evidenceId: string;
  imageUrl: string;
  imageNumber: number;
  redacted: boolean;
  redactedRegionCount: number;
  redactionRequired: boolean;
  redactionStatus: DgaRedactionStatus;
  fieldsCaptured: number;
  checklist: ChecklistEntry[];
  imageCount: number;
  readyToFinalize: boolean;
}

/**
 * Process one uploaded image: dual OCR (ocrDocument + ocrDocumentLayout),
 * extract identity, auto-redact username if anchor present, upload the
 * resulting buffer to Spaces, and UPSERT every field the parser extracted.
 *
 * Returns the updated checklist so the route can ship it back to the
 * client in the same response (no second round-trip needed).
 */
export async function processDgaImage(args: {
  sessionId: string;
  image: File;
  sw: Stopwatch;
  sse: SSEStream | null;
}): Promise<ProcessImageResult> {
  const { sessionId, image, sw, sse } = args;
  lapAndEmit(sw, sse, "session_check");

  const buffer = await fileToBuffer(image);
  lapAndEmit(sw, sse, "form_parse");

  // Dual call — verified necessary in Phase 1. Layout-only garbles names
  // and addresses because of overlapping Figure/Table components. We need
  // ocrDocument for clean reading-order text AND ocrDocumentLayout for
  // username-anchor bbox detection.
  const [ocrPipeline, redaction] = await Promise.all([
    runDgaOcrPipeline(buffer),
    redactDgaSensitiveRegions(buffer),
  ]);
  lapAndEmit(sw, sse, "ocr_and_redact_parallel");

  await Promise.all([
    ...ocrPipeline.costEntries.map((entry) =>
      recordIappCost({
        sessionId,
        endpoint: entry.endpoint,
        ic: entry.ic,
        ms: entry.ms,
      }),
    ),
    recordIappCost({
      sessionId,
      endpoint: "document-layout-dga-redact",
      ic: redaction.ic,
      ms: redaction.ms,
    }),
  ]);

  const selectedPass = ocrPipeline.selected;
  const sanitizedUsernameText = redactDgaUsernameText(selectedPass.cleanedOcr.text ?? []);
  const redactionRequired = redaction.redactionRequired || sanitizedUsernameText.redactionRequired;
  const redactionStatus: DgaRedactionStatus =
    redactionRequired && !redaction.blurredChanged
      ? "failed"
      : redaction.redactionStatus;

  if (redactionRequired && redactionStatus === "failed") {
    throw new Error("Unable to redact DGA username; upload a clearer screenshot");
  }

  const redactedRegions = redaction.regions.map((region) => ({
    bbox: region.bbox,
    component_type: region.component_type,
    reason: region.reason,
  }));

  const redactionTelemetry = {
    redacted: redaction.blurredChanged,
    redaction_required: redactionRequired,
    redaction_status: redactionStatus,
    username_anchor_count: redaction.anchorCount,
    username_candidate_count: redaction.candidateCount,
    username_text_redaction_count: sanitizedUsernameText.redactedCount,
    redacted_regions: redactedRegions,
    layout_ocr_ic: redaction.ic,
    layout_ocr_ms: redaction.ms,
  };

  // Use redacted buffer for storage if redaction actually changed anything;
  // otherwise upload the original (the image had no username on it).
  const uploadBuffer = redaction.blurredChanged ? redaction.buffer : buffer;
  const wasRedacted = redaction.blurredChanged;

  const evidence = await uploadWizardEvidence({
    sessionId,
    step: "S1_DGA_CAPTURE",
    buffer: uploadBuffer,
    mime: image.type || "image/png",
    filename: image.name,
  });
  const evidenceUrl = await presignDownload({ key: evidence.storageKey });
  lapAndEmit(sw, sse, "evidence_upload");

  // selectedPass.identity was extracted from cleaned OCR with browser-chrome
  // lines removed by the pipeline. We only sanitize username text for storage.
  const identity = selectedPass.identity;
  const cleanedOcrForStorage = {
    ...selectedPass.cleanedOcr,
    text: sanitizedUsernameText.pages,
  };

  // Count existing S1 DGA images for this session BEFORE inserting new
  // evidence row's effect — use evidence row count instead since we just
  // inserted one. imageNumber = number of S1 images so far.
  const imageCount = await prisma.wizardEvidence.count({
    where: { sessionId, step: "S1_DGA_CAPTURE" },
  });

  // Save raw OCR row for forensic trace (provider = dga_image_<N>).
  await saveOcrResult({
    sessionId,
    evidenceId: evidence.id,
    provider: `${DGA_PROVIDER}_image_${imageCount}`,
    rawResponse: {
      ...cleanedOcrForStorage,
      pipeline: {
        selected_pass: selectedPass.name,
        selected_score: selectedPass.score,
        missing_required: selectedPass.missingRequired,
        missing_critical: selectedPass.missingCritical,
        passes: ocrPipeline.passes.map((item) => ({
          pass: item.name,
          width: item.width,
          height: item.height,
          score: item.score,
          required_filled: item.requiredFilled,
          missing_required: item.missingRequired,
          missing_critical: item.missingCritical,
        })),
      },
      layout: redactionTelemetry,
    },
    extracted: identity,
  });

  // UPSERT every field the parser pulled — last-write-wins by (sessionId,
  // fieldKey). Each row is tagged with the evidenceId that contributed it,
  // so deletion of an image cascades the rows it owned.
  const extracted = extractFieldsFromIdentity(identity);
  let fieldsCaptured = 0;
  for (const [key, value] of extracted) {
    const rule = getFieldRule(key);
    if (!rule) continue;
    const evaluation = rule.evaluate(value);
    await prisma.wizardDgaField.upsert({
      where: { sessionId_fieldKey: { sessionId, fieldKey: key } },
      create: {
        sessionId,
        fieldKey: key,
        value,
        evidenceId: evidence.id,
        shapeOk: evaluation.state === "captured",
        warning: evaluation.state === "captured_warn" ? evaluation.warning ?? null : null,
      },
      update: {
        value,
        evidenceId: evidence.id,
        shapeOk: evaluation.state === "captured",
        warning: evaluation.state === "captured_warn" ? evaluation.warning ?? null : null,
      },
    });
    fieldsCaptured += 1;
  }
  lapAndEmit(sw, sse, "field_upsert");

  // Audit — capture redaction metadata + which fields this image contributed.
  await auditWizardEvent({
    sessionId,
    actor: "system",
    event: "s1.dga.image_added",
    payload: {
      evidence_id: evidence.id,
      image_number: imageCount,
      redacted: wasRedacted,
      redaction_required: redactionRequired,
      redaction_status: redactionStatus,
      redacted_regions: redactedRegions,
      username_anchor_count: redaction.anchorCount,
      username_candidate_count: redaction.candidateCount,
      username_text_redaction_count: sanitizedUsernameText.redactedCount,
      browser_chrome_excluded: selectedPass.excludedBrowserChrome,
      ocr_selected_pass: selectedPass.name,
      ocr_passes: ocrPipeline.passes.map((item) => ({
        pass: item.name,
        score: item.score,
        required_filled: item.requiredFilled,
        missing_required: item.missingRequired,
        missing_critical: item.missingCritical,
      })),
      fields_contributed: Array.from(extracted.keys()),
      timings_ms: sw.snapshot(),
    },
  });

  const checklist = await buildChecklist(sessionId);

  return {
    evidenceId: evidence.id,
    imageUrl: evidenceUrl,
    imageNumber: imageCount,
    redacted: wasRedacted,
    redactedRegionCount: redaction.regions.length,
    redactionRequired,
    redactionStatus,
    fieldsCaptured,
    checklist,
    imageCount,
    readyToFinalize: readyToFinalize(checklist),
  };
}

// Shared select shape for checklist queries — keep all callers in sync so
// rows can flow into `buildChecklistFromRows` without rebuilding the map.
const DGA_FIELD_SELECT = {
  fieldKey: true,
  value: true,
  evidenceId: true,
  shapeOk: true,
  warning: true,
  confidence: true,
  originalValue: true,
  editedByUser: true,
} as const;

/**
 * Load all S1 DGA field rows for a session and turn them into the
 * checklist UI representation. Includes both required and optional keys.
 */
export async function buildChecklist(sessionId: string): Promise<ChecklistEntry[]> {
  const rows = await prisma.wizardDgaField.findMany({
    where: { sessionId },
    orderBy: { updatedAt: "asc" },
    select: DGA_FIELD_SELECT,
  });
  return buildChecklistFromRows(
    rows.map((r) => ({
      fieldKey: r.fieldKey,
      value: r.value,
      evidenceId: r.evidenceId,
      shapeOk: r.shapeOk,
      warning: r.warning,
      confidence: r.confidence?.toNumber() ?? null,
      originalValue: r.originalValue,
      editedByUser: r.editedByUser,
    })),
  );
}

/**
 * List of evidence rows + their contribution counts. Used by the UI to
 * render the thumbnail grid + "ลบ" buttons.
 */
export async function listImages(sessionId: string) {
  const evidence = await prisma.wizardEvidence.findMany({
    where: { sessionId, step: "S1_DGA_CAPTURE" },
    orderBy: { capturedAt: "asc" },
    select: {
      id: true,
      storageKey: true,
      mime: true,
      bytes: true,
      width: true,
      height: true,
      capturedAt: true,
      dgaFields: {
        select: { fieldKey: true },
      },
    },
  });
  return Promise.all(
    evidence.map(async (e) => ({
      id: e.id,
      mime: e.mime,
      bytes: e.bytes,
      width: e.width,
      height: e.height,
      capturedAt: e.capturedAt,
      url: await presignDownload({ key: e.storageKey }),
      fieldsContributed: e.dgaFields.map((f) => f.fieldKey),
    })),
  );
}

/**
 * Delete a single uploaded image. The DB foreign key (onDelete: Cascade)
 * removes the dga_fields rows it contributed, leaving fields from other
 * images intact. Caller must re-fetch the checklist after this.
 */
export async function removeImage(args: { sessionId: string; evidenceId: string }) {
  const { sessionId, evidenceId } = args;
  const evidence = await prisma.wizardEvidence.findFirst({
    where: { id: evidenceId, sessionId, step: "S1_DGA_CAPTURE" },
    select: { id: true, dgaFields: { select: { fieldKey: true } } },
  });
  if (!evidence) {
    throw new Error("Evidence not found or not part of this session");
  }
  // Cascade deletes dga_fields owned by this evidence + ocr_results too.
  await prisma.wizardEvidence.delete({ where: { id: evidenceId } });
  await auditWizardEvent({
    sessionId,
    actor: "system",
    event: "s1.dga.image_removed",
    payload: {
      evidence_id: evidenceId,
      fields_removed: evidence.dgaFields.map((f) => f.fieldKey),
    },
  });
}

/**
 * First gate (S1_DGA_CAPTURE → S1_DGA_REVIEW). Validates that all 9
 * required fields have a non-missing row, then transitions the session
 * into the review phase where the vendor can correct OCR mistakes.
 *
 * No canonical `dga` provider row is written here — values may still
 * change during REVIEW, so we defer that write to `finalizeDgaReview`.
 */
export async function finalizeDgaCapture(args: {
  sessionId: string;
  sw: Stopwatch;
  sse: SSEStream | null;
}): Promise<{
  ok: boolean;
  state: string;
  missing?: string[];
  checklist: ChecklistEntry[];
}> {
  const { sessionId, sw, sse } = args;
  lapAndEmit(sw, sse, "session_check");

  const checklist = await buildChecklist(sessionId);

  const missingRequired = checklist
    .filter((e) => e.required && e.state === "missing")
    .map((e) => e.key);

  if (missingRequired.length > 0) {
    return {
      ok: false,
      state: "S1_DGA_CAPTURE",
      missing: missingRequired,
      checklist,
    };
  }

  const updated = await transitionWizardSession({
    sessionId,
    toState: "S1_DGA_REVIEW",
    actor: "system",
    event: "s1.dga.capture_done",
    payload: {
      field_count: checklist.filter((e) => e.state !== "missing").length,
      warnings: checklist
        .filter((e) => e.state === "captured_warn")
        .map((e) => e.key),
      timings_ms: sw.snapshot(),
    },
  });
  lapAndEmit(sw, sse, "db_save_transition");

  return {
    ok: true,
    state: updated.state,
    checklist,
  };
}

/**
 * Second gate (S1_DGA_REVIEW → S2_ID_SELFIE). Reconstructs the canonical
 * Identity from the (possibly user-edited) field rows, writes the `dga`
 * provider row that downstream cross-match steps depend on, and
 * transitions the session.
 */
export async function finalizeDgaReview(args: {
  sessionId: string;
  sw: Stopwatch;
  sse: SSEStream | null;
}): Promise<{
  ok: boolean;
  state: string;
  identity?: Identity;
  missing?: string[];
  checklist: ChecklistEntry[];
  addressMismatch?: {
    registered: string | null;
    contact: string | null;
    registeredHouseNumber: string | null;
    contactHouseNumber: string | null;
  };
}> {
  const { sessionId, sw, sse } = args;
  lapAndEmit(sw, sse, "session_check");

  const rows = await prisma.wizardDgaField.findMany({
    where: { sessionId },
    select: DGA_FIELD_SELECT,
  });
  const checklist = buildChecklistFromRows(
    rows.map((r) => ({
      fieldKey: r.fieldKey,
      value: r.value,
      evidenceId: r.evidenceId,
      shapeOk: r.shapeOk,
      warning: r.warning,
      confidence: r.confidence?.toNumber() ?? null,
      originalValue: r.originalValue,
      editedByUser: r.editedByUser,
    })),
  );

  // Re-validate after edits — vendor might have cleared a required field.
  const missingRequired = checklist
    .filter((e) => e.required && e.state === "missing")
    .map((e) => e.key);

  if (missingRequired.length > 0) {
    return {
      ok: false,
      state: "S1_DGA_REVIEW",
      missing: missingRequired,
      checklist,
    };
  }

  const identity = identityFromRows(
    rows.map((r) => ({
      fieldKey: r.fieldKey,
      value: r.value,
      evidenceId: r.evidenceId,
    })),
  );

  // Pick the most recent evidence to attach the canonical row to (any S1
  // evidence works — this row is per-session, not per-image).
  const latestEvidence = await prisma.wizardEvidence.findFirst({
    where: { sessionId, step: "S1_DGA_CAPTURE" },
    orderBy: { capturedAt: "desc" },
    select: { id: true },
  });
  if (!latestEvidence) {
    throw new Error("Cannot finalize: no DGA evidence on this session");
  }

  // Heuristic confidence — count required fields that passed cleanly
  // (no warning) divided by total required. Optional fields ignored.
  const requiredEntries = checklist.filter((e) => e.required);
  const cleanCount = requiredEntries.filter((e) => e.state === "captured").length;
  const confidence = cleanCount / requiredEntries.length;

  const editedFields = checklist
    .filter((e) => e.editedByUser)
    .map((e) => ({ key: e.key, originalValue: e.originalValue, value: e.value }));

  // Business rule: DGA registered address and DGA contact address should
  // refer to the same physical address. We anchor on the house number
  // (most distinctive single token, robust to abbreviation / postal /
  // village-name variance).
  //
  // confirmed mismatch         → BLOCK the finalize, return addressMismatch
  //                              payload so the UI can prompt the vendor to
  //                              fix the address inside DGA and re-upload
  //                              fresh screenshots.
  // unparseable on either side → SOFT advisory (not a hard fail). Continue
  //                              flow; S7 will route to MANUAL_REVIEW via
  //                              softFails metadata so an admin can eyeball.
  // both match                 → continue clean.
  const addressCheck = compareDgaAddressesByHouseNumber(
    identity.address?.full ?? null,
    identity.contactAddress?.full ?? null,
  );

  if (addressCheck && !addressCheck.matched && addressCheck.reason === "house_number_mismatch") {
    await auditWizardEvent({
      sessionId,
      actor: "system",
      event: "s1.dga.address_mismatch_blocked",
      payload: {
        registered_house_number: addressCheck.left,
        contact_house_number: addressCheck.right,
        registered_address: identity.address?.full ?? null,
        contact_address: identity.contactAddress?.full ?? null,
      },
    });
    return {
      ok: false,
      state: "S1_DGA_REVIEW",
      checklist,
      addressMismatch: {
        registered: identity.address?.full ?? null,
        contact: identity.contactAddress?.full ?? null,
        registeredHouseNumber: addressCheck.left,
        contactHouseNumber: addressCheck.right,
      },
    };
  }

  await saveOcrResult({
    sessionId,
    evidenceId: latestEvidence.id,
    provider: DGA_PROVIDER,
    rawResponse: {
      image_count: rows.length > 0 ? new Set(rows.map((r) => r.evidenceId)).size : 0,
      fields_captured: rows.length,
      warnings: checklist
        .filter((e) => e.state === "captured_warn")
        .map((e) => ({ key: e.key, warning: e.warning })),
      edited_fields: editedFields,
    },
    extracted: identity,
    confidence,
  });
  lapAndEmit(sw, sse, "db_save_transition");

  let addressAdvisory: string | null = null;
  if (addressCheck && !addressCheck.matched && addressCheck.reason === "house_number_unparseable") {
    addressAdvisory = "dga_address_unparseable";
    const session = await prisma.wizardSession.findUnique({
      where: { id: sessionId },
      select: { metadata: true },
    });
    const existingMeta =
      session?.metadata && typeof session.metadata === "object" && !Array.isArray(session.metadata)
        ? (session.metadata as Record<string, unknown>)
        : {};
    const existingAdvisories = Array.isArray(existingMeta.softFails)
      ? (existingMeta.softFails as string[])
      : [];
    const dedupedAdvisories = Array.from(new Set([...existingAdvisories, addressAdvisory]));
    await prisma.wizardSession.update({
      where: { id: sessionId },
      data: {
        metadata: {
          ...existingMeta,
          softFails: dedupedAdvisories,
        },
      },
    });
  }

  await invalidateWizardSteps(sessionId, "S1_DGA_REVIEW");

  const updated = await transitionWizardSession({
    sessionId,
    toState: "S2_ID_SELFIE",
    actor: "vendor",
    event: "s1.dga.review_confirmed",
    payload: {
      image_count: new Set(rows.map((r) => r.evidenceId)).size,
      field_count: rows.length,
      confidence,
      edited_field_keys: editedFields.map((e) => e.key),
      warnings: checklist
        .filter((e) => e.state === "captured_warn")
        .map((e) => e.key),
      addressAdvisory,
      addressCheck: addressCheck
        ? {
            matched: addressCheck.matched,
            reason: addressCheck.reason,
            registered_house_number: addressCheck.left,
            contact_house_number: addressCheck.right,
          }
        : null,
      timings_ms: sw.snapshot(),
    },
  });

  return {
    ok: true,
    state: updated.state,
    identity,
    checklist,
  };
}
