import { NextResponse } from "next/server";
import { finalizeDgaReview } from "@/lib/kyc/dga-image-processor";
import {
  clientWantsSSE,
  createSSEStream,
  createStopwatch,
  jsonError,
  requireWizardSession,
  type SSEStream,
} from "@/lib/kyc/wizard-api";

import { transitionWizardSession, invalidateWizardSteps } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// S1_DGA_REVIEW → S2_ID_SELFIE. Vendor confirms the OCR-captured (and
// possibly edited) values are correct. We re-validate all required
// fields are present, reconstruct the canonical Identity from the rows,
// write the `dga` provider row downstream cross-match depends on, and
// transition the session.

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  const useSSE = clientWantsSSE(req);

  try {
    const session = await requireWizardSession(params.sid);
    const ACTIVE_FLOW_STATES = [
      "S1_DGA_REVIEW",
      "S2_ID_SELFIE",
      "S3_PHONE_RESPONSE",
      "S4_BANKBOOK_UPLOAD",
      "S5_SUMMARY",
    ];
    if (!ACTIVE_FLOW_STATES.includes(session.state)) {
      return jsonError(`Expected active wizard session, got ${session.state}`, 409);
    }

    if (session.state !== "S1_DGA_REVIEW") {
      await transitionWizardSession({
        sessionId: params.sid,
        toState: "S1_DGA_REVIEW",
        actor: "vendor",
        event: "s1.dga_review.reopened_confirm",
        payload: { priorState: session.state },
      });
      await invalidateWizardSteps(params.sid, "S1_DGA_REVIEW");
    }

    if (useSSE) {
      const sse: SSEStream = createSSEStream();
      finalizeDgaReview({ sessionId: params.sid, sw, sse })
        .then((result) => sse.emit("result", { ...result, _timings_ms: sw.snapshot() }))
        .catch((err) =>
          sse.emit("error", {
            message: err instanceof Error ? err.message : String(err),
          }),
        )
        .finally(() => sse.close());
      return sse.response;
    }

    const result = await finalizeDgaReview({ sessionId: params.sid, sw, sse: null });
    return NextResponse.json({ ...result, _timings_ms: sw.snapshot() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
