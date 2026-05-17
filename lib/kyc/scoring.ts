export interface ScoreInputs {
  ocrConfidence: number;
  checksumValid: boolean;
  livenessScore: number;
  livenessPredict: "REAL" | "SPOOF";
  faceMatchScore: number;
  faceMatch: boolean;
  notExpired: boolean;
  heldIdNumberStatus: "match" | "mismatch" | "unreadable";
  heldNameStatus: "match" | "mismatch" | "unreadable";
  attemptIndex: number;
  maxSelfieAttempts: number;
}

export type Decision = "AUTO_APPROVED" | "RETRY_SELFIE" | "REJECTED";

export interface ScoreResult {
  overall: number;
  decision: Decision;
  failedChecks: string[];
}

export function scoreSubmission(s: ScoreInputs): ScoreResult {
  const attemptIndex = Number.isFinite(s.attemptIndex)
    ? Math.max(1, Math.floor(s.attemptIndex))
    : 1;
  const maxSelfieAttempts = Number.isFinite(s.maxSelfieAttempts)
    ? Math.max(1, Math.floor(s.maxSelfieAttempts))
    : 3;

  const hasRetryQuota = attemptIndex < maxSelfieAttempts;
  const failed: string[] = [];
  if (!s.checksumValid) failed.push("checksum_invalid");
  if (!s.notExpired) failed.push("id_expired");
  if (s.heldIdNumberStatus === "mismatch" && s.heldNameStatus !== "match") {
    failed.push("held_id_number_mismatch");
  }
  if (s.heldNameStatus === "mismatch" && s.heldIdNumberStatus !== "match") {
    failed.push("held_id_name_mismatch");
  }

  const hasDocumentIdentityMatch =
    s.heldIdNumberStatus === "match" || s.heldNameStatus === "match";
  const documentUnreadable =
    s.heldIdNumberStatus === "unreadable" && s.heldNameStatus === "unreadable";

  // Business rule (2026-05-17): the only OCR requirements on the held-ID
  // selfie are citizen-ID match + Thai name match. When the held-ID can't
  // be OCR'd we route to MANUAL_REVIEW (admin eyeballs the cropped image)
  // instead of forcing the user into infinite retake loops. Held-ID is
  // soft signal here, not a hard gate.
  if (documentUnreadable) {
    failed.push("held_id_unreadable");
  }

  if (!s.faceMatch) {
    if (hasDocumentIdentityMatch) {
      failed.push(hasRetryQuota ? "face_mismatch_retry" : "face_mismatch_with_document_evidence");
    } else {
      failed.push("face_mismatch");
    }
  }

  const coreChecksPassed =
    s.checksumValid && s.notExpired && (s.heldIdNumberStatus !== "mismatch" || s.heldNameStatus === "match");

  // Business rule (2026-05-17): liveness is a soft signal only — the
  // selfie composition (user holds their ID up to their face) reliably
  // confuses iApp's passive liveness model (2 faces in frame). We still
  // record the prediction for audit + future tuning, but SPOOF no longer
  // forces RETRY_SELFIE. Anti-fraud comes from face_match + held-ID OCR
  // cross-check requiring the user to physically possess the card.
  if (s.livenessPredict === "SPOOF") {
    failed.push("liveness_spoof_advisory");
  }

  const documentIdentityScore =
    s.heldIdNumberStatus === "match"
      ? 1
      : s.heldNameStatus === "match"
        ? 0.75
        : documentUnreadable
          ? 0.15
          : 0.3;

  const overall =
    0.16 * s.ocrConfidence +
    0.14 * (s.checksumValid ? 1 : 0) +
    0.14 * (s.notExpired ? 1 : 0) +
    0.2 * s.livenessScore +
    0.2 * s.faceMatchScore +
    0.16 * documentIdentityScore;

  // Only true identity violations are hard fails. held_id_unreadable +
  // liveness_spoof_advisory route to MANUAL_REVIEW via "not all matched"
  // path, NOT auto-reject.
  const hardFailSet = new Set([
    "checksum_invalid",
    "id_expired",
    "held_id_number_mismatch",
    "held_id_name_mismatch",
    "face_mismatch",
    "face_mismatch_with_document_evidence",
  ]);

  const hasHardFail = failed.some((item) => hardFailSet.has(item));
  // Soft fails don't gate the decision — they're routed via the route
  // handler's `allMatched` check to MANUAL_REVIEW. Keep them in the
  // failedChecks output so they're visible in audit.
  const softFailSet = new Set(["held_id_unreadable", "liveness_spoof_advisory"]);
  const hasOnlySoftFails = failed.length > 0 && failed.every((item) => softFailSet.has(item));

  let decision: Decision;
  if (hasHardFail || overall < 0.5) {
    decision = "REJECTED";
  } else if (failed.length === 0 || hasOnlySoftFails) {
    // Clean pass OR only advisory signals → AUTO_APPROVED candidate. The
    // route handler still routes to MANUAL_REVIEW when cross-matches fail.
    decision = "AUTO_APPROVED";
  } else {
    decision = "RETRY_SELFIE";
  }

  return { overall, decision, failedChecks: failed };
}
