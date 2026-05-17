import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Identity } from "@/types/identity";
import { parseIappDate } from "./thai-id-validator";

export const MAX_ID_BYTES = 10 * 1024 * 1024;
export const MAX_SELFIE_BYTES = 2 * 1024 * 1024;
export const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024;

// Provider string written to wizard_ocr_results.provider for the canonical
// merged DGA identity. Every downstream cross-match step (s1, s4, s5, s6)
// reads it via latestExtractedIdentity(sid, DGA_PROVIDER). Per-image
// forensic rows use `${DGA_PROVIDER}_image_1` / `_image_2`.
//
// The value is intentionally vendor-agnostic ("dga") even though OCR is
// currently performed by iApp Document OCR. If we swap providers again,
// the schema stays stable and downstream lookups continue to work.
export const DGA_PROVIDER = "dga";

export function jsonError(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

// Lap-style stopwatch for instrumenting wizard routes. Each `lap(label)`
// records the elapsed time SINCE the previous lap (not since start), so the
// resulting record reads as a stage-by-stage breakdown of where time goes.
// `snapshot()` adds a `_total_ms` field for the full route duration.
export interface Stopwatch {
  lap(label: string): void;
  snapshot(): Record<string, number>;
}
export function createStopwatch(): Stopwatch {
  const start = performance.now();
  let last = start;
  const laps: Record<string, number> = {};
  return {
    lap(label) {
      const now = performance.now();
      laps[label] = Math.round((now - last) * 100) / 100;
      last = now;
    },
    snapshot() {
      return { ...laps, _total_ms: Math.round((performance.now() - start) * 100) / 100 };
    },
  };
}

export function readTextField(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

export function readJsonBody<T extends Record<string, unknown>>(body: unknown): T {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be a JSON object");
  }
  return body as T;
}

export function getFileField(form: FormData, names: string[]): File | null {
  for (const name of names) {
    const value = form.get(name);
    if (value && typeof value !== "string") return value as File;
  }
  return null;
}

export async function fileToBuffer(file: File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}

export function assertFileSize(file: File, maxBytes: number, label: string) {
  if (file.size > maxBytes) {
    throw new Error(`${label} is too large (${file.size} bytes). Max allowed is ${maxBytes} bytes.`);
  }
}

export async function requireWizardSession(sessionId: string) {
  const session = await prisma.wizardSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error("Wizard session not found");
  if (session.terminalAt) throw new Error(`Wizard session is already terminal: ${session.state}`);
  if (session.expiresAt < new Date()) throw new Error("Wizard session expired");
  return session;
}

export async function latestExtractedIdentity(
  sessionId: string,
  provider: string,
): Promise<Identity | null> {
  const row = await prisma.wizardOcrResult.findFirst({
    where: { sessionId, provider },
    orderBy: { createdAt: "desc" },
  });
  return row?.extracted as Identity | null;
}

export async function saveOcrResult(args: {
  sessionId: string;
  evidenceId: string;
  provider: string;
  rawResponse: unknown;
  extracted: unknown;
  confidence?: number | null;
}) {
  return prisma.wizardOcrResult.create({
    data: {
      sessionId: args.sessionId,
      evidenceId: args.evidenceId,
      provider: args.provider,
      rawResponse: args.rawResponse as never,
      extracted: args.extracted as never,
      confidence: args.confidence ?? undefined,
    },
  });
}

export async function replaceMatchResults(
  sessionId: string,
  results: Array<{
    matchType: string;
    leftSource: string;
    rightSource: string;
    leftValue?: string;
    rightValue?: string;
    score?: number;
    threshold?: number;
    matched: boolean;
    reason?: string;
  }>,
) {
  const matchTypes = Array.from(new Set(results.map((result) => result.matchType)));
  await prisma.wizardMatchResult.deleteMany({
    where: { sessionId, matchType: { in: matchTypes } },
  });
  if (results.length === 0) return [];
  await prisma.wizardMatchResult.createMany({
    data: results.map((result) => ({
      sessionId,
      matchType: result.matchType,
      leftSource: result.leftSource,
      rightSource: result.rightSource,
      leftValue: result.leftValue,
      rightValue: result.rightValue,
      score: result.score,
      threshold: result.threshold,
      matched: result.matched,
      reason: result.reason,
    })),
  });
  return prisma.wizardMatchResult.findMany({
    where: { sessionId, matchType: { in: matchTypes } },
    orderBy: { createdAt: "asc" },
  });
}

export function identityFromVerificationResult(result: {
  breakdown: {
    id_number: string;
    th_name?: string;
    en_name?: string;
    dobRaw?: string;
    address?: string;
  };
}): Identity {
  const dob = result.breakdown.dobRaw ? parseIappDate(result.breakdown.dobRaw) : null;
  return {
    citizenId: result.breakdown.id_number.replace(/\D+/g, ""),
    thName: result.breakdown.th_name ? { full: result.breakdown.th_name } : undefined,
    enName: result.breakdown.en_name ? { full: result.breakdown.en_name } : undefined,
    dob: dob ? dob.toISOString().slice(0, 10) : result.breakdown.dobRaw,
    address: result.breakdown.address ? { full: result.breakdown.address } : undefined,
  };
}
