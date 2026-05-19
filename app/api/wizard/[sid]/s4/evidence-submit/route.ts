import { NextResponse } from "next/server";
import { markKycEmailUsed } from "@/lib/kyc/email-pool";
import {
  assertFileSize,
  createStopwatch,
  fileToBuffer,
  getFileField,
  jsonError,
  MAX_SCREENSHOT_BYTES,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";
import { transitionWizardSession } from "@/lib/kyc/wizard-state";
import { uploadWizardEvidence } from "@/lib/kyc/wizard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S4_EVIDENCE_UPLOAD") {
      return jsonError(`Expected S4_EVIDENCE_UPLOAD, got ${session.state}`, 409);
    }

    const form = await req.formData();
    const dgaCapture = getFileField(form, ["dga_capture", "dga", "dga_screenshot"]);
    const heldIdPhoto = getFileField(form, ["held_id_photo", "id_selfie", "id_photo"]);
    const ussdCapture = getFileField(form, ["ussd_capture", "ussd", "ussd_screenshot"]);

    if (!dgaCapture || !heldIdPhoto || !ussdCapture) {
      return jsonError(
        'Multipart fields "dga_capture", "held_id_photo", and "ussd_capture" are required',
        400,
      );
    }

    assertFileSize(dgaCapture, MAX_SCREENSHOT_BYTES, "DGA screenshot");
    assertFileSize(heldIdPhoto, MAX_SCREENSHOT_BYTES, "Photo with ID card");
    assertFileSize(ussdCapture, MAX_SCREENSHOT_BYTES, "USSD screenshot");

    const [dgaBuffer, heldBuffer, ussdBuffer] = await Promise.all([
      fileToBuffer(dgaCapture),
      fileToBuffer(heldIdPhoto),
      fileToBuffer(ussdCapture),
    ]);

    await Promise.all([
      uploadWizardEvidence({
        sessionId: params.sid,
        step: "S4_DGA_CAPTURE",
        buffer: dgaBuffer,
        mime: dgaCapture.type || "image/png",
        filename: dgaCapture.name || `dga-${Date.now()}.png`,
      }),
      uploadWizardEvidence({
        sessionId: params.sid,
        step: "S4_HELD_ID_PHOTO",
        buffer: heldBuffer,
        mime: heldIdPhoto.type || "image/jpeg",
        filename: heldIdPhoto.name || `held-id-${Date.now()}.jpg`,
      }),
      uploadWizardEvidence({
        sessionId: params.sid,
        step: "S4_USSD_CAPTURE",
        buffer: ussdBuffer,
        mime: ussdCapture.type || "image/png",
        filename: ussdCapture.name || `ussd-${Date.now()}.png`,
      }),
    ]);

    await markKycEmailUsed(params.sid);

    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: "MANUAL_REVIEW",
      actor: "vendor",
      event: "s4.evidence.submit",
      payload: {
        evidenceSteps: ["S4_DGA_CAPTURE", "S4_HELD_ID_PHOTO", "S4_USSD_CAPTURE"],
        timings_ms: sw.snapshot(),
      },
    });

    return NextResponse.json({
      ok: true,
      state: updated.state,
      reference_id: params.sid,
      message: "Evidence submitted successfully",
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}

