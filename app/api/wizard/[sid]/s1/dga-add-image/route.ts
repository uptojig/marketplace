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
    if (session.state !== "S1_DGA_CAPTURE") {
      return jsonError(`Expected S1_DGA_CAPTURE, got ${session.state}`, 409);
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
