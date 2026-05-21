import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createStopwatch,
  jsonError,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";
import { auditWizardEvent, transitionWizardSession, invalidateWizardSteps } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    let session = await requireWizardSession(params.sid);
    const ACTIVE_FLOW_STATES = [
      "S2_EMAIL_PENDING",
      "S3_OTP_VERIFIED",
      "S1_DGA_CAPTURE",
      "S1_DGA_REVIEW",
      "S2_ID_SELFIE",
      "S3_PHONE_RESPONSE",
      "S4_BANKBOOK_UPLOAD",
      "S5_SUMMARY",
    ];
    if (!ACTIVE_FLOW_STATES.includes(session.state)) {
      return jsonError(`Expected active wizard session, got ${session.state}`, 409);
    }

    if (session.state !== "S2_EMAIL_PENDING") {
      session = await transitionWizardSession({
        sessionId: params.sid,
        toState: "S2_EMAIL_PENDING",
        actor: "vendor",
        event: "s2.email.reopened_skip_email",
        payload: { priorState: session.state },
      });
      await invalidateWizardSteps(params.sid, "S1_ID_CARD_REF");
    }

    // Clean up/release any email lease if it was already allocated to this session
    await prisma.wizardOutlookCredential.updateMany({
      where: {
        leasedTo: params.sid,
        status: { in: ["pending", "PENDING", "leased", "LEASED"] },
      },
      data: {
        status: "available",
        leasedTo: null,
        leasedAt: null,
      },
    });

    const existingMeta =
      session.metadata && typeof session.metadata === "object" && !Array.isArray(session.metadata)
        ? (session.metadata as Record<string, unknown>)
        : {};

    await prisma.wizardSession.update({
      where: { id: params.sid },
      data: {
        metadata: {
          ...existingMeta,
          emailTab: "own",
        } as never,
      },
    });

    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: "S1_DGA_CAPTURE",
      actor: "vendor",
      event: "s2.email.skipped_by_vendor",
      payload: {
        skipped: true,
        useOwnEmail: true,
        timings_ms: sw.snapshot(),
      },
    });

    await auditWizardEvent({
      sessionId: params.sid,
      actor: "vendor",
      event: "s2.email.skipped",
      payload: {
        useOwnEmail: true,
        timings_ms: sw.snapshot(),
      },
    });

    return NextResponse.json({
      ok: true,
      state: updated.state,
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
