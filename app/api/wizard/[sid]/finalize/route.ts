import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markOutlookCredentialUsed } from "@/lib/kyc/outlook-credentials";
import { jsonError, requireWizardSession } from "@/lib/kyc/wizard-api";
import { transitionWizardSession, type WizardState } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CRITICAL_MATCH_TYPES = new Set(["face_verify", "id_vs_dga_cid", "ussd_vs_dga_cid"]);

export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S7_DECIDE") return jsonError(`Expected S7_DECIDE, got ${session.state}`, 409);

    const [matches, ocrResults] = await Promise.all([
      prisma.wizardMatchResult.findMany({ where: { sessionId: params.sid }, orderBy: { createdAt: "asc" } }),
      prisma.wizardOcrResult.findMany({ where: { sessionId: params.sid }, orderBy: { createdAt: "asc" } }),
    ]);

    const failedMatches = matches.filter((match) => !match.matched);
    const criticalMismatch = failedMatches.some((match) => CRITICAL_MATCH_TYPES.has(match.matchType));
    const lowConfidence = ocrResults.some(
      (result) => result.confidence !== null && Number(result.confidence) < 0.8,
    );
    const allMatched = matches.length > 0 && failedMatches.length === 0;

    const decision: WizardState = criticalMismatch
      ? "REJECTED"
      : lowConfidence
        ? "MANUAL_REVIEW"
        : allMatched
          ? "AUTO_APPROVED"
          : "REJECTED";

    const reasons = [
      ...failedMatches.map((match) => `${match.matchType}:${match.reason ?? "mismatch"}`),
      ...(lowConfidence ? ["ocr_confidence_below_0.80"] : []),
    ];

    if (decision === "AUTO_APPROVED") await markOutlookCredentialUsed(params.sid);
    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: decision,
      actor: "system",
      event: "s7.finalize",
      payload: { decision, reasons },
    });

    return NextResponse.json({ ok: true, state: updated.state, decision, reasons });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
