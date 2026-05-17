import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const WIZARD_STATES = [
  "INIT",
  "S1_DGA_CAPTURE",
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
  "AUTO_APPROVED",
  "REJECTED",
  "MANUAL_REVIEW",
] as const;

export type WizardState = (typeof WIZARD_STATES)[number];
export type WizardActor = "vendor" | "system";

const TERMINAL_STATES = new Set<WizardState>(["AUTO_APPROVED", "REJECTED", "MANUAL_REVIEW"]);

const ALLOWED_TRANSITIONS: Record<WizardState, WizardState[]> = {
  INIT: ["S1_DGA_CAPTURE", "S1_ID_CARD"],
  S1_DGA_CAPTURE: ["S1_DGA_CAPTURE", "S2_ID_SELFIE", "MANUAL_REVIEW"],
  S2_ID_SELFIE: ["S2_ID_SELFIE", "S3_PHONE_RESPONSE", "REJECTED", "MANUAL_REVIEW"],
  S3_PHONE_RESPONSE: ["S3_PHONE_RESPONSE", "S4_BANKBOOK_UPLOAD", "REJECTED", "MANUAL_REVIEW"],
  S4_BANKBOOK_UPLOAD: ["AUTO_APPROVED", "REJECTED", "MANUAL_REVIEW"],
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
  if (!ALLOWED_TRANSITIONS[fromState].includes(toState)) {
    throw new Error(`Invalid wizard transition: ${fromState} -> ${toState}`);
  }
}

export async function createWizardSession(
  args: { userId?: string | null; metadata?: Record<string, unknown> } = {},
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const metadata = args.metadata ?? {};

  return prisma.wizardSession.create({
    data: {
      state: "S1_DGA_CAPTURE",
      userId: args.userId ?? null,
      expiresAt,
      metadata: metadata as Prisma.InputJsonValue,
      auditLogs: {
        create: {
          actor: "system",
          event: "session.create",
          fromState: "INIT",
          toState: "S1_DGA_CAPTURE",
          payload: { ...metadata, userId: args.userId ?? null } as Prisma.InputJsonValue,
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
  return Boolean(session);
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
