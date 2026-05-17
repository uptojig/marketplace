import { iapp } from "./iapp-client";
import type { OcrIdCardFrontResult } from "./types";
import {
  validateThaiIdChecksum,
  parseIappDate,
  formatThaiBuddhistDateFromIappEnglish,
} from "./thai-id-validator";
import { scoreSubmission, type Decision } from "./scoring";

const DEFAULT_FACE_THRESHOLD = 36;
const DEFAULT_MAX_SELFIE_ATTEMPTS = 3;

export type CaptureMode = "upload";
type MatchStatus = "match" | "mismatch" | "unreadable";

export interface CaptureMetadata {
  mode: CaptureMode;
  attemptIndex: number;
  maxAttempts: number;
  capturedAt?: string;
  imageWidth?: number;
  imageHeight?: number;
  fileSize?: number;
}

function toPositiveInt(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value as number));
}

function normalizeCapture(capture?: Partial<CaptureMetadata>): CaptureMetadata {
  return {
    mode: "upload",
    attemptIndex: toPositiveInt(capture?.attemptIndex, 1),
    maxAttempts: toPositiveInt(capture?.maxAttempts, DEFAULT_MAX_SELFIE_ATTEMPTS),
    capturedAt: capture?.capturedAt,
    imageWidth: capture?.imageWidth,
    imageHeight: capture?.imageHeight,
    fileSize: capture?.fileSize,
  };
}

function normalizeIdNumber(value?: string): string | null {
  if (!value) return null;
  const digits = value.replace(/\D+/g, "").trim();
  return digits.length > 0 ? digits : null;
}

function normalizeName(value?: string): string | null {
  if (!value) return null;
  return (
    value
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim() || null
  );
}

function resolveThaiName(record: OcrIdCardFrontResult): string | null {
  const merged =
    record.th_name?.trim() ||
    [record.th_init, record.th_fname, record.th_lname]
      .filter(Boolean)
      .join(" ")
      .trim();
  return merged || null;
}

function resolveEnglishName(record: OcrIdCardFrontResult): string | null {
  const merged =
    record.en_name?.trim() ||
    [record.en_init, record.en_fname, record.en_lname]
      .filter(Boolean)
      .join(" ")
      .trim();
  return merged || null;
}

interface HeldIdEvidence {
  status: "ok" | "unreadable";
  source: "selfie_full" | "selfie_card_crop";
  id_number?: string;
  th_name?: string;
  en_name?: string;
  ocr_confidence?: number;
  id_number_status: MatchStatus;
  name_status: MatchStatus;
  error?: string;
}

// Levenshtein distance for short strings — used only for tolerant
// citizen-ID comparison where held-ID OCR may drop a single digit.
function shortLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1).fill(0).map((_, i) => i);
  const curr = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let k = 0; k <= b.length; k += 1) prev[k] = curr[k];
  }
  return prev[b.length];
}

function idsLooselyEqual(main: string, held: string): boolean {
  if (main === held) return true;
  // Accept exact substring containment (handles "drop one digit at edge").
  if (main.length === 13 && held.length === 12 && main.includes(held)) return true;
  if (held.length === 13 && main.length === 12 && held.includes(main)) return true;
  // Allow 1 edit on 13-digit IDs (one OCR character flip).
  if (Math.abs(main.length - held.length) <= 1 && main.length >= 12 && held.length >= 12) {
    return shortLevenshtein(main, held) <= 1;
  }
  return false;
}

function tokenize(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

function namesLooselyEqual(main: string, held: string): boolean {
  if (main === held) return true;
  const mainTokens = new Set(tokenize(main));
  const heldTokens = new Set(tokenize(held));
  if (mainTokens.size === 0 || heldTokens.size === 0) return false;
  let overlap = 0;
  for (const t of heldTokens) if (mainTokens.has(t)) overlap += 1;
  // Token-set ratio ≥ 0.7. With 3-token Thai names ("นาย first last"),
  // ≥ 0.7 means at least 2/3 tokens match.
  const ratio = (2 * overlap) / (mainTokens.size + heldTokens.size);
  if (ratio >= 0.7) return true;
  // Allow 1-2 character edit on the longest name candidate (OCR flip).
  const dist = shortLevenshtein(main, held);
  const maxLen = Math.max(main.length, held.length);
  return maxLen > 0 && dist <= Math.max(1, Math.floor(maxLen * 0.1));
}

function evaluateHeldIdEvidence(
  mainOcr: OcrIdCardFrontResult,
  heldOcr: OcrIdCardFrontResult | null,
  heldOcrError?: string,
  source: HeldIdEvidence["source"] = "selfie_full",
): HeldIdEvidence {
  if (!heldOcr) {
    return {
      status: "unreadable",
      source,
      id_number_status: "unreadable",
      name_status: "unreadable",
      error: heldOcrError,
    };
  }

  const mainId = normalizeIdNumber(mainOcr.id_number);
  const heldId = normalizeIdNumber(heldOcr.id_number);
  let idStatus: MatchStatus = "unreadable";
  if (mainId && heldId) {
    // OCR on the cropped held-ID is noisier than the standalone ID image
    // (smaller source crop, perspective-corrected). A 1-char edit distance
    // on a 13-digit Thai citizen ID still uniquely identifies the same
    // person (false-collision probability ≈ 0). Treat as match.
    idStatus = idsLooselyEqual(mainId, heldId) ? "match" : "mismatch";
  }

  const mainNameCandidates = [
    normalizeName(resolveThaiName(mainOcr) ?? undefined),
    normalizeName(resolveEnglishName(mainOcr) ?? undefined),
  ].filter((item): item is string => Boolean(item));

  const heldNameCandidates = [
    normalizeName(resolveThaiName(heldOcr) ?? undefined),
    normalizeName(resolveEnglishName(heldOcr) ?? undefined),
  ].filter((item): item is string => Boolean(item));

  let nameStatus: MatchStatus = "unreadable";
  if (mainNameCandidates.length > 0 && heldNameCandidates.length > 0) {
    // Token-overlap match — held-ID OCR can flip 1-2 characters (e.g.
    // บ→ป) without changing the underlying identity. Require ≥70% token
    // overlap to count as match.
    const matched = mainNameCandidates.some((main) =>
      heldNameCandidates.some((held) => namesLooselyEqual(main, held)),
    );
    nameStatus = matched ? "match" : "mismatch";
  }

  const status = idStatus === "unreadable" && nameStatus === "unreadable" ? "unreadable" : "ok";
  return {
    status,
    source,
    id_number: heldOcr.id_number,
    th_name: resolveThaiName(heldOcr) ?? undefined,
    en_name: resolveEnglishName(heldOcr) ?? undefined,
    ocr_confidence: heldOcr.detection_score,
    id_number_status: idStatus,
    name_status: nameStatus,
  };
}

export interface VerificationResult {
  scenario: string;
  decision: Decision;
  overall: string;
  failedChecks: string[];
  capture: {
    mode: CaptureMode;
    attempt_index: number;
    max_attempts: number;
    captured_at?: string;
    image_width?: number;
    image_height?: number;
    file_size?: number;
  };
  breakdown: {
    ocr_confidence: number;
    liveness: {
      predict: string;
      real_probability: number;
      spoof_probability: number;
      darkness?: number;
    };
    face_match: {
      matched: boolean;
      score: number;
      threshold: number;
      normalized_score: number;
    };
    held_id_from_selfie: HeldIdEvidence;
    identity_evidence: {
      id_number_match: boolean | null;
      name_match: boolean | null;
      face_match: boolean;
      liveness_predict: "REAL" | "SPOOF";
    };
    id_number: string;
    th_name?: string;
    en_name?: string;
    dobRaw?: string;
    address?: string;
    expiryRaw: string;
    expiryTh?: string;
    expiryEn: string;
    checksumValid: boolean;
    notExpired: boolean;
  };
  face_from_card_base64?: string;
  cost_ic: string;
  timings_ms: { ocr: number; liveness: number; verify: number; held_ocr: number; total: number };
}

export interface CallTelemetry {
  ts: string;
  scenario: string;
  endpoint: "ocr" | "liveness" | "face-verification" | "held-id-ocr";
  ic: number;
  ms: number;
}

export interface RunOptions {
  returnFaceImage?: boolean;
  heldIdOcrBuffer?: Buffer;
  onStep?: (
    step: "ocr" | "liveness" | "verify" | "held_ocr",
    state: "start" | "done",
  ) => void;
  onCall?: (entry: CallTelemetry) => void | Promise<void>;
  capture?: Partial<CaptureMetadata>;
}

export async function runVerification(
  name: string,
  idBuffer: Buffer,
  selfieBuffer: Buffer,
  opts: RunOptions = {},
): Promise<VerificationResult> {
  const { returnFaceImage = false, onStep, onCall } = opts;
  const capture = normalizeCapture(opts.capture);
  const ts = () => new Date().toISOString();
  const emit = async (entry: CallTelemetry) => {
    if (onCall) await onCall(entry);
  };

  onStep?.("ocr", "start");
  const ocr = await iapp.ocrThaiIdFront(idBuffer);
  await emit({ ts: ts(), scenario: name, endpoint: "ocr", ic: ocr.ic, ms: ocr.ms });
  onStep?.("ocr", "done");

  onStep?.("liveness", "start");
  const liveness = await iapp.liveness(selfieBuffer);
  await emit({
    ts: ts(),
    scenario: name,
    endpoint: "liveness",
    ic: liveness.ic,
    ms: liveness.ms,
  });
  onStep?.("liveness", "done");

  onStep?.("verify", "start");
  const faceCardBuf = Buffer.from(ocr.data.face, "base64");
  const verify = await iapp.faceVerification(selfieBuffer, faceCardBuf);
  await emit({
    ts: ts(),
    scenario: name,
    endpoint: "face-verification",
    ic: verify.ic,
    ms: verify.ms,
  });
  onStep?.("verify", "done");

  onStep?.("held_ocr", "start");
  let heldOcr: OcrIdCardFrontResult | null = null;
  let heldOcrIc = 0;
  let heldOcrMs = 0;
  let heldOcrError: string | undefined;
  const heldOcrBuffer = opts.heldIdOcrBuffer ?? selfieBuffer;
  const heldOcrSource: HeldIdEvidence["source"] = opts.heldIdOcrBuffer
    ? "selfie_card_crop"
    : "selfie_full";
  try {
    const heldResult = await iapp.ocrThaiIdFront(heldOcrBuffer);
    heldOcr = heldResult.data;
    heldOcrIc = heldResult.ic;
    heldOcrMs = heldResult.ms;
    await emit({
      ts: ts(),
      scenario: name,
      endpoint: "held-id-ocr",
      ic: heldResult.ic,
      ms: heldResult.ms,
    });
  } catch (err) {
    heldOcrError = err instanceof Error ? err.message : String(err);
  }
  onStep?.("held_ocr", "done");

  const checksumValid = validateThaiIdChecksum(ocr.data.id_number);
  const expiryDate = parseIappDate(ocr.data.en_expire);
  const expiryTh =
    ocr.data.th_expire ||
    formatThaiBuddhistDateFromIappEnglish(ocr.data.en_expire) ||
    undefined;
  const notExpired = expiryDate ? expiryDate > new Date() : false;

  const livenessReal =
    liveness.data.normalized?.REAL ?? liveness.data.data?.REAL ?? 0;
  const livenessSpoof =
    liveness.data.normalized?.SPOOF ?? liveness.data.data?.SPOOF ?? 0;

  const faceMatched = verify.data.matched;
  const faceScore = verify.data.score ?? 0;
  const faceThreshold = verify.data.threshold ?? DEFAULT_FACE_THRESHOLD;
  const faceNormalized = Math.min(1, Math.max(0, faceScore / (2 * faceThreshold)));

  const heldEvidence = evaluateHeldIdEvidence(ocr.data, heldOcr, heldOcrError, heldOcrSource);
  const idNumberMatch =
    heldEvidence.id_number_status === "match"
      ? true
      : heldEvidence.id_number_status === "mismatch"
        ? false
        : null;
  const nameMatch =
    heldEvidence.name_status === "match"
      ? true
      : heldEvidence.name_status === "mismatch"
        ? false
        : null;

  const score = scoreSubmission({
    ocrConfidence: ocr.data.detection_score,
    checksumValid,
    livenessScore: livenessReal,
    livenessPredict: liveness.data.predict,
    faceMatchScore: faceNormalized,
    faceMatch: faceMatched,
    notExpired,
    heldIdNumberStatus: heldEvidence.id_number_status,
    heldNameStatus: heldEvidence.name_status,
    attemptIndex: capture.attemptIndex,
    maxSelfieAttempts: capture.maxAttempts,
  });

  const thName = resolveThaiName(ocr.data);
  const enName = resolveEnglishName(ocr.data);

  const result: VerificationResult = {
    scenario: name,
    decision: score.decision,
    overall: score.overall.toFixed(3),
    failedChecks: score.failedChecks,
    capture: {
      mode: capture.mode,
      attempt_index: capture.attemptIndex,
      max_attempts: capture.maxAttempts,
      captured_at: capture.capturedAt,
      image_width: capture.imageWidth,
      image_height: capture.imageHeight,
      file_size: capture.fileSize,
    },
    breakdown: {
      ocr_confidence: ocr.data.detection_score,
      liveness: {
        predict: liveness.data.predict,
        real_probability: livenessReal,
        spoof_probability: livenessSpoof,
        darkness: liveness.data.darkness,
      },
      face_match: {
        matched: faceMatched,
        score: faceScore,
        threshold: faceThreshold,
        normalized_score: faceNormalized,
      },
      held_id_from_selfie: heldEvidence,
      identity_evidence: {
        id_number_match: idNumberMatch,
        name_match: nameMatch,
        face_match: faceMatched,
        liveness_predict: liveness.data.predict,
      },
      id_number: ocr.data.id_number,
      th_name: thName || undefined,
      en_name: enName || undefined,
      dobRaw: ocr.data.en_dob || ocr.data.th_dob || undefined,
      address: ocr.data.address || undefined,
      expiryRaw: ocr.data.en_expire,
      expiryTh,
      expiryEn: ocr.data.en_expire,
      checksumValid,
      notExpired,
    },
    cost_ic: (ocr.ic + liveness.ic + verify.ic + heldOcrIc).toFixed(2),
    timings_ms: {
      ocr: ocr.ms,
      liveness: liveness.ms,
      verify: verify.ms,
      held_ocr: heldOcrMs,
      total: ocr.ms + liveness.ms + verify.ms + heldOcrMs,
    },
  };

  if (returnFaceImage) {
    result.face_from_card_base64 = ocr.data.face;
  }

  return result;
}
