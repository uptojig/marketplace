import { NextResponse } from "next/server";
import {
  createStopwatch,
  jsonError,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";
import { transitionWizardSession, invalidateWizardSteps } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    let session = await requireWizardSession(params.sid);
    const ACTIVE_FLOW_STATES = [
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

    if (session.state !== "S3_OTP_VERIFIED") {
      session = await transitionWizardSession({
        sessionId: params.sid,
        toState: "S3_OTP_VERIFIED",
        actor: "vendor",
        event: "s3.otp.reopened_confirm",
        payload: { priorState: session.state },
      });
      await invalidateWizardSteps(params.sid, "S1_ID_CARD_REF");
    }

    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: "S1_DGA_CAPTURE",
      actor: "vendor",
      event: "s3.otp.confirmed_by_vendor",
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
