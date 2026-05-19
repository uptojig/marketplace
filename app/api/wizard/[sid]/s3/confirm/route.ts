import { NextResponse } from "next/server";
import {
  createStopwatch,
  jsonError,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";
import { transitionWizardSession } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S3_OTP_VERIFIED") {
      return jsonError(`Expected S3_OTP_VERIFIED, got ${session.state}`, 409);
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
