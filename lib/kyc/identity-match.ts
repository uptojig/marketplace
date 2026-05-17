import type { Identity, IdentityMatchResult } from "@/types/identity";

export type IdentityCompareField =
  | "citizenId"
  | "name"
  | "address"
  | "dob"
  | "phoneLast4"
  | "email"
  | "bankbookName";

const PREFIX_TOKENS = new Set(["นาย", "นาง", "นางสาว", "mr", "mrs", "ms"]);

function normalizeText(value: string | undefined): string {
  return (value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDigits(value: string | undefined): string {
  return (value ?? "").replace(/\D+/g, "");
}

function normalizeEmail(value: string | undefined): string {
  return (value ?? "").normalize("NFKC").trim().toLowerCase();
}

function segmentWords(value: string): string[] {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("th", { granularity: "word" })
    : null;
  if (!segmenter) return normalized.split(/\s+/).filter(Boolean);
  const words = Array.from(segmenter.segment(normalized))
    .filter((part) => part.isWordLike)
    .map((part) => normalizeText(part.segment))
    .filter(Boolean);
  return words.length > 0 ? words : normalized.split(/\s+/).filter(Boolean);
}

function stripPrefixes(value: string): string {
  return segmentWords(value).filter((word) => !PREFIX_TOKENS.has(word)).join(" ");
}

function tokenSetRatio(left: string, right: string): number {
  const leftTokens = new Set(segmentWords(left));
  const rightTokens = new Set(segmentWords(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;
  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) overlap += 1;
  }
  return (2 * overlap) / (leftTokens.size + rightTokens.size);
}

function levenshteinDistance(left: string, right: string): number {
  const leftChars = Array.from(left);
  const rightChars = Array.from(right);
  const previous = Array.from({ length: rightChars.length + 1 }, (_, index) => index);
  const current = Array.from({ length: rightChars.length + 1 }, () => 0);

  for (let leftIndex = 1; leftIndex <= leftChars.length; leftIndex += 1) {
    current[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= rightChars.length; rightIndex += 1) {
      const cost = leftChars[leftIndex - 1] === rightChars[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + cost,
      );
    }
    for (let index = 0; index < current.length; index += 1) previous[index] = current[index];
  }

  return previous[rightChars.length];
}

function levenshteinRatio(left: string, right: string): number {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);
  const maxLength = Math.max(Array.from(normalizedLeft).length, Array.from(normalizedRight).length);
  if (maxLength === 0) return 0;
  return 1 - levenshteinDistance(normalizedLeft, normalizedRight) / maxLength;
}

function expandThaiAddress(value: string | undefined): string {
  return normalizeText(value)
    .replace(/&gt;|>/g, " ")
    .replace(/บ้านเลขที่/g, " ")
    .replace(/หมู่\s*\d+/g, " ")
    .replace(/พระรามที่\s*(\d+)/g, "พระราม $1")
    .replace(/ซ\./g, "ซอย ")
    .replace(/แยก\s*\d+/g, " ")
    .replace(/\bต\s+/g, "ตำบล ")
    .replace(/\bอ\s+/g, "อำเภอ ")
    .replace(/\bจ\s+/g, "จังหวัด ")
    .replace(/\bถ\s+/g, "ถนน ")
    .replace(/\s+/g, " ")
    .trim();
}

function addressAnchorOverlap(left: string, right: string): number {
  const ignored = new Set(["ซอย", "ถนน", "แขวง", "เขต", "จังหวัด", "ตำบล", "อำเภอ", "กรุงเทพ", "เลข"]);
  const leftTokens = new Set(segmentWords(expandThaiAddress(left)).filter((word) => word.length > 1 && !ignored.has(word)));
  const rightTokens = new Set(segmentWords(expandThaiAddress(right)).filter((word) => word.length > 1 && !ignored.has(word)));
  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) overlap += 1;
  }
  return overlap;
}

function postalCode(value: string | undefined): string | undefined {
  return value?.match(/\b\d{5}\b/)?.[0];
}

function nameCandidates(identity: Identity): string[] {
  return [
    identity.thName?.full,
    [identity.thName?.prefix, identity.thName?.first, identity.thName?.middle, identity.thName?.last]
      .filter(Boolean)
      .join(" "),
    identity.enName?.full,
    [identity.enName?.first, identity.enName?.last].filter(Boolean).join(" "),
    identity.bankAccount?.holder,
  ]
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));
}

function compareName(left: Identity, right: Identity): Omit<IdentityMatchResult, "matchType" | "leftSource" | "rightSource"> {
  const leftCandidates = nameCandidates(left);
  const rightCandidates = nameCandidates(right);
  if (leftCandidates.length === 0 || rightCandidates.length === 0) {
    return { matched: false, score: 0, threshold: 0.85, reason: "name_missing" };
  }

  let best = { score: 0, leftValue: leftCandidates[0], rightValue: rightCandidates[0], reason: "name_mismatch" };
  for (const leftValue of leftCandidates) {
    for (const rightValue of rightCandidates) {
      const normalizedLeft = normalizeText(leftValue);
      const normalizedRight = normalizeText(rightValue);
      if (normalizedLeft && normalizedLeft === normalizedRight) {
        return { matched: true, score: 1, threshold: 1, leftValue, rightValue, reason: "exact" };
      }

      const strippedLeft = stripPrefixes(leftValue);
      const strippedRight = stripPrefixes(rightValue);
      if (strippedLeft && strippedLeft === strippedRight) {
        return { matched: true, score: 0.99, threshold: 0.99, leftValue, rightValue, reason: "prefix_stripped_exact" };
      }

      const tokenScore = tokenSetRatio(strippedLeft || leftValue, strippedRight || rightValue);
      const levenshteinScore = levenshteinRatio(strippedLeft || leftValue, strippedRight || rightValue);
      const score = Math.max(tokenScore, levenshteinScore);
      if (score > best.score) {
        best = {
          score,
          leftValue,
          rightValue,
          reason: tokenScore >= levenshteinScore ? "token_set" : "levenshtein",
        };
      }
    }
  }

  const threshold = best.reason === "token_set" ? 0.85 : 0.9;
  return { ...best, threshold, matched: best.score >= threshold };
}

function compareAddress(left: Identity, right: Identity): Omit<IdentityMatchResult, "matchType" | "leftSource" | "rightSource"> {
  const leftValue = left.address?.full;
  const rightValue = right.contactAddress?.full || right.address?.full;
  if (!leftValue || !rightValue) {
    return { matched: false, leftValue, rightValue, score: 0, threshold: 0.75, reason: "address_missing" };
  }

  const leftPostal = left.address?.postal || postalCode(leftValue);
  const rightPostal = right.contactAddress?.postal || right.address?.postal || postalCode(rightValue);
  if (leftPostal && rightPostal && leftPostal !== rightPostal) {
    return { matched: false, leftValue, rightValue, score: 0, threshold: 1, reason: "postal_mismatch" };
  }

  const score = tokenSetRatio(expandThaiAddress(leftValue), expandThaiAddress(rightValue));
  const looseMatch = score >= 0.55 && addressAnchorOverlap(leftValue, rightValue) >= 3;
  return {
    matched: score >= 0.75 || looseMatch,
    leftValue,
    rightValue,
    score,
    threshold: score >= 0.75 ? 0.75 : 0.55,
    reason: score >= 0.75 ? "address_token_set" : looseMatch ? "address_loose_anchor_match" : "address_mismatch",
  };
}

function exactResult(args: {
  leftValue?: string;
  rightValue?: string;
  normalize?: (value: string | undefined) => string;
  reason: string;
  missingReason: string;
}): Omit<IdentityMatchResult, "matchType" | "leftSource" | "rightSource"> {
  const normalize = args.normalize ?? normalizeText;
  const leftNormalized = normalize(args.leftValue);
  const rightNormalized = normalize(args.rightValue);
  if (!leftNormalized || !rightNormalized) {
    return {
      matched: false,
      leftValue: args.leftValue,
      rightValue: args.rightValue,
      score: 0,
      threshold: 1,
      reason: args.missingReason,
    };
  }
  const matched = leftNormalized === rightNormalized;
  return {
    matched,
    leftValue: args.leftValue,
    rightValue: args.rightValue,
    score: matched ? 1 : 0,
    threshold: 1,
    reason: matched ? args.reason : `${args.reason}_mismatch`,
  };
}

export function compareIdentities(
  left: Identity,
  right: Identity,
  fields: IdentityCompareField[],
  sources: { leftSource: string; rightSource: string } = {
    leftSource: "left",
    rightSource: "right",
  },
): IdentityMatchResult[] {
  return fields.map((field) => {
    const base = {
      matchType: field,
      leftSource: sources.leftSource,
      rightSource: sources.rightSource,
    };

    if (field === "citizenId") {
      return {
        ...base,
        ...exactResult({
          leftValue: left.citizenId,
          rightValue: right.citizenId,
          normalize: normalizeDigits,
          reason: "cid_exact",
          missingReason: "cid_missing",
        }),
      };
    }

    if (field === "name") {
      return { ...base, ...compareName(left, right) };
    }

    if (field === "address") {
      return { ...base, ...compareAddress(left, right) };
    }

    if (field === "dob") {
      return {
        ...base,
        ...exactResult({
          leftValue: left.dob,
          rightValue: right.dob,
          reason: "dob_exact",
          missingReason: "dob_missing",
        }),
      };
    }

    if (field === "phoneLast4") {
      return {
        ...base,
        ...exactResult({
          leftValue: left.phoneLast4,
          rightValue: right.phoneLast4,
          normalize: normalizeDigits,
          reason: "phone_last4_exact",
          missingReason: "phone_last4_missing",
        }),
      };
    }

    if (field === "email") {
      return {
        ...base,
        ...exactResult({
          leftValue: left.email,
          rightValue: right.email,
          normalize: normalizeEmail,
          reason: "email_exact",
          missingReason: "email_missing",
        }),
      };
    }

    return {
      ...base,
      ...compareName(
        { thName: left.bankAccount?.holder ? { full: left.bankAccount.holder } : left.thName },
        right,
      ),
    };
  });
}

export function hasCriticalMismatch(results: IdentityMatchResult[]): boolean {
  return results.some(
    (result) =>
      !result.matched &&
      (result.matchType === "citizenId" || result.matchType === "phoneLast4"),
  );
}
