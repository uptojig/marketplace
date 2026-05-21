import { NextResponse } from "next/server";
import { recordIappCost } from "@/lib/kyc/cost-tracker";
import { fromIappFront } from "@/lib/kyc/identity-extract";
import { iapp } from "@/lib/kyc/iapp-client";
import {
  assertFileSize,
  createStopwatch,
  fileToBuffer,
  getFileField,
  jsonError,
  MAX_ID_BYTES,
  requireWizardSession,
  saveOcrResult,
} from "@/lib/kyc/wizard-api";
import { invalidateWizardSteps, transitionWizardSession } from "@/lib/kyc/wizard-state";
import { uploadWizardEvidence } from "@/lib/kyc/wizard-storage";
import {
  formatThaiBuddhistDateFromIappEnglish,
  parseIappDate,
  validateThaiIdChecksum,
} from "@/lib/kyc/thai-id-validator";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ID_REF_PROVIDER = "iapp_id_ref";

function formatCitizenIdWithDashes(digits: string | null | undefined): string | null {
  if (!digits) return null;
  const d = digits.replace(/\D/g, "");
  if (d.length !== 13) return d || null;
  return `${d[0]}-${d.slice(1, 5)}-${d.slice(5, 10)}-${d.slice(10, 12)}-${d[12]}`;
}

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    const ACTIVE_FLOW_STATES = [
      "S1_ID_CARD_REF",
      "S1_ID_CARD_REVIEW",
      "S2_EMAIL_PENDING",
      "S3_OTP_VERIFIED",
      "S1_DGA_CAPTURE",
      "S1_DGA_REVIEW",
      "S2_ID_SELFIE",
      "S3_PHONE_RESPONSE",
      "S4_BANKBOOK_UPLOAD",
      "S5_SUMMARY",
    ];
    if (!ACTIVE_FLOW_STATES.includes(session.state)) {
      return jsonError(`Expected active wizard session, got ${session.state}`, 409);
    }

    if (session.state !== "S1_ID_CARD_REF") {
      await transitionWizardSession({
        sessionId: params.sid,
        toState: "S1_ID_CARD_REF",
        actor: "system",
        event: "s1.id_card_ref.reopened_upload",
        payload: { priorState: session.state },
      });
    }

    const form = await req.formData();
    const idFront = getFileField(form, ["id_front", "id_card", "id"]);
    if (!idFront) return jsonError('Multipart field "id_front" is required');
    assertFileSize(idFront, MAX_ID_BYTES, "ID card image");

    const buffer = await fileToBuffer(idFront);

    // 1. Run OCR first to obtain the name
    const ocr = await iapp.ocrThaiIdFront(buffer);

    await recordIappCost({
      sessionId: params.sid,
      endpoint: "thai-national-id-card/front",
      ic: ocr.ic,
      ms: ocr.ms,
    });

    const extracted = fromIappFront(ocr.data);

    // Resolve name for folder path structure
    let folderName = "";
    if (extracted.thName?.first && extracted.thName?.last) {
      folderName = `${extracted.thName.first}_${extracted.thName.last}`;
    } else if (extracted.thName?.full) {
      folderName = extracted.thName.full;
    } else if (extracted.enName?.first && extracted.enName?.last) {
      folderName = `${extracted.enName.first}_${extracted.enName.last}`;
    } else if (extracted.enName?.full) {
      folderName = extracted.enName.full;
    }

    folderName = folderName.trim().replace(/\s+/g, "_");
    if (!folderName) {
      return jsonError("ไม่สามารถอ่านข้อมูลชื่อบนบัตรประชาชนได้ กรุณาอัปโหลดรูปภาพที่ชัดเจนกว่านี้", 400);
    }

    // 2. Upload with the extracted name
    const evidence = await uploadWizardEvidence({
      sessionId: params.sid,
      step: "S1_ID_CARD_REF",
      buffer,
      mime: idFront.type || "image/jpeg",
      filename: idFront.name || `id-card-${Date.now()}.jpg`,
      userName: folderName,
    });

    await invalidateWizardSteps(params.sid, "S1_ID_CARD_REF");

    await saveOcrResult({
      sessionId: params.sid,
      evidenceId: evidence.id,
      provider: ID_REF_PROVIDER,
      rawResponse: ocr.data,
      extracted,
      confidence: 1,
    });

    if (extracted.citizenId) {
      await prisma.wizardSession.update({
        where: { id: params.sid },
        data: { citizenId: extracted.citizenId },
      });
    }

    // The transition lands in S1_ID_CARD_REVIEW. /s1/id-card-ref/confirm
    // (vendor confirmed the read) advances to S2_EMAIL_PENDING; /retake
    // bounces back to S1_ID_CARD_REF so they can re-upload.
    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: "S1_ID_CARD_REVIEW",
      actor: "system",
      event: "s1.id_card_ref.ocr_complete",
      payload: {
        citizenId: extracted.citizenId ?? null,
        fullName: extracted.thName?.full ?? extracted.enName?.full ?? null,
        timings_ms: sw.snapshot(),
      },
    });

    const checksumValid = extracted.citizenId
      ? validateThaiIdChecksum(extracted.citizenId)
      : false;
    const expiryDate = ocr.data.en_expire ? parseIappDate(ocr.data.en_expire) : null;
    const expired = expiryDate ? expiryDate.getTime() < Date.now() : false;

    return NextResponse.json({
      ok: true,
      state: updated.state,
      evidenceId: evidence.id,
      identity: {
        firstName: extracted.thName?.first ?? null,
        lastName: extracted.thName?.last ?? null,
        fullName: extracted.thName?.full ?? extracted.enName?.full ?? null,
        citizenId: extracted.citizenId ?? null,
        citizenIdFormatted: formatCitizenIdWithDashes(extracted.citizenId),
        checksumValid,
        dob: extracted.dob ?? null,
        dobThai:
          ocr.data.th_dob?.trim() ||
          (ocr.data.en_dob ? formatThaiBuddhistDateFromIappEnglish(ocr.data.en_dob) : null),
        expiry: ocr.data.en_expire ?? null,
        expiryThai:
          ocr.data.th_expire?.trim() ||
          (ocr.data.en_expire ? formatThaiBuddhistDateFromIappEnglish(ocr.data.en_expire) : null),
        expired,
      },
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
