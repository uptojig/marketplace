import { NextResponse } from "next/server";
import {
  createStopwatch,
  jsonError,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";
import { transitionWizardSession } from "@/lib/kyc/wizard-state";
import { validateThaiIdChecksum } from "@/lib/kyc/thai-id-validator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Vendor confirmed the read-only OCR review screen. Refuses to advance
// the state if the anchor data has integrity issues — the vendor must
// hit "ถ่ายใหม่" (which calls /retake) instead. We mirror what the
// review screen disables in the UI: bad checksum + missing name.
export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S1_ID_CARD_REVIEW") {
      return jsonError(`Expected S1_ID_CARD_REVIEW, got ${session.state}`, 409);
    }

    const citizenId = session.citizenId?.trim() || null;
    if (!citizenId || !validateThaiIdChecksum(citizenId)) {
      return jsonError(
        "เลขบัตรประชาชนไม่ผ่านการตรวจสอบ — กรุณาถ่ายรูปใหม่อีกครั้ง",
        422,
      );
    }

    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: "S2_EMAIL_PENDING",
      actor: "vendor",
      event: "s1.id_card_ref.confirmed",
      payload: { timings_ms: sw.snapshot() },
    });

    return NextResponse.json({
      ok: true,
      state: updated.state,
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
