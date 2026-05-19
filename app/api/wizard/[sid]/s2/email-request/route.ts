import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  EmailPoolEmptyError,
  leaseKycEmailForSession,
} from "@/lib/kyc/email-pool";
import {
  createStopwatch,
  jsonError,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";
import { auditWizardEvent } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S2_EMAIL_PENDING") {
      return jsonError(`Expected S2_EMAIL_PENDING, got ${session.state}`, 409);
    }

    const lease = await leaseKycEmailForSession(params.sid);
    const metadata =
      session.metadata && typeof session.metadata === "object" && !Array.isArray(session.metadata)
        ? { ...(session.metadata as Record<string, unknown>) }
        : {};

    metadata.kycEmail = lease.email;
    metadata.kycEmailExpiresAt = lease.expiresAt.toISOString();

    await prisma.wizardSession.update({
      where: { id: params.sid },
      data: { metadata: metadata as never },
    });
    await auditWizardEvent({
      sessionId: params.sid,
      actor: "vendor",
      event: "s2.email.request",
      payload: {
        email: lease.email,
        expiresAt: lease.expiresAt.toISOString(),
        timings_ms: sw.snapshot(),
      },
    });

    return NextResponse.json({
      ok: true,
      email: lease.email,
      expires_at: lease.expiresAt,
      ttl_seconds: Math.max(0, Math.floor((lease.expiresAt.getTime() - Date.now()) / 1000)),
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    if (error instanceof EmailPoolEmptyError) {
      return jsonError(error.message, 409, { code: "EMAIL_POOL_EMPTY" });
    }
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}

