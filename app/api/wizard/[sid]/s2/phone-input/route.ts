import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auditWizardEvent } from "@/lib/kyc/wizard-state";
import { jsonError, readJsonBody, requireWizardSession } from "@/lib/kyc/wizard-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S2_DGA_INSTRUCTIONS") {
      return jsonError(`Expected S2_DGA_INSTRUCTIONS, got ${session.state}`, 409);
    }

    const body = readJsonBody<{ phone?: unknown }>(await req.json());
    const phone = String(body.phone ?? "").replace(/\D+/g, "");
    if (phone.length < 9 || phone.length > 10) return jsonError("Invalid Thai phone number");

    const metadata = session.metadata && typeof session.metadata === "object" && !Array.isArray(session.metadata)
      ? { ...(session.metadata as Record<string, unknown>), phone }
      : { phone };

    await prisma.wizardSession.update({
      where: { id: params.sid },
      data: { metadata: metadata as never },
    });
    await auditWizardEvent({
      sessionId: params.sid,
      actor: "vendor",
      event: "s2.phone_input",
      payload: { phoneLast4: phone.slice(-4) },
    });

    return NextResponse.json({ ok: true, phone_last4: phone.slice(-4) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
