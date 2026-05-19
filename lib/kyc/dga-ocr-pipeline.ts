import sharp from "sharp";
import type { Identity } from "@/types/identity";
import { DGA_REQUIRED_KEYS, DGA_FIELD_RULES, extractFieldsFromIdentity } from "@/lib/kyc/dga-fields";
import { stripBrowserChromeFromPages } from "@/lib/kyc/browser-chrome-filter";
import { fromTyphoonDga, stripLeakedUrlFromEmail } from "@/lib/kyc/identity-extract";
import { iapp } from "@/lib/kyc/iapp-client";
import type { IappCallResult, OcrDocumentResult } from "@/lib/kyc/types";

export type DgaOcrPassName = "original" | "upscale_sharpen" | "upscale_threshold";

export interface DgaOcrPassResult {
  name: DgaOcrPassName;
  width: number | null;
  height: number | null;
  score: number;
  requiredFilled: number;
  missingRequired: string[];
  missingCritical: string[];
  identity: Identity;
  rawOcr: OcrDocumentResult;
  cleanedOcr: OcrDocumentResult;
  excludedBrowserChrome: Array<{ line: string; reason: string }>;
  cost: { endpoint: string; ic: number; ms: number };
}

export interface DgaOcrPipelineResult {
  selected: DgaOcrPassResult;
  passes: DgaOcrPassResult[];
  costEntries: Array<{ endpoint: string; ic: number; ms: number }>;
}

const CRITICAL_KEYS = new Set(["firstName", "lastName", "phone", "mobilePhone", "email"]);
const NARROW_SCREEN_WIDTH = 900;
const UPSCALE_WIDTH = 1092;
const UPSCALE_STRONG_WIDTH = 1638;

function digitsOnly(value: string | undefined): string {
  return (value ?? "").replace(/\D+/g, "");
}

function normalizeLine(value: string): string {
  return value
    .replace(/[>›»]+/g, " ")
    .replace(/\u2713/g, " ")
    .replace(/[|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toLines(pages: string[]): string[] {
  return pages
    .join("\n")
    .split(/\r?\n/)
    .map((line) => normalizeLine(line))
    .filter(Boolean);
}

function matchesPattern(pattern: RegExp, line: string): boolean {
  const copy = new RegExp(pattern.source, pattern.flags.replace("g", ""));
  return copy.test(line);
}

function replacePattern(pattern: RegExp, line: string): string {
  const copy = new RegExp(pattern.source, pattern.flags.replace("g", ""));
  return normalizeLine(line.replace(copy, " "));
}

function getFieldPattern(key: string): RegExp | null {
  const rule = DGA_FIELD_RULES.find((item) => item.key === key);
  if (!rule) return null;
  return new RegExp(rule.labelPattern.source, rule.labelPattern.flags.replace("g", ""));
}

function isLabelLine(line: string): boolean {
  return DGA_FIELD_RULES.some((rule) => matchesPattern(rule.labelPattern, line));
}

function isLikelyThaiName(value: string): boolean {
  if (!value) return false;
  if (!/^[\u0E00-\u0E7F\s]+$/u.test(value)) return false;
  const compact = value.replace(/\s+/g, "");
  return compact.length >= 2 && compact.length <= 30;
}

function isLikelyAddress(value: string): boolean {
  if (!value || value.length < 10) return false;
  return /[\u0E00-\u0E7F]/u.test(value) && /[\d/]/.test(value);
}

function isLikelyPhone(value: string): boolean {
  return digitsOnly(value).length === 10;
}

function isLikelyMobile(value: string): boolean {
  const digits = digitsOnly(value);
  return /^0[689]\d{8}$/.test(digits);
}

function isLikelyEmail(value: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
}

function shouldSkipNameToken(value: string): boolean {
  return [
    "นาย",
    "นาง",
    "นางสาว",
    "ชื่อกลาง",
    "ข้อมูลส่วนบุคคล",
    "รายละเอียดข้อมูลส่วนบุคคล",
  ].includes(value);
}

function extractThaiDateFromText(value: string): string | undefined {
  const match = value.match(/\b\d{1,2}\s+[\u0E00-\u0E7F.]+\s+\d{4}\b/u);
  return match?.[0]?.trim();
}

function extractCitizenIdFromText(value: string): string | undefined {
  return value.match(/\d-\d{4}-\d{5}-\d{2}-\d|\b\d{13}\b/)?.[0];
}

function extractEmailFromLines(lines: string[]): string | undefined {
  for (let i = 0; i < lines.length; i += 1) {
    let candidate = lines[i] ?? "";
    if (/@/.test(candidate) && /^[A-Za-z]{1,4}$/.test(lines[i + 1] ?? "")) {
      candidate += lines[i + 1];
    }
    const hit = candidate.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    if (hit?.[0]) return stripLeakedUrlFromEmail(hit[0]);
  }
  const blob = lines.join(" ").replace(/@\s+/g, "@").replace(/\.\s+/g, ".");
  const hit = blob.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return stripLeakedUrlFromEmail(hit?.[0]);
}

function extractPhoneCandidates(lines: string[]): Array<{ raw: string; digits: string; hasDash: boolean }> {
  const out: Array<{ raw: string; digits: string; hasDash: boolean }> = [];
  const seen = new Set<string>();
  const blob = lines.join(" ");
  const matches = blob.match(/\b0\d(?:[-\s]?\d){8,10}\b/g) ?? [];
  for (const raw of matches) {
    const digits = digitsOnly(raw);
    if (digits.length !== 10) continue;
    if (seen.has(digits)) continue;
    seen.add(digits);
    out.push({ raw: raw.trim(), digits, hasDash: raw.includes("-") });
  }
  return out;
}

function extractAddressCandidates(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if (isLabelLine(line)) continue;
    if (!isLikelyAddress(line)) continue;
    if (/เบอร์โทร|โทรศัพท์/.test(line)) continue;
    if (/เลขประจําตัว|เลขประจำตัว|ประชาชน 13/.test(line)) continue;
    if (/^\d{1,2}\s+[\u0E00-\u0E7F.]+\s+\d{4}$/.test(line)) continue;
    if (/\b0\d(?:[-\s]?\d){8,10}\b/.test(line)) continue;
    const cleaned = normalizeLine(line.replace(/\b0\d(?:[-\s]?\d){8,10}\b/g, " "));
    if (cleaned.length >= 10) out.push(cleaned);
  }
  return out;
}

function cleanAddressArtifacts(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let cleaned = normalizeLine(
    value
      .replace(/ประจ[ํำ]ตัว/g, " ")
      .replace(/ประชาชน/g, " ")
      .replace(/ที่อยู่ตามบัตร/g, " ")
      .replace(/ที่อยู่ที่ติดต่อได้/g, " "),
  );
  const houseNo = cleaned.match(/\d{1,6}\/\d{1,6}/);
  if (houseNo && typeof houseNo.index === "number" && houseNo.index > 0) {
    cleaned = cleaned.slice(houseNo.index).trim();
  }
  return cleaned || undefined;
}

function extractWithLabel(
  lines: string[],
  key: string,
  validator: (value: string) => boolean,
  options?: { maxLookahead?: number; collectMultiLine?: boolean },
): string | undefined {
  const pattern = getFieldPattern(key);
  if (!pattern) return undefined;
  const maxLookahead = options?.maxLookahead ?? 10;
  const collectMultiLine = options?.collectMultiLine ?? false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!matchesPattern(pattern, line)) continue;

    const inlineValue = replacePattern(pattern, line);
    if (inlineValue && validator(inlineValue)) return inlineValue;

    if (collectMultiLine) {
      const parts: string[] = [];
      for (let j = i + 1; j < lines.length && j <= i + maxLookahead; j += 1) {
        const candidate = lines[j];
        if (!candidate) continue;
        if (isLabelLine(candidate)) break;
        parts.push(candidate);
      }
      if (parts.length > 0) {
        const joined = normalizeLine(parts.join(" "));
        if (validator(joined)) return joined;
      }
    } else {
      for (let j = i + 1; j < lines.length && j <= i + maxLookahead; j += 1) {
        const candidate = lines[j];
        if (!candidate) continue;
        if (isLabelLine(candidate)) break;
        if (validator(candidate)) return candidate;
      }
    }
  }
  return undefined;
}

function extractNameFromLabel(lines: string[], key: "firstName" | "lastName"): string | undefined {
  const pattern = getFieldPattern(key);
  if (!pattern) return undefined;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!matchesPattern(pattern, line)) continue;
    const inline = replacePattern(pattern, line);
    if (inline && isLikelyThaiName(inline) && !shouldSkipNameToken(inline)) {
      return inline;
    }
    for (let j = i + 1; j < lines.length && j <= i + 10; j += 1) {
      const candidate = lines[j];
      if (!candidate) continue;
      if (isLabelLine(candidate)) continue;
      if (shouldSkipNameToken(candidate)) continue;
      if (isLikelyThaiName(candidate)) return candidate;
    }
  }
  return undefined;
}

function extractLineHints(lines: string[]): Partial<Identity> {
  const hints: Partial<Identity> = {};
  const firstName = extractNameFromLabel(lines, "firstName");
  const lastName = extractNameFromLabel(lines, "lastName");
  const dob = extractWithLabel(lines, "dob", (value) => Boolean(extractThaiDateFromText(value)));
  const citizenId = extractWithLabel(lines, "citizenId", (value) => Boolean(extractCitizenIdFromText(value)));
  const phone = extractWithLabel(lines, "phone", isLikelyPhone);
  const mobile = extractWithLabel(lines, "mobilePhone", (value) => isLikelyMobile(value) || isLikelyPhone(value));
  const email = extractEmailFromLines(lines);
  let registered = extractWithLabel(lines, "registeredAddress", isLikelyAddress, {
    collectMultiLine: true,
    maxLookahead: 8,
  });
  let contact = extractWithLabel(lines, "contactAddress", isLikelyAddress, {
    collectMultiLine: true,
    maxLookahead: 12,
  });

  const phoneCandidates = extractPhoneCandidates(lines);
  const firstPlainPhone = phoneCandidates.find((item) => !item.hasDash)?.digits;
  const dashedFromBlob = lines.join(" ").match(/0\d{2}-\d{3}-\d{4}/)?.[0];
  const firstDashedMobile = dashedFromBlob ?? phoneCandidates.find((item) => item.hasDash)?.raw;

  const phoneFallback = phone ?? firstPlainPhone;
  const mobileFallback = mobile ?? firstDashedMobile ?? phoneCandidates[0]?.raw;

  if (!registered || !contact) {
    const addressCandidates = extractAddressCandidates(lines);
    if (!registered && addressCandidates[0]) registered = addressCandidates[0];
    if (!contact && addressCandidates[1]) contact = addressCandidates[1];
  }
  registered = cleanAddressArtifacts(registered) ?? registered;
  contact = cleanAddressArtifacts(contact) ?? contact;

  if (firstName || lastName) {
    hints.thName = {
      first: firstName,
      last: lastName,
      full: [firstName, lastName].filter(Boolean).join(" ").trim() || undefined,
    };
  }
  if (dob) hints.dobRaw = extractThaiDateFromText(dob);
  if (citizenId) hints.citizenIdFormatted = extractCitizenIdFromText(citizenId);
  if (registered) hints.address = { full: registered };
  if (contact) hints.contactAddress = { full: contact };
  if (phoneFallback) hints.phone = digitsOnly(phoneFallback);
  if (mobileFallback) hints.mobilePhone = mobileFallback;
  if (email) hints.email = email;

  const formatted = hints.citizenIdFormatted;
  if (formatted) hints.citizenId = digitsOnly(formatted);
  return hints;
}

function mergeWithLineHints(base: Identity, hints: Partial<Identity>): Identity {
  const merged: Identity = {
    ...base,
    thName: { ...base.thName },
    address: { ...base.address },
    contactAddress: { ...base.contactAddress },
  };

  const firstHint = hints.thName?.first;
  if (firstHint && isLikelyThaiName(firstHint)) {
    const current = merged.thName?.first;
    if (!current || current.length < 3 || !isLikelyThaiName(current)) {
      merged.thName = { ...merged.thName, first: firstHint };
    }
  }

  const lastHint = hints.thName?.last;
  if (lastHint && isLikelyThaiName(lastHint)) {
    const current = merged.thName?.last;
    if (!current || current.length < 3 || !isLikelyThaiName(current)) {
      merged.thName = { ...merged.thName, last: lastHint };
    }
  }

  const mergedFirst = merged.thName?.first;
  const mergedLast = merged.thName?.last;
  if (mergedFirst || mergedLast) {
    merged.thName = {
      ...merged.thName,
      full: [merged.thName?.prefix, mergedFirst, merged.thName?.middle, mergedLast]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim() || undefined,
    };
  }

  if (hints.dobRaw && !merged.dobRaw) merged.dobRaw = hints.dobRaw;

  if (hints.citizenIdFormatted && !merged.citizenIdFormatted) {
    merged.citizenIdFormatted = hints.citizenIdFormatted;
    merged.citizenId = digitsOnly(hints.citizenIdFormatted) || merged.citizenId;
  }

  if (hints.phone && isLikelyPhone(hints.phone)) {
    if (!merged.phone || !isLikelyPhone(merged.phone)) merged.phone = hints.phone;
  }

  if (hints.mobilePhone && isLikelyPhone(hints.mobilePhone)) {
    const current = merged.mobilePhone;
    const sameDigits =
      current && digitsOnly(current) === digitsOnly(hints.mobilePhone);
    const preferHintFormatting =
      Boolean(current) &&
      sameDigits &&
      !current.includes("-") &&
      hints.mobilePhone.includes("-");
    if (!current || !isLikelyPhone(current) || preferHintFormatting) {
      merged.mobilePhone = hints.mobilePhone;
    }
  }

  if (hints.email && isLikelyEmail(hints.email)) {
    if (!merged.email || !isLikelyEmail(merged.email)) merged.email = hints.email;
  }

  if (hints.address?.full) {
    const hintAddress = cleanAddressArtifacts(hints.address.full) ?? hints.address.full;
    const current = merged.address?.full;
    const currentHasLabelNoise = current ? /ประจ[ํำ]ตัว|ประชาชน/.test(current) : false;
    if (!current || current.length < 10 || currentHasLabelNoise) {
      merged.address = { ...merged.address, full: hintAddress };
    }
  }

  if (hints.contactAddress?.full) {
    const hintContact = cleanAddressArtifacts(hints.contactAddress.full) ?? hints.contactAddress.full;
    const current = merged.contactAddress?.full;
    const currentHasPhoneNoise = current ? /เบอร์โทร|โทรศัพท์/.test(current) : false;
    if (!current || current.length < 10 || currentHasPhoneNoise) {
      merged.contactAddress = { ...merged.contactAddress, full: hintContact };
    }
  }

  const mobileDigits = digitsOnly(merged.mobilePhone);
  if (mobileDigits.length >= 4) {
    merged.phoneLast4 = mobileDigits.slice(-4);
  } else if (merged.phone) {
    const phoneDigits = digitsOnly(merged.phone);
    if (phoneDigits.length >= 4) merged.phoneLast4 = phoneDigits.slice(-4);
  }

  return merged;
}

function scoreIdentity(identity: Identity): {
  score: number;
  requiredFilled: number;
  missingRequired: string[];
  missingCritical: string[];
} {
  const fieldMap = extractFieldsFromIdentity(identity);
  const missingRequired = DGA_REQUIRED_KEYS.filter((key) => !fieldMap.has(key));
  const missingCritical = missingRequired.filter((key) => CRITICAL_KEYS.has(key));

  let score = 0;
  const requiredFilled = DGA_REQUIRED_KEYS.length - missingRequired.length;
  score += requiredFilled * 10;

  const first = identity.thName?.first;
  const last = identity.thName?.last;
  const phone = identity.phone;
  const mobile = identity.mobilePhone;
  const email = identity.email;
  const cid = identity.citizenId ?? identity.citizenIdFormatted;
  const dob = identity.dobRaw ?? identity.dob;

  if (first && isLikelyThaiName(first)) score += 6;
  if (last && isLikelyThaiName(last)) score += 6;
  if (phone && isLikelyPhone(phone)) score += 6;
  if (mobile && isLikelyMobile(mobile)) score += 6;
  if (email && isLikelyEmail(email)) score += 6;
  if (cid && digitsOnly(cid).length === 13) score += 6;
  if (dob && /\d{4}/.test(dob)) score += 4;
  return { score, requiredFilled, missingRequired, missingCritical };
}

async function runSinglePass(
  name: DgaOcrPassName,
  buffer: Buffer,
): Promise<DgaOcrPassResult> {
  const imageMeta = await sharp(buffer).metadata();
  const ocr = await iapp.ocrDocument(buffer);
  const stripped = stripBrowserChromeFromPages(ocr.data.text ?? []);
  const cleanedOcr: OcrDocumentResult = { ...ocr.data, text: stripped.pages };
  const baseIdentity = fromTyphoonDga(cleanedOcr as unknown as Record<string, unknown>);
  const lineHints = extractLineHints(toLines(stripped.pages));
  const mergedIdentity = mergeWithLineHints(baseIdentity, lineHints);
  const scored = scoreIdentity(mergedIdentity);

  return {
    name,
    width: imageMeta.width ?? null,
    height: imageMeta.height ?? null,
    score: scored.score,
    requiredFilled: scored.requiredFilled,
    missingRequired: scored.missingRequired,
    missingCritical: scored.missingCritical,
    identity: mergedIdentity,
    rawOcr: ocr.data,
    cleanedOcr,
    excludedBrowserChrome: stripped.excluded,
    cost: { endpoint: "document-ocr", ic: ocr.ic, ms: ocr.ms },
  };
}

function shouldTryFallback(pass: DgaOcrPassResult, sourceWidth: number | null): boolean {
  if (!sourceWidth || sourceWidth >= NARROW_SCREEN_WIDTH) return false;
  if (pass.missingCritical.length > 0) return true;
  return true;
}

function pickBetter(current: DgaOcrPassResult, next: DgaOcrPassResult): DgaOcrPassResult {
  if (next.score > current.score) return next;
  if (next.score < current.score) return current;
  if (next.missingCritical.length < current.missingCritical.length) return next;
  if (next.missingCritical.length > current.missingCritical.length) return current;
  if (next.missingRequired.length < current.missingRequired.length) return next;
  if (next.missingRequired.length > current.missingRequired.length) return current;
  if (current.name === "original" && next.name !== "original") return next;
  return current;
}

export async function runDgaOcrPipeline(buffer: Buffer): Promise<DgaOcrPipelineResult> {
  const originalMeta = await sharp(buffer).metadata();
  const sourceWidth = originalMeta.width ?? null;
  const passes: DgaOcrPassResult[] = [];

  const original = await runSinglePass("original", buffer);
  passes.push(original);
  let best = original;

  if (shouldTryFallback(best, sourceWidth)) {
    const upscaleBuffer = await sharp(buffer)
      .resize({ width: UPSCALE_WIDTH, withoutEnlargement: false })
      .sharpen({ sigma: 0.8 })
      .png()
      .toBuffer();

    const upscale = await runSinglePass("upscale_sharpen", upscaleBuffer);
    passes.push(upscale);
    best = pickBetter(best, upscale);

    if (best.missingCritical.length > 0) {
      const thresholdBuffer = await sharp(buffer)
        .resize({ width: UPSCALE_STRONG_WIDTH, withoutEnlargement: false })
        .grayscale()
        .normalize()
        .threshold(185)
        .png()
        .toBuffer();
      const threshold = await runSinglePass("upscale_threshold", thresholdBuffer);
      passes.push(threshold);
      best = pickBetter(best, threshold);
    }
  }

  return {
    selected: best,
    passes,
    costEntries: passes.map((item) => item.cost),
  };
}
