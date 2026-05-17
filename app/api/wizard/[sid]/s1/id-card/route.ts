import { NextResponse } from "next/server";
import { runVerification } from "@/lib/kyc/run-verification";
import { iappTelemetryRecorder } from "@/lib/kyc/cost-tracker";
import { autoExtractIdCard } from "@/lib/kyc/id-card-detector";
import { compareIdentities } from "@/lib/kyc/identity-match";
import {
  assertFileSize,
  createStopwatch,
  DGA_PROVIDER,
  fileToBuffer,
  getFileField,
  identityFromVerificationResult,
  jsonError,
  latestExtractedIdentity,
  MAX_ID_BYTES,
  MAX_SELFIE_BYTES,
  requireWizardSession,
  saveOcrResult,
  replaceMatchResults,
} from "@/lib/kyc/wizard-api";
import { auditWizardEvent, transitionWizardSession } from "@/lib/kyc/wizard-state";
import { uploadWizardEvidence } from "@/lib/kyc/wizard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ID_VS_DGA_MATCH_TYPES: Record<string, string> = {
  citizenId: "id_vs_dga_cid",
  name: "id_vs_dga_name",
  dob: "id_vs_dga_dob",
};

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S2_ID_SELFIE") return jsonError(`Expected S2_ID_SELFIE, got ${session.state}`, 409);
    const dga = await latestExtractedIdentity(params.sid, DGA_PROVIDER);
    if (!dga) return jsonError("Missing DGA capture OCR for ID/selfie match", 409);
    sw.lap("session_check");

    const form = await req.formData();
    sw.lap("form_parse");
    const idFile = getFileField(form, ["id_front", "id"]);
    const selfieFile = getFileField(form, ["selfie"]);
    const selfieHeldIdCropFile = getFileField(form, ["selfie_held_id_crop"]);
    if (!idFile || !selfieFile) return jsonError('Multipart fields "id_front" and "selfie" are required');

    assertFileSize(idFile, MAX_ID_BYTES, "ID card image");
    assertFileSize(selfieFile, MAX_SELFIE_BYTES, "Selfie image");
    if (selfieHeldIdCropFile) assertFileSize(selfieHeldIdCropFile, MAX_ID_BYTES, "Selfie ID-card crop");

    const idBuffer = await fileToBuffer(idFile);
    const selfieBuffer = await fileToBuffer(selfieFile);
    let heldIdOcrBuffer: Buffer | undefined = selfieHeldIdCropFile
      ? await fileToBuffer(selfieHeldIdCropFile)
      : undefined;
    let heldIdSource: "client_crop" | "auto_crop" | "full_selfie" = heldIdOcrBuffer ? "client_crop" : "full_selfie";

    // When the frontend didn't pre-crop the held ID, auto-detect the card
    // in the selfie via YOLO+perspective-correction. iApp's ocrThaiIdFront
    // expects the card to fill most of the frame; sending the raw selfie
    // (where the card is ~5% of the frame) gives held_id_unreadable.
    if (!heldIdOcrBuffer) {
      try {
        const autoCrop = await autoExtractIdCard(selfieBuffer);
        sw.lap("auto_crop_yolo");
        await auditWizardEvent({
          sessionId: params.sid,
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
        // Detector failure shouldn't kill the whole step — fall back to
        // running held-ID OCR on the full selfie (which usually fails and
        // routes to MANUAL_REVIEW). Log so we can analyse the failure.
        const message = cropError instanceof Error ? cropError.message : String(cropError);
        await auditWizardEvent({
          sessionId: params.sid,
          actor: "system",
          event: "s2.id_selfie.auto_crop_error",
          payload: { error: message },
        });
      }
    }

    const idEvidence = await uploadWizardEvidence({
      sessionId: params.sid,
      step: "S2_ID_FRONT",
      buffer: idBuffer,
      mime: idFile.type || "image/jpeg",
      filename: idFile.name,
    });
    await uploadWizardEvidence({
      sessionId: params.sid,
      step: "S2_SELFIE",
      buffer: selfieBuffer,
      mime: selfieFile.type || "image/jpeg",
      filename: selfieFile.name,
    });
    // Store the held-ID crop as evidence regardless of source (frontend
    // pre-crop OR backend auto-crop) so admin review sees what iApp OCR'd.
    if (heldIdOcrBuffer && heldIdSource !== "full_selfie") {
      await uploadWizardEvidence({
        sessionId: params.sid,
        step: "S2_SELFIE_HELD_ID_CROP",
        buffer: heldIdOcrBuffer,
        mime: selfieHeldIdCropFile?.type || "image/jpeg",
        filename: selfieHeldIdCropFile?.name ?? `auto_cropped_${Date.now()}.jpg`,
      });
    }
    sw.lap("evidence_upload");

    const result = await runVerification("wizard-s1", idBuffer, selfieBuffer, {
      heldIdOcrBuffer,
      returnFaceImage: false,
      onCall: iappTelemetryRecorder(params.sid),
      capture: {
        mode: "upload",
        attemptIndex: 1,
        maxAttempts: 3,
        fileSize: selfieFile.size,
      },
    });
    sw.lap("run_verification_iapp");
    const extracted = identityFromVerificationResult(result);

    await saveOcrResult({
      sessionId: params.sid,
      evidenceId: idEvidence.id,
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
    const identityMatches = [
      ...compareIdentities(extracted, dga, ["citizenId", "name", "dob"], {
        leftSource: "id_card_front",
        rightSource: "dga_capture",
      }).map((item) => ({ ...item, matchType: ID_VS_DGA_MATCH_TYPES[item.matchType] ?? item.matchType })),
      ...compareIdentities(extracted, { ...dga, contactAddress: undefined }, ["address"], {
        leftSource: "id_card_front",
        rightSource: "dga_registered_address",
      }).map((item) => ({ ...item, matchType: "id_vs_dga_registered_address" })),
      ...compareIdentities(extracted, { address: dga.contactAddress }, ["address"], {
        leftSource: "id_card_front",
        rightSource: "dga_contact_address",
      }).map((item) => ({ ...item, matchType: "id_vs_dga_contact_address" })),
    ];
    const matches = await replaceMatchResults(params.sid, [faceMatch, ...identityMatches]);
    const allMatched = matches.every((match) => match.matched);
    sw.lap("cross_match_db");

    const nextState = result.decision === "REJECTED"
      ? "REJECTED"
      : result.decision === "RETRY_SELFIE"
        ? "S2_ID_SELFIE"
        : allMatched
          ? "S3_PHONE_RESPONSE"
          : "MANUAL_REVIEW";

    await transitionWizardSession({
      sessionId: params.sid,
      toState: nextState,
      actor: "system",
      event: "s2.id_selfie.verify",
      payload: {
        decision: result.decision,
        overall: result.overall,
        failedChecks: result.failedChecks,
        allMatched,
        failedMatches: matches.filter((match) => !match.matched).map((match) => match.matchType),
        timings_ms: sw.snapshot(),
      },
    });

    return NextResponse.json({
      ok: result.decision !== "REJECTED",
      state: nextState,
      decision: result.decision,
      ocr_summary: {
        confidence: result.breakdown.ocr_confidence,
        citizen_id: extracted.citizenId,
      },
      face_match_score: result.breakdown.face_match.normalized_score,
      matches,
      failed_checks: result.failedChecks,
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
