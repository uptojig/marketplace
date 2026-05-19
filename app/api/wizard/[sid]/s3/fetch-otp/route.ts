import { NextResponse } from "next/server";
import {
  EmailLeaseExpiredError,
  requirePendingKycEmailLease,
} from "@/lib/kyc/email-pool";
import { fetchLatestOtpFromImap } from "@/lib/kyc/otp-imap";
import {
  createStopwatch,
  jsonError,
  latestExtractedIdentity,
  requireWizardSession,
} from "@/lib/kyc/wizard-api";
import { auditWizardEvent, transitionWizardSession } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ID_REF_PROVIDER = "iapp_id_ref";

export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  const sw = createStopwatch();
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S2_EMAIL_PENDING" && session.state !== "S3_OTP_VERIFIED") {
      return jsonError(`Expected S2_EMAIL_PENDING or S3_OTP_VERIFIED, got ${session.state}`, 409);
    }

    const lease = await requirePendingKycEmailLease(params.sid);
    const idRef = await latestExtractedIdentity(params.sid, ID_REF_PROVIDER);
    if (!idRef) return jsonError("Missing ID-card reference identity", 409);

    const hit = await fetchLatestOtpFromImap({
      recipientEmail: lease.email,
      identity: idRef,
      maxAgeMinutes: 10,
    });

    if (!hit) {
      await auditWizardEvent({
        sessionId: params.sid,
        actor: "vendor",
        event: "s3.otp.not_found",
        payload: { email: lease.email, timings_ms: sw.snapshot() },
      });
      return jsonError("No unread OTP email found in the last 10 minutes", 404);
    }

    if (!hit.matchedName && !hit.matchedCitizenId) {
      await auditWizardEvent({
        sessionId: params.sid,
        actor: "system",
        event: "s3.otp.identity_mismatch",
        payload: {
          uid: hit.uid,
          subject: hit.subject,
          matchReason: hit.matchReason,
          timings_ms: sw.snapshot(),
        },
      });
      return jsonError("OTP email found but identity did not match ID-card reference", 409, {
        otp_found: true,
      });
    }

    if (!hit.matchedName && hit.matchedCitizenId) {
      await auditWizardEvent({
        sessionId: params.sid,
        actor: "system",
        event: "s3.otp.matched_by_citizen_id",
        payload: {
          uid: hit.uid,
          subject: hit.subject,
          matchReason: hit.matchReason,
          timings_ms: sw.snapshot(),
        },
      });
    }

    if (session.state === "S2_EMAIL_PENDING") {
      await transitionWizardSession({
        sessionId: params.sid,
        toState: "S3_OTP_VERIFIED",
        actor: "system",
        event: "s3.otp.verified",
        payload: {
          uid: hit.uid,
          subject: hit.subject,
          matchReason: hit.matchReason,
          receivedAt: hit.receivedAt?.toISOString() ?? null,
          timings_ms: sw.snapshot(),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      state: "S3_OTP_VERIFIED",
      otp: hit.otp,
      received_at: hit.receivedAt,
      match_reason: hit.matchReason,
      _timings_ms: sw.snapshot(),
    });
  } catch (error) {
    if (error instanceof EmailLeaseExpiredError) {
      return jsonError(error.message, 409, { code: "EMAIL_LEASE_EXPIRED" });
    }
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("configured") ? 503 : 500);
  }
}
