import { NextResponse } from "next/server";
import { recordIappCost } from "@/lib/kyc/cost-tracker";
import { fromIappUssd } from "@/lib/kyc/identity-extract";
import { iapp } from "@/lib/kyc/iapp-client";
import { compareIdentities } from "@/lib/kyc/identity-match";
import {
  assertFileSize,
  clientWantsSSE,
  createSSEStream,
  createStopwatch,
  DGA_PROVIDER,
  fileToBuffer,
  getFileField,
  jsonError,
  lapAndEmit,
  latestExtractedIdentity,
  MAX_SCREENSHOT_BYTES,
  replaceMatchResults,
  requireWizardSession,
  saveOcrResult,
  type SSEStream,
  type Stopwatch,
} from "@/lib/kyc/wizard-api";
import { auditWizardEvent, transitionWizardSession } from "@/lib/kyc/wizard-state";
import { uploadWizardEvidence } from "@/lib/kyc/wizard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PHONE_VS_DGA_MATCH_TYPES: Record<string, string> = {
  citizenId: "phone_response_vs_dga_cid",
  phoneLast4: "phone_response_last4_vs_dga_mobile",
};

async function processUssd(args: {
  sw: Stopwatch;
  sse: SSEStream | null;
  sessionId: string;
  sessionState: string;
  dga: NonNullable<Awaited<ReturnType<typeof latestExtractedIdentity>>>;
  image: File;
  buffer: Buffer;
}): Promise<{ status: number; body: Record<string, unknown> }> {
  const { sw, sse, sessionId, sessionState, dga, image, buffer } = args;
  lapAndEmit(sw, sse, "session_check");
  lapAndEmit(sw, sse, "form_parse");

  const evidencePromise = uploadWizardEvidence({
    sessionId,
    step: "S3_PHONE_RESPONSE",
    buffer,
    mime: image.type || "image/png",
    filename: image.name,
  });
  const ocrPromise = iapp.ocrDocument(buffer);
  const [evidence, ocr] = await Promise.all([evidencePromise, ocrPromise]);
  lapAndEmit(sw, sse, "evidence_and_ocr_parallel");
  await recordIappCost({ sessionId, endpoint: "document-ocr-ussd", ic: ocr.ic, ms: ocr.ms });

  const parsed = fromIappUssd(ocr.data);
  lapAndEmit(sw, sse, "anchor_parse");
  const extracted = { citizenId: parsed.citizenId, phoneLast4: parsed.phoneLast4 };
  const confidence =
    (parsed.citizenId?.length === 13 ? 0.4 : 0) +
    (parsed.phoneLast4?.length === 4 ? 0.4 : 0) +
    (parsed.matchWordFound ? 0.2 : 0);

  await saveOcrResult({
    sessionId,
    evidenceId: evidence.id,
    provider: "typhoon_ussd",
    rawResponse: {
      engine: "iapp_document_ocr",
      text: ocr.data?.text,
      time: ocr.data?.time,
      parsed,
    },
    extracted,
    confidence,
  });

  const phoneMatches = compareIdentities(extracted, dga, ["citizenId", "phoneLast4"], {
    leftSource: "phone_response",
    rightSource: "dga_capture",
  }).map((item) => ({ ...item, matchType: PHONE_VS_DGA_MATCH_TYPES[item.matchType] ?? item.matchType }));
  const matchWordFound = parsed.matchWordFound;
  const matches = await replaceMatchResults(sessionId, [
    ...phoneMatches,
    {
      matchType: "phone_response_contains_trong_kap",
      leftSource: "phone_response",
      rightSource: "ocr_text",
      leftValue: matchWordFound ? "ตรงกับ" : "",
      rightValue: "ตรงกับ",
      score: matchWordFound ? 1 : 0,
      threshold: 1,
      matched: matchWordFound,
      reason: matchWordFound ? "match_word_found" : "match_word_missing",
    },
  ]);
  const allPassed = matches.every((match) => match.matched);
  lapAndEmit(sw, sse, "cross_match_db");

  if (!allPassed) {
    await auditWizardEvent({
      sessionId,
      actor: "system",
      event: "s3.phone_response.match_failed",
      payload: {
        confidence,
        failedMatches: matches.filter((match) => !match.matched).map((match) => match.matchType),
      },
    });
    return {
      status: 200,
      body: {
        ok: false,
        state: sessionState,
        error: "Phone response OCR must match DGA citizen ID, DGA phone last-4, and contain the word ตรงกับ.",
        extracted,
        confidence,
        matches,
        _timings_ms: sw.snapshot(),
      },
    };
  }

  const updated = await transitionWizardSession({
    sessionId,
    toState: "S4_BANKBOOK_UPLOAD",
    actor: "system",
    event: "s3.phone_response.ocr_match",
    payload: { confidence, timings_ms: sw.snapshot() },
  });

  return {
    status: 200,
    body: {
      ok: true,
      state: updated.state,
      extracted,
      confidence,
      matches,
      _timings_ms: sw.snapshot(),
    },
  };
}

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  const useSSE = clientWantsSSE(req);
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S3_PHONE_RESPONSE") return jsonError(`Expected S3_PHONE_RESPONSE, got ${session.state}`, 409);
    const dga = await latestExtractedIdentity(params.sid, DGA_PROVIDER);
    if (!dga) return jsonError("Missing DGA capture OCR for phone response match", 409);

    const form = await req.formData();
    const image = getFileField(form, ["image", "ussd"]);
    if (!image) return jsonError('Multipart field "image" is required');
    assertFileSize(image, MAX_SCREENSHOT_BYTES, "USSD screenshot");

    const buffer = await fileToBuffer(image);

    if (useSSE) {
      const sse: SSEStream = createSSEStream();
      processUssd({ sw, sse, sessionId: params.sid, sessionState: session.state, dga, image, buffer })
        .then(({ body }) => sse.emit("result", body))
        .catch((err) => sse.emit("error", { message: err instanceof Error ? err.message : String(err) }))
        .finally(() => sse.close());
      return sse.response;
    }

    const result = await processUssd({ sw, sse: null, sessionId: params.sid, sessionState: session.state, dga, image, buffer });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
