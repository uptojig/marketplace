import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordIappCost } from "@/lib/kyc/cost-tracker";
import { fromIappBookBank } from "@/lib/kyc/identity-extract";
import { compareIdentities } from "@/lib/kyc/identity-match";
import { iapp } from "@/lib/kyc/iapp-client";
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
  MAX_ID_BYTES,
  replaceMatchResults,
  requireWizardSession,
  saveOcrResult,
  type SSEStream,
  type Stopwatch,
} from "@/lib/kyc/wizard-api";
import { invalidateWizardSteps, transitionWizardSession } from "@/lib/kyc/wizard-state";
import { uploadWizardEvidence } from "@/lib/kyc/wizard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function bankbookConfidence(data: { status?: string; message?: string; confidence?: string | number; account_name?: string; bank_book_results?: { account_name?: string } }) {
  const rawConfidence = Number(data.confidence);
  if (Number.isFinite(rawConfidence) && rawConfidence > 0) return rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;
  const success = data.status === "success" || data.status === "200" || data.message?.toLowerCase() === "success";
  const hasHolder = Boolean(data.account_name || data.bank_book_results?.account_name);
  return success && hasHolder ? 1 : 0;
}

async function processBankbook(args: {
  sw: Stopwatch;
  sse: SSEStream | null;
  sessionId: string;
  dga: NonNullable<Awaited<ReturnType<typeof latestExtractedIdentity>>>;
  image: File;
  buffer: Buffer;
  priorAdvisories: string[];
}): Promise<{ status: number; body: Record<string, unknown> }> {
  const { sw, sse, sessionId, dga, image, buffer, priorAdvisories } = args;
  lapAndEmit(sw, sse, "session_check");
  lapAndEmit(sw, sse, "form_parse");

  await invalidateWizardSteps(sessionId, "S4_BANKBOOK");

  const evidencePromise = uploadWizardEvidence({
    sessionId,
    step: "S4_BANKBOOK",
    buffer,
    mime: image.type || "image/jpeg",
    filename: image.name,
  });
  const ocrPromise = iapp.ocrBookBank(buffer);
  const [evidence, ocr] = await Promise.all([evidencePromise, ocrPromise]);
  lapAndEmit(sw, sse, "evidence_and_ocr_parallel");
  await recordIappCost({ sessionId, endpoint: "book-bank", ic: ocr.ic, ms: ocr.ms });

  const bankbookIdentity = fromIappBookBank(ocr.data);
  await saveOcrResult({
    sessionId,
    evidenceId: evidence.id,
    provider: "iapp_bankbook",
    rawResponse: ocr.data,
    extracted: bankbookIdentity,
    confidence: bankbookConfidence(ocr.data),
  });

  const [match] = compareIdentities(bankbookIdentity, dga, ["bankbookName"], {
    leftSource: "bankbook",
    rightSource: "dga_golden",
  }).map((item) => ({ ...item, matchType: "bankbook_name" }));
  const [savedMatch] = await replaceMatchResults(sessionId, [match]);
  lapAndEmit(sw, sse, "cross_match_db");

  const exact = savedMatch.matched && ["exact", "prefix_stripped_exact"].includes(savedMatch.reason ?? "");
  // If any earlier step raised an advisory (e.g. face match failed at S5
  // even though cid+name+dob matched DGA), the auto-decision can't be
  // AUTO_APPROVED — an admin needs to eyeball the soft fail.
  const hasPriorAdvisory = priorAdvisories.length > 0;
  const nextState = savedMatch.matched
    ? hasPriorAdvisory
      ? "MANUAL_REVIEW"
      : "AUTO_APPROVED"
    : "REJECTED";

  // Load session metadata to preserve existing fields
  const sessionData = await prisma.wizardSession.findUnique({
    where: { id: sessionId },
    select: { metadata: true },
  });
  const existingMeta =
    sessionData?.metadata && typeof sessionData.metadata === "object" && !Array.isArray(sessionData.metadata)
      ? (sessionData.metadata as Record<string, unknown>)
      : {};

  await prisma.wizardSession.update({
    where: { id: sessionId },
    data: {
      metadata: {
        ...existingMeta,
        pendingDecision: nextState,
      },
    },
  });

  const updated = await transitionWizardSession({
    sessionId,
    toState: "S5_SUMMARY",
    actor: "system",
    event: "s4.bankbook.ocr_match",
    payload: {
      matchStatus: exact ? "exact" : savedMatch.matched ? "matched" : "mismatch",
      priorAdvisories,
      timings_ms: sw.snapshot(),
    },
  });

  return {
    status: 200,
    body: {
      ok: savedMatch.matched,
      state: updated.state,
      account: bankbookIdentity.bankAccount,
      match_status: exact ? "exact" : savedMatch.matched ? "matched" : "mismatch",
      match: savedMatch,
      _timings_ms: sw.snapshot(),
    },
  };
}

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  const useSSE = clientWantsSSE(req);
  try {
    const session = await requireWizardSession(params.sid);
    const ACTIVE_FLOW_STATES = ["S4_BANKBOOK_UPLOAD", "S5_SUMMARY"];
    if (!ACTIVE_FLOW_STATES.includes(session.state)) {
      return jsonError(`Expected active bankbook upload state, got ${session.state}`, 409);
    }

    if (session.state !== "S4_BANKBOOK_UPLOAD") {
      await transitionWizardSession({
        sessionId: params.sid,
        toState: "S4_BANKBOOK_UPLOAD",
        actor: "vendor",
        event: "s4.bankbook.reopened_upload",
        payload: { priorState: session.state },
      });
      await invalidateWizardSteps(params.sid, "S4_BANKBOOK");
    }

    const dga = await latestExtractedIdentity(params.sid, DGA_PROVIDER);
    if (!dga) return jsonError("Missing DGA identity for bankbook match", 409);

    const meta =
      session.metadata && typeof session.metadata === "object" && !Array.isArray(session.metadata)
        ? (session.metadata as Record<string, unknown>)
        : {};
    const priorAdvisories: string[] = Array.isArray(meta.softFails)
      ? (meta.softFails as string[])
      : [];

    const form = await req.formData();
    const image = getFileField(form, ["image", "bankbook"]);
    if (!image) return jsonError('Multipart field "image" is required');
    assertFileSize(image, MAX_ID_BYTES, "Bankbook image");

    const buffer = await fileToBuffer(image);

    if (useSSE) {
      const sse: SSEStream = createSSEStream();
      processBankbook({ sw, sse, sessionId: params.sid, dga, image, buffer, priorAdvisories })
        .then(({ body }) => sse.emit("result", body))
        .catch((err) => sse.emit("error", { message: err instanceof Error ? err.message : String(err) }))
        .finally(() => sse.close());
      return sse.response;
    }

    const result = await processBankbook({
      sw, sse: null, sessionId: params.sid, dga, image, buffer, priorAdvisories,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
