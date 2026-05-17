import { NextResponse } from "next/server";
import { jsonError, readJsonBody, requireWizardSession } from "@/lib/kyc/wizard-api";
import { transitionWizardSession } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { sid: string } }) {
  try {
    const session = await requireWizardSession(params.sid);
    if (session.state !== "S2_DGA_INSTRUCTIONS") {
      return jsonError(`Expected S2_DGA_INSTRUCTIONS, got ${session.state}`, 409);
    }

    const body = readJsonBody<{ confirmed?: unknown }>(await req.json());
    if (body.confirmed !== true) return jsonError("Vendor confirmation is required");

    const updated = await transitionWizardSession({
      sessionId: params.sid,
      toState: "S3_DGA_UPLOAD",
      actor: "vendor",
      event: "s2.done",
      payload: { confirmed: true },
    });

    return NextResponse.json({ ok: true, state: updated.state });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
