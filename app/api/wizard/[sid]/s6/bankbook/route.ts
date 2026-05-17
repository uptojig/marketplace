import { NextResponse } from "next/server";
import { recordIappCost } from "@/lib/kyc/cost-tracker";
import { fromIappBookBank } from "@/lib/kyc/identity-extract";
import { compareIdentities } from "@/lib/kyc/identity-match";
import { iapp } from "@/lib/kyc/iapp-client";
import {
  assertFileSize,
  createStopwatch,
  DGA_PROVIDER,
  fileToBuffer,
  getFileField,
  jsonError,
  latestExtractedIdentity,
  MAX_ID_BYTES,
  replaceMatchResults,
  requireWizardSession,
  saveOcrResult,
} from "@/lib/kyc/wizard-api";
import { transitionWizardSession } from "@/lib/kyc/wizard-state";
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

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S4_BANKBOOK_UPLOAD") return jsonError(`Expected S4_BANKBOOK_UPLOAD, got ${session.state}`, 409);

    const dga = await latestExtractedIdentity(params.sid, DGA_PROVIDER);
    if (!dga) return jsonError("Missing DGA identity for bankbook match", 409);
    sw.lap("session_check");

    const form = await req.formData();
    const image = getFileField(form, ["image", "bankbook"]);
    if (!image) return jsonError('Multipart field "image" is required');
    assertFileSize(image, MAX_ID_BYTES, "Bankbook image");
    sw.lap("form_parse");

    const buffer = await fileToBuffer(image);
    const evidence = await uploadWizardEvidence({
      sessionId: params.sid,
      step: "S4_BANKBOOK",
      buffer,
      mime: image.type || "image/jpeg",
      filename: image.name,
    });
    sw.lap("evidence_upload");

    const ocr = await iapp.ocrBookBank(buffer);
    sw.lap("iapp_bookbank");
    await recordIappCost({ sessionId: params.sid, endpoint: "book-bank", ic: ocr.ic, ms: ocr.ms });
    const bankbookIdentity = fromIappBookBank(ocr.data);
    await saveOcrResult({
      sessionId: params.sid,
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
    const [savedMatch] = await replaceMatchResults(params.sid, [match]);

    const exact = savedMatch.matched && ["exact", "prefix_stripped_exact"].includes(savedMatch.reason ?? "");
    const nextState = savedMatch.matched ? "AUTO_APPROVED" : "REJECTED";
    sw.lap("cross_match_db");
    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: nextState,
      actor: "system",
      event: "s4.bankbook.ocr_match",
      payload: { matchStatus: exact ? "exact" : savedMatch.matched ? "matched" : "mismatch", timings_ms: sw.snapshot() },
    });

    return NextResponse.json({
      ok: savedMatch.matched,
      state: updated.state,
      account: bankbookIdentity.bankAccount,
      match_status: exact ? "exact" : savedMatch.matched ? "matched" : "mismatch",
      match: savedMatch,
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
