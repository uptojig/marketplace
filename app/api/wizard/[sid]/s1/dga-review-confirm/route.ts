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
    if (session.state !== "S1_DGA_REVIEW") {
      return jsonError(`Expected S1_DGA_REVIEW, got ${session.state}`, 409);
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
