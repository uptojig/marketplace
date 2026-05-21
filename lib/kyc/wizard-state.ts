import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const WIZARD_STATES = [
  "INIT",
  "S1_ID_CARD_REF",
  "S1_ID_CARD_REVIEW",
  "S2_EMAIL_PENDING",
  "S3_OTP_VERIFIED",
  "S4_EVIDENCE_UPLOAD",
  "S1_DGA_CAPTURE",
  "S1_DGA_REVIEW",
  "S2_ID_SELFIE",
  "S3_PHONE_RESPONSE",
  "S4_BANKBOOK_UPLOAD",
  "S1_ID_CARD",
  "S2_DGA_INSTRUCTIONS",
  "S3_DGA_UPLOAD",
  "S4_USSD_UPLOAD",
  "S5_CROSS_MATCH",
  "S6_BANKBOOK_UPLOAD",
  "S7_DECIDE",
  "S5_SUMMARY",
  "AUTO_APPROVED",
  "REJECTED",
  "MANUAL_REVIEW",
] as const;

export type WizardState = (typeof WIZARD_STATES)[number];
export type WizardActor = "vendor" | "system";

const TERMINAL_STATES = new Set<WizardState>(["AUTO_APPROVED", "REJECTED", "MANUAL_REVIEW"]);

const ALLOWED_TRANSITIONS: Record<WizardState, WizardState[]> = {
  INIT: ["S1_ID_CARD_REF", "S1_DGA_CAPTURE", "S1_ID_CARD"],
  // After OCR runs the session lands in REVIEW (not directly in
  // S2_EMAIL_PENDING) — vendor must visually confirm the extracted
  // anchor fields. Self-loop retains for retry-when-iApp-503 cases.
  S1_ID_CARD_REF: ["S1_ID_CARD_REF", "S1_ID_CARD_REVIEW", "MANUAL_REVIEW", "REJECTED"],
  // Read-only review of the OCR anchor. "ถ่ายใหม่" loops back to
  // S1_ID_CARD_REF so the vendor can re-upload; "ยืนยัน" proceeds.
  S1_ID_CARD_REVIEW: ["S1_ID_CARD_REF", "S2_EMAIL_PENDING", "MANUAL_REVIEW", "REJECTED"],
  S2_EMAIL_PENDING: ["S2_EMAIL_PENDING", "S3_OTP_VERIFIED", "S1_DGA_CAPTURE", "MANUAL_REVIEW", "REJECTED"],
  S3_OTP_VERIFIED: ["S1_DGA_CAPTURE", "MANUAL_REVIEW", "REJECTED"],
  S4_EVIDENCE_UPLOAD: ["MANUAL_REVIEW", "REJECTED"],
  // S1_DGA_CAPTURE → S1_DGA_REVIEW once all 9 required fields captured;
  // → MANUAL_REVIEW for stuck sessions; self-loop for retries.
  S1_DGA_CAPTURE: ["S1_DGA_CAPTURE", "S1_DGA_REVIEW", "MANUAL_REVIEW"],
  // S1_DGA_REVIEW shows the vendor the OCR-extracted fields editable
  // (except citizenId + dob which lock S2/S5 cross-match anchors).
  // Confirm → S2_ID_SELFIE; back button → CAPTURE (preserves edits).
  S1_DGA_REVIEW: ["S2_ID_SELFIE", "S1_DGA_CAPTURE", "MANUAL_REVIEW"],
  S2_ID_SELFIE: ["S2_ID_SELFIE", "S3_PHONE_RESPONSE", "REJECTED", "MANUAL_REVIEW"],
  S3_PHONE_RESPONSE: ["S3_PHONE_RESPONSE", "S4_BANKBOOK_UPLOAD", "REJECTED", "MANUAL_REVIEW"],
  S4_BANKBOOK_UPLOAD: ["S5_SUMMARY", "AUTO_APPROVED", "REJECTED", "MANUAL_REVIEW"],
  S5_SUMMARY: ["AUTO_APPROVED", "REJECTED", "MANUAL_REVIEW"],
  S1_ID_CARD: ["S1_ID_CARD", "S2_DGA_INSTRUCTIONS", "REJECTED", "MANUAL_REVIEW"],
  S2_DGA_INSTRUCTIONS: ["S3_DGA_UPLOAD", "MANUAL_REVIEW"],
  S3_DGA_UPLOAD: ["S4_USSD_UPLOAD", "MANUAL_REVIEW"],
  S4_USSD_UPLOAD: ["S4_USSD_UPLOAD", "S5_CROSS_MATCH", "MANUAL_REVIEW"],
  S5_CROSS_MATCH: ["S6_BANKBOOK_UPLOAD", "MANUAL_REVIEW", "REJECTED"],
  S6_BANKBOOK_UPLOAD: ["S7_DECIDE", "MANUAL_REVIEW", "REJECTED"],
  S7_DECIDE: ["AUTO_APPROVED", "MANUAL_REVIEW", "REJECTED"],
  AUTO_APPROVED: [],
  REJECTED: [],
  // Admin reviews stuck-in-MANUAL_REVIEW sessions and flips them to a
  // final verdict. The audit log records actor=admin:<id> for traceability.
  MANUAL_REVIEW: ["AUTO_APPROVED", "REJECTED"],
};

function isWizardState(value: string): value is WizardState {
  return WIZARD_STATES.includes(value as WizardState);
}

function assertCanTransition(fromState: string, toState: WizardState) {
  if (!isWizardState(fromState)) throw new Error(`Unknown wizard state: ${fromState}`);
  if (!isWizardState(toState)) throw new Error(`Unknown wizard state: ${toState}`);

  const isFromTerminal = TERMINAL_STATES.has(fromState as WizardState);
  if (isFromTerminal) {
    if (fromState === "MANUAL_REVIEW" && (toState === "AUTO_APPROVED" || toState === "REJECTED")) {
      return;
    }
    throw new Error(`Cannot transition from terminal state: ${fromState}`);
  }
  return;
}

export async function createWizardSession(
  args: { userId?: string | null; agentId?: string | null; metadata?: Record<string, unknown> } = {},
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const metadata = args.metadata ?? {};

  return prisma.wizardSession.create({
    data: {
      state: "S1_ID_CARD_REF",
      userId: args.userId ?? null,
      agentId: args.agentId ?? null,
      expiresAt,
      metadata: metadata as Prisma.InputJsonValue,
      auditLogs: {
        create: {
          actor: "system",
          event: "session.create",
          fromState: "INIT",
          toState: "S1_ID_CARD_REF",
          payload: { ...metadata, userId: args.userId ?? null, agentId: args.agentId ?? null } as Prisma.InputJsonValue,
        },
      },
    },
  });
}

// Returns the most recent KYC session for a vendor, regardless of state.
// Used by /apply to branch between "start", "resume", "waiting", "approved",
// "rejected" UI states.
export async function findUserLatestKycSession(userId: string) {
  return prisma.wizardSession.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

// True if the vendor has an AUTO_APPROVED session — the gate to /create-store.
export async function hasApprovedKyc(userId: string) {
  const session = await prisma.wizardSession.findFirst({
    where: { userId, state: "AUTO_APPROVED" },
    select: { id: true },
  });
  if (session) return true;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "VENDOR" || user?.role === "ADMIN";
}

export async function transitionWizardSession(args: {
  sessionId: string;
  toState: WizardState;
  actor: WizardActor;
  event: string;
  payload?: Record<string, unknown>;
}) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.wizardSession.findUnique({ where: { id: args.sessionId } });
    if (!current) throw new Error("Wizard session not found");
    assertCanTransition(current.state, args.toState);

    const updated = await tx.wizardSession.update({
      where: { id: args.sessionId },
      data: {
        state: args.toState,
        terminalAt: TERMINAL_STATES.has(args.toState) ? new Date() : undefined,
        finalDecision: TERMINAL_STATES.has(args.toState) ? args.toState : undefined,
      },
    });

    await tx.wizardAuditLog.create({
      data: {
        sessionId: args.sessionId,
        actor: args.actor,
        event: args.event,
        fromState: current.state,
        toState: args.toState,
        payload: (args.payload ?? {}) as Prisma.InputJsonValue,
      },
    });

    return updated;
  });
}

export async function auditWizardEvent(args: {
  sessionId: string;
  actor: WizardActor;
  event: string;
  payload?: Record<string, unknown>;
}) {
  const session = await prisma.wizardSession.findUnique({ where: { id: args.sessionId } });
  if (!session) throw new Error("Wizard session not found");
  return prisma.wizardAuditLog.create({
    data: {
      sessionId: args.sessionId,
      actor: args.actor,
      event: args.event,
      fromState: session.state,
      toState: session.state,
      payload: (args.payload ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function getWizardSnapshot(sessionId: string) {
  const session = await prisma.wizardSession.findUnique({
    where: { id: sessionId },
    include: {
      evidence: { orderBy: { capturedAt: "asc" } },
      ocrResults: { orderBy: { createdAt: "asc" } },
      matchResults: { orderBy: { createdAt: "asc" } },
      outlookCredentials: { select: { email: true, status: true, leasedAt: true } },
    },
  });
  if (!session) return null;

  return {
    id: session.id,
    state: session.state,
    citizenId: session.citizenId,
    finalDecision: session.finalDecision,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    expiresAt: session.expiresAt,
    terminalAt: session.terminalAt,
    metadata: session.metadata,
    completedSteps: Array.from(new Set(session.evidence.map((item) => item.step))),
    evidence: session.evidence.map((item) => ({
      id: item.id,
      step: item.step,
      bytes: item.bytes,
      mime: item.mime,
      width: item.width,
      height: item.height,
      capturedAt: item.capturedAt,
    })),
    latestMatches: session.matchResults,
    outlook: session.outlookCredentials[0] ?? null,
  };
}

export async function invalidateWizardSteps(
  sessionId: string,
  modifiedStep: "S1_ID_CARD_REF" | "S1_DGA_REVIEW" | "S2_SELFIE" | "S3_PHONE_RESPONSE" | "S4_BANKBOOK",
) {
  return prisma.$transaction(async (tx) => {
    const stepsToClear: string[] = [];
    let clearMatches = false;
    let clearSoftFails = false;

    if (modifiedStep === "S1_ID_CARD_REF") {
      stepsToClear.push("S1_DGA_CAPTURE", "S2_SELFIE", "S3_PHONE_RESPONSE", "S4_BANKBOOK");
      clearMatches = true;
      clearSoftFails = true;
    } else if (modifiedStep === "S1_DGA_REVIEW") {
      stepsToClear.push("S2_SELFIE", "S3_PHONE_RESPONSE", "S4_BANKBOOK");
      clearMatches = true;
      clearSoftFails = true;
    } else if (modifiedStep === "S2_SELFIE") {
      stepsToClear.push("S3_PHONE_RESPONSE", "S4_BANKBOOK");
      clearMatches = true;
      clearSoftFails = true;
    } else if (modifiedStep === "S3_PHONE_RESPONSE") {
      stepsToClear.push("S4_BANKBOOK");
      clearMatches = true;
      clearSoftFails = true;
    }

    if (stepsToClear.length > 0) {
      await tx.wizardEvidence.deleteMany({
        where: {
          sessionId,
          step: { in: stepsToClear },
        },
      });
    }

    if (clearMatches) {
      await tx.wizardMatchResult.deleteMany({
        where: { sessionId },
      });
    }

    const session = await tx.wizardSession.findUnique({
      where: { id: sessionId },
      select: { metadata: true },
    });
    
    if (session) {
      const meta =
        session.metadata && typeof session.metadata === "object" && !Array.isArray(session.metadata)
          ? (session.metadata as Record<string, unknown>)
          : {};

      const updatedMeta = { ...meta };
      if (clearSoftFails) {
        delete updatedMeta.softFails;
      }
      delete updatedMeta.pendingDecision;

      await tx.wizardSession.update({
        where: { id: sessionId },
        data: { metadata: updatedMeta as any },
      });
    }
  });
}

