import { NextResponse } from "next/server";
import { finalizeDgaCapture } from "@/lib/kyc/dga-image-processor";
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

// S1 v2 — first gate. Validates accumulated checklist has all 9 required
// fields captured (warnings don't block), then transitions to
// S1_DGA_REVIEW so the vendor can correct OCR mistakes before continuing
// to S2. No canonical `dga` row is written yet — that happens at
// review-confirm so post-edit values are what downstream cross-match sees.
//
// If any required field is still MISSING, returns ok=false + the missing
// list so the UI can highlight them; state stays at S1_DGA_CAPTURE.

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  const useSSE = clientWantsSSE(req);

  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S1_DGA_CAPTURE") {
      return jsonError(`Expected S1_DGA_CAPTURE, got ${session.state}`, 409);
    }

    if (useSSE) {
      const sse: SSEStream = createSSEStream();
      finalizeDgaCapture({ sessionId: params.sid, sw, sse })
        .then((result) => sse.emit("result", { ...result, _timings_ms: sw.snapshot() }))
        .catch((err) =>
          sse.emit("error", {
            message: err instanceof Error ? err.message : String(err),
          }),
        )
        .finally(() => sse.close());
      return sse.response;
    }

    const result = await finalizeDgaCapture({ sessionId: params.sid, sw, sse: null });
    return NextResponse.json({ ...result, _timings_ms: sw.snapshot() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
