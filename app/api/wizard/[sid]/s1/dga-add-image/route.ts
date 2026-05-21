import { NextResponse } from "next/server";
import { processDgaImage } from "@/lib/kyc/dga-image-processor";
import {
  assertFileSize,
  clientWantsSSE,
  createSSEStream,
  createStopwatch,
  getFileField,
  jsonError,
  MAX_SCREENSHOT_BYTES,
  requireWizardSession,
  type SSEStream,
} from "@/lib/kyc/wizard-api";

import { transitionWizardSession, invalidateWizardSteps } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// S1 v2 — accept ONE image per request. Client uploads incrementally;
// each call OCRs the image, auto-redacts username if present, and UPSERTs
// any fields the parser extracted. Response includes the updated checklist.
//
// State must be S1_DGA_CAPTURE. We do NOT transition here — that happens
// only on /dga-finalize once the required-field checklist is complete.

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  const useSSE = clientWantsSSE(req);

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

    if (session.state !== "S1_DGA_CAPTURE") {
      await transitionWizardSession({
        sessionId: params.sid,
        toState: "S1_DGA_CAPTURE",
        actor: "vendor",
        event: "s1.dga.screenshot_modified",
        payload: { priorState: session.state },
      });
      await invalidateWizardSteps(params.sid, "S1_DGA_REVIEW");
    }

    const form = await req.formData();
    const image = getFileField(form, ["image"]);
    if (!image) return jsonError('Multipart field "image" is required');
    assertFileSize(image, MAX_SCREENSHOT_BYTES, "DGA screenshot");

    if (useSSE) {
      const sse: SSEStream = createSSEStream();
      processDgaImage({ sessionId: params.sid, image, sw, sse })
        .then((result) => sse.emit("result", { ok: true, ...result, _timings_ms: sw.snapshot() }))
        .catch((err) =>
          sse.emit("error", {
            message: err instanceof Error ? err.message : String(err),
          }),
        )
        .finally(() => sse.close());
      return sse.response;
    }

    const result = await processDgaImage({ sessionId: params.sid, image, sw, sse: null });
    return NextResponse.json({ ok: true, ...result, _timings_ms: sw.snapshot() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Unable to redact DGA username")) {
      return jsonError(message, 422);
    }
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
