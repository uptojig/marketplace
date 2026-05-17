import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/kyc/wizard-api";
import { evidenceWithPresignedUrls } from "@/lib/kyc/wizard-storage";
import { getWizardSnapshot } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { sid: string } }) {
  try {
    const snapshot = await getWizardSnapshot(params.sid);
    if (!snapshot) return jsonError("Wizard session not found", 404);

    const [evidence, costRows, ocrRows, matches] = await Promise.all([
      evidenceWithPresignedUrls(params.sid),
      prisma.wizardCostLog.findMany({ where: { sessionId: params.sid }, orderBy: { ts: "asc" } }),
      prisma.wizardOcrResult.findMany({ where: { sessionId: params.sid }, orderBy: { createdAt: "asc" } }),
      prisma.wizardMatchResult.findMany({ where: { sessionId: params.sid }, orderBy: { createdAt: "asc" } }),
    ]);

    const cost = costRows.map((row) => ({
      provider: row.provider,
      endpoint: row.endpoint,
      units: Number(row.units),
      unitType: row.unitType,
      costThb: Number(row.costThb),
      durationMs: row.durationMs,
      ts: row.ts,
    }));
    const totalCostThb = cost.reduce((sum, row) => sum + row.costThb, 0);

    return NextResponse.json({
      ok: true,
      session: snapshot,
      decision: snapshot.finalDecision,
      evidence,
      ocr: ocrRows.map((row) => ({
        provider: row.provider,
        confidence: row.confidence === null ? null : Number(row.confidence),
        extracted: row.extracted,
        createdAt: row.createdAt,
      })),
      matches: matches.map((match) => ({
        matchType: match.matchType,
        leftSource: match.leftSource,
        rightSource: match.rightSource,
        score: match.score === null ? null : Number(match.score),
        threshold: match.threshold === null ? null : Number(match.threshold),
        matched: match.matched,
        reason: match.reason,
        createdAt: match.createdAt,
      })),
      cost,
      total_cost_thb: Number(totalCostThb.toFixed(4)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("not configured") ? 503 : 500);
  }
}
