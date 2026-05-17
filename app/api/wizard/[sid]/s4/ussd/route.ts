import { NextResponse } from "next/server";
import { recordIappCost } from "@/lib/kyc/cost-tracker";
import { fromIappUssd } from "@/lib/kyc/identity-extract";
import { iapp } from "@/lib/kyc/iapp-client";
import { compareIdentities } from "@/lib/kyc/identity-match";
import {
  assertFileSize,
  createStopwatch,
  DGA_PROVIDER,
  fileToBuffer,
  getFileField,
  jsonError,
  latestExtractedIdentity,
  MAX_SCREENSHOT_BYTES,
  replaceMatchResults,
  requireWizardSession,
  saveOcrResult,
} from "@/lib/kyc/wizard-api";
import { auditWizardEvent, transitionWizardSession } from "@/lib/kyc/wizard-state";
import { uploadWizardEvidence } from "@/lib/kyc/wizard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PHONE_VS_DGA_MATCH_TYPES: Record<string, string> = {
  citizenId: "phone_response_vs_dga_cid",
  phoneLast4: "phone_response_last4_vs_dga_mobile",
};


export async function POST(req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S3_PHONE_RESPONSE") return jsonError(`Expected S3_PHONE_RESPONSE, got ${session.state}`, 409);
    const dga = await latestExtractedIdentity(params.sid, DGA_PROVIDER);
    if (!dga) return jsonError("Missing DGA capture OCR for phone response match", 409);
    sw.lap("session_check");

    const form = await req.formData();
    const image = getFileField(form, ["image", "ussd"]);
    if (!image) return jsonError('Multipart field "image" is required');
    assertFileSize(image, MAX_SCREENSHOT_BYTES, "USSD screenshot");
    sw.lap("form_parse");

    const buffer = await fileToBuffer(image);
    const evidence = await uploadWizardEvidence({
      sessionId: params.sid,
      step: "S3_PHONE_RESPONSE",
      buffer,
      mime: image.type || "image/png",
      filename: image.name,
    });
    sw.lap("evidence_upload");

    const ocr = await iapp.ocrDocument(buffer);
    sw.lap("iapp_document_ocr");
    await recordIappCost({ sessionId: params.sid, endpoint: "document-ocr-ussd", ic: ocr.ic, ms: ocr.ms });
    const parsed = fromIappUssd(ocr.data);
    sw.lap("anchor_parse");
    const extracted = { citizenId: parsed.citizenId, phoneLast4: parsed.phoneLast4 };
    // Confidence: 0.4 for CID found + 0.4 for phone last4 found + 0.2 for
    // match word — mirrors the old Typhoon scoring so downstream gates
    // don't need adjustment.
    const confidence =
      (parsed.citizenId?.length === 13 ? 0.4 : 0) +
      (parsed.phoneLast4?.length === 4 ? 0.4 : 0) +
      (parsed.matchWordFound ? 0.2 : 0);
    await saveOcrResult({
      sessionId: params.sid,
      evidenceId: evidence.id,
      // Provider name kept as `typhoon_ussd` so existing S5 cross-match
      // lookups (latestExtractedIdentity(sid, "typhoon_ussd")) keep working
      // without a coordinated migration. The semantics are now "USSD OCR
      // result", regardless of which engine produced it.
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
    const matches = await replaceMatchResults(params.sid, [
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

    if (!allPassed) {
      await auditWizardEvent({
        sessionId: params.sid,
        actor: "system",
        event: "s3.phone_response.match_failed",
        payload: {
          confidence: confidence,
          failedMatches: matches.filter((match) => !match.matched).map((match) => match.matchType),
        },
      });
      return NextResponse.json({
        ok: false,
        state: session.state,
        error: "Phone response OCR must match DGA citizen ID, DGA phone last-4, and contain the word ตรงกับ.",
        extracted,
        confidence: confidence,
        matches,
      });
    }

    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: "S4_BANKBOOK_UPLOAD",
      actor: "system",
      event: "s3.phone_response.ocr_match",
      payload: { confidence: confidence, timings_ms: sw.snapshot() },
    });

    return NextResponse.json({ ok: true, state: updated.state, extracted, confidence: confidence, matches, _timings_ms: sw.snapshot() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
