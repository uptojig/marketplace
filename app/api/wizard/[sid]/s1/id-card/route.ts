import { NextResponse } from "next/server";
import { runVerification } from "@/lib/kyc/run-verification";
import { iappTelemetryRecorder } from "@/lib/kyc/cost-tracker";
import { autoExtractIdCard } from "@/lib/kyc/id-card-detector";
import { compareIdentities } from "@/lib/kyc/identity-match";
import {
  assertFileSize,
  clientWantsSSE,
  createSSEStream,
  createStopwatch,
  DGA_PROVIDER,
  fileToBuffer,
  getFileField,
  identityFromVerificationResult,
  jsonError,
  lapAndEmit,
  latestExtractedIdentity,
  MAX_ID_BYTES,
  MAX_SELFIE_BYTES,
  requireWizardSession,
  saveOcrResult,
  replaceMatchResults,
  type SSEStream,
  type Stopwatch,
} from "@/lib/kyc/wizard-api";
import { auditWizardEvent, transitionWizardSession } from "@/lib/kyc/wizard-state";
import { getLatestEvidenceWithBuffer, uploadWizardEvidence } from "@/lib/kyc/wizard-storage";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ID_VS_DGA_MATCH_TYPES: Record<string, string> = {
  citizenId: "id_vs_dga_cid",
  name: "id_vs_dga_name",
  dob: "id_vs_dga_dob",
};

// Worker — runs heavy S5 verification (auto-crop → upload selfie evidence
// → iApp 4-call verification → cross-match DB). The ID-card image is
// reused from Step 1's S1_ID_CARD_REF evidence (the vendor doesn't
// re-upload it). Emits stage events into the SSE stream when one is
// attached; otherwise just returns the final body.
async function processIdSelfie(args: {
  sw: Stopwatch;
  sse: SSEStream | null;
  sessionId: string;
  dga: NonNullable<Awaited<ReturnType<typeof latestExtractedIdentity>>>;
  refEvidenceId: string;
  selfieFile: File;
  selfieHeldIdCropFile: File | null;
  idBuffer: Buffer;
  selfieBuffer: Buffer;
  initialHeldIdBuffer: Buffer | undefined;
  initialHeldIdSource: "client_crop" | "auto_crop" | "full_selfie";
}): Promise<{ status: number; body: Record<string, unknown> }> {
  const { sw, sse, sessionId, dga, refEvidenceId, selfieFile, selfieHeldIdCropFile, idBuffer, selfieBuffer } = args;
  let heldIdOcrBuffer = args.initialHeldIdBuffer;
  let heldIdSource = args.initialHeldIdSource;

  lapAndEmit(sw, sse, "session_check");
  lapAndEmit(sw, sse, "form_parse");

  if (!heldIdOcrBuffer) {
    try {
      const autoCrop = await autoExtractIdCard(selfieBuffer);
      await auditWizardEvent({
        sessionId,
        actor: "system",
        event: "s2.id_selfie.auto_crop",
        payload: {
          detected: Boolean(autoCrop.buffer),
          confidence: autoCrop.detection.confidence,
          candidate_count: autoCrop.detection.candidateCount,
          image_width: autoCrop.detection.imageWidth,
          image_height: autoCrop.detection.imageHeight,
          quad: autoCrop.detection.quad,
        },
      });
      if (autoCrop.buffer) {
        heldIdOcrBuffer = autoCrop.buffer;
        heldIdSource = "auto_crop";
      }
    } catch (cropError) {
      const message = cropError instanceof Error ? cropError.message : String(cropError);
      await auditWizardEvent({
        sessionId,
        actor: "system",
        event: "s2.id_selfie.auto_crop_error",
        payload: { error: message },
      });
    }
  }
  lapAndEmit(sw, sse, "auto_crop_yolo");

  // Selfie + held-ID crop are NEW uploads; the front-of-card image is
  // reused from Step 1 (refEvidenceId) so we no longer create an
  // S2_ID_FRONT row.
  const heldCropUploadPromise = heldIdOcrBuffer && heldIdSource !== "full_selfie"
    ? uploadWizardEvidence({
        sessionId,
        step: "S2_SELFIE_HELD_ID_CROP",
        buffer: heldIdOcrBuffer,
        mime: selfieHeldIdCropFile?.type || "image/jpeg",
        filename: selfieHeldIdCropFile?.name ?? `auto_cropped_${Date.now()}.jpg`,
      })
    : Promise.resolve(undefined);
  await Promise.all([
    uploadWizardEvidence({
      sessionId,
      step: "S2_SELFIE",
      buffer: selfieBuffer,
      mime: selfieFile.type || "image/jpeg",
      filename: selfieFile.name,
    }),
    heldCropUploadPromise,
  ]);
  lapAndEmit(sw, sse, "evidence_upload_parallel");

  const result = await runVerification("wizard-s1", idBuffer, selfieBuffer, {
    heldIdOcrBuffer,
    returnFaceImage: false,
    onCall: iappTelemetryRecorder(sessionId),
    capture: {
      mode: "upload",
      attemptIndex: 1,
      maxAttempts: 3,
      fileSize: selfieFile.size,
    },
  });
  lapAndEmit(sw, sse, "run_verification_iapp");
  const extracted = identityFromVerificationResult(result);

  await saveOcrResult({
    sessionId,
    evidenceId: refEvidenceId,
    provider: "iapp_id_front",
    rawResponse: result,
    extracted,
    confidence: result.breakdown.ocr_confidence,
  });

  const faceMatch = {
    matchType: "face_verify",
    leftSource: "selfie",
    rightSource: "id_card_front",
    leftValue: String(result.breakdown.face_match.score),
    rightValue: String(result.breakdown.face_match.threshold),
    score: result.breakdown.face_match.score,
    threshold: result.breakdown.face_match.threshold,
    matched: result.breakdown.face_match.matched,
    reason: result.breakdown.face_match.matched ? "face_matched" : "face_mismatch",
  };
  // ID card → DGA cross-match. We compare against the DGA "registered
  // address" (ที่อยู่ตามบัตร) only — both sides of that comparison come
  // from the citizen's ID card, so they should match. We do NOT compare
  // against DGA "contact address" (ที่อยู่ที่ติดต่อได้): the ID card has
  // no separate contact field, so comparing to it is meaningless and
  // produces false fails (e.g. user moved into a rented apartment in a
  // different province). The DGA-internal registered-vs-contact business
  // rule is enforced at S1_DGA_REVIEW finalize via house-number anchor
  // matching — see lib/kyc/dga-image-processor.ts:finalizeDgaReview.
  const identityMatches = [
    ...compareIdentities(extracted, dga, ["citizenId", "name", "dob"], {
      leftSource: "id_card_front",
      rightSource: "dga_capture",
    }).map((item) => ({ ...item, matchType: ID_VS_DGA_MATCH_TYPES[item.matchType] ?? item.matchType })),
    ...compareIdentities(extracted, { ...dga, contactAddress: undefined }, ["address"], {
      leftSource: "id_card_front",
      rightSource: "dga_registered_address",
    }).map((item) => ({ ...item, matchType: "id_vs_dga_registered_address" })),
  ];
  const matches = await replaceMatchResults(sessionId, [faceMatch, ...identityMatches]);
  const allMatched = matches.every((match) => match.matched);
  lapAndEmit(sw, sse, "cross_match_db");

  // Face match can fail for benign reasons we can't control (age, hair,
  // glasses, weight, photo quality). When the document-identity anchors
  // (cid + name + dob) all match DGA, we already know the seller is the
  // person on the card — face fail just means the photo aged. Advance
  // the flow and record an advisory; S7 (bankbook finalize) will route
  // the session to MANUAL_REVIEW instead of AUTO_APPROVED so an admin
  // can eyeball the selfie next to the ID card photo and decide.
  const matchByType = (type: string) => matches.find((m) => m.matchType === type)?.matched === true;
  const documentIdentityProven =
    matchByType("id_vs_dga_cid") && matchByType("id_vs_dga_name") && matchByType("id_vs_dga_dob");

  let advisory: string | null = null;
  let nextState: "REJECTED" | "S2_ID_SELFIE" | "S3_PHONE_RESPONSE" | "MANUAL_REVIEW";
  if (result.decision === "REJECTED") {
    nextState = documentIdentityProven ? "MANUAL_REVIEW" : "REJECTED";
    if (documentIdentityProven) advisory = "face_rejected_with_id_match";
  } else if (result.decision === "RETRY_SELFIE") {
    nextState = documentIdentityProven ? "S3_PHONE_RESPONSE" : "S2_ID_SELFIE";
    if (documentIdentityProven) advisory = "face_advisory";
  } else {
    nextState = allMatched ? "S3_PHONE_RESPONSE" : "MANUAL_REVIEW";
  }

  if (advisory) {
    const existing = await prisma.wizardSession.findUnique({
      where: { id: sessionId },
      select: { metadata: true },
    });
    const existingMeta =
      existing?.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata)
        ? (existing.metadata as Record<string, unknown>)
        : {};
    const existingAdvisories = Array.isArray(existingMeta.softFails)
      ? (existingMeta.softFails as string[])
      : [];
    const dedupedAdvisories = Array.from(new Set([...existingAdvisories, advisory]));
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

  await transitionWizardSession({
    sessionId,
    toState: nextState,
    actor: "system",
    event: "s2.id_selfie.verify",
    payload: {
      decision: result.decision,
      overall: result.overall,
      failedChecks: result.failedChecks,
      allMatched,
      documentIdentityProven,
      advisory,
      failedMatches: matches.filter((match) => !match.matched).map((match) => match.matchType),
      timings_ms: sw.snapshot(),
    },
  });

  return {
    status: 200,
    body: {
      ok: nextState !== "REJECTED",
      state: nextState,
      decision: result.decision,
      advisory,
      document_identity_proven: documentIdentityProven,
      ocr_summary: {
        confidence: result.breakdown.ocr_confidence,
        citizen_id: extracted.citizenId,
      },
      face_match_score: result.breakdown.face_match.normalized_score,
      matches,
      failed_checks: result.failedChecks,
      _timings_ms: sw.snapshot(),
    },
  };
}

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  const useSSE = clientWantsSSE(req);
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S2_ID_SELFIE") return jsonError(`Expected S2_ID_SELFIE, got ${session.state}`, 409);
    const dga = await latestExtractedIdentity(params.sid, DGA_PROVIDER);
    if (!dga) return jsonError("Missing DGA capture OCR for ID/selfie match", 409);

    // Step 1 (S1_ID_CARD_REF) already collected the front-of-card image
    // and ran reference OCR against it. We reuse that image buffer here
    // for face match — the vendor only uploads the selfie in this step.
    const refEvidence = await getLatestEvidenceWithBuffer(params.sid, "S1_ID_CARD_REF");
    if (!refEvidence) {
      return jsonError(
        "Missing reference ID card from Step 1 — กรุณาเริ่ม KYC ใหม่",
        409,
      );
    }

    const form = await req.formData();
    const selfieFile = getFileField(form, ["selfie"]);
    const selfieHeldIdCropFile = getFileField(form, ["selfie_held_id_crop"]);
    if (!selfieFile) return jsonError('Multipart field "selfie" is required');

    assertFileSize(selfieFile, MAX_SELFIE_BYTES, "Selfie image");
    if (selfieHeldIdCropFile) assertFileSize(selfieHeldIdCropFile, MAX_ID_BYTES, "Selfie ID-card crop");

    const idBuffer = refEvidence.buffer;
    const selfieBuffer = await fileToBuffer(selfieFile);
    const initialHeldIdBuffer: Buffer | undefined = selfieHeldIdCropFile
      ? await fileToBuffer(selfieHeldIdCropFile)
      : undefined;
    const initialHeldIdSource: "client_crop" | "auto_crop" | "full_selfie" =
      initialHeldIdBuffer ? "client_crop" : "full_selfie";

    if (useSSE) {
      const sse: SSEStream = createSSEStream();
      processIdSelfie({
        sw, sse, sessionId: params.sid, dga,
        refEvidenceId: refEvidence.id, selfieFile, selfieHeldIdCropFile,
        idBuffer, selfieBuffer, initialHeldIdBuffer, initialHeldIdSource,
      })
        .then(({ body }) => sse.emit("result", body))
        .catch((err) => sse.emit("error", {
          message: err instanceof Error ? err.message : String(err),
        }))
        .finally(() => sse.close());
      return sse.response;
    }

    const result = await processIdSelfie({
      sw, sse: null, sessionId: params.sid, dga,
      refEvidenceId: refEvidence.id, selfieFile, selfieHeldIdCropFile,
      idBuffer, selfieBuffer, initialHeldIdBuffer, initialHeldIdSource,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
