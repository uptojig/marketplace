import { NextResponse } from "next/server";
import { buildChecklist } from "@/lib/kyc/dga-image-processor";
import { transitionWizardSession, invalidateWizardSteps } from "@/lib/kyc/wizard-state";
import {
  createStopwatch,
  jsonError,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// S1_DGA_REVIEW → S1_DGA_CAPTURE. Vendor wants to add or replace a
// screenshot before confirming. We just transition state — wizardDgaField
// rows (including any edits made in REVIEW) are preserved. If the vendor
// uploads a new image that overlaps an existing field, last-write-wins
// will overwrite the row from the new OCR pass (existing capture
// behavior, no change).

export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();

  try {
    const session = await requireWizardSession(params.sid);
    const ACTIVE_FLOW_STATES = [
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

    if (session.state !== "S1_DGA_REVIEW" && session.state !== "S1_DGA_CAPTURE") {
      await invalidateWizardSteps(params.sid, "S1_DGA_REVIEW");
    }

    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: "S1_DGA_CAPTURE",
      actor: "vendor",
      event: "s1.dga.review_back_to_capture",
      payload: { timings_ms: sw.snapshot() },
    });

    const checklist = await buildChecklist(params.sid);
    return NextResponse.json({
      ok: true,
      state: updated.state,
      checklist,
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
