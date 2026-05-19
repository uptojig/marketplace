import { NextResponse } from "next/server";
import {
  createStopwatch,
  jsonError,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";
import { transitionWizardSession } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Vendor pressed "ถ่ายใหม่" from the OCR review screen. Bounces back
// to S1_ID_CARD_REF so they can re-upload. The previous evidence row
// + OCR result stay in the audit log on purpose — they are useful
// signal for ops when reviewing borderline cases later.
export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S1_ID_CARD_REVIEW") {
      return jsonError(`Expected S1_ID_CARD_REVIEW, got ${session.state}`, 409);
    }

    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: "S1_ID_CARD_REF",
      actor: "vendor",
      event: "s1.id_card_ref.retake_requested",
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
