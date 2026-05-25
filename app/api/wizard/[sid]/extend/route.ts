import { NextResponse } from "next/server";
import { extendWizardSession } from "@/lib/kyc/wizard-state";
import { jsonError, requireWizardSession } from "@/lib/kyc/wizard-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Vendor/public counterpart of the agent extend endpoint — lets a vendor doing
// their own KYC slide the deadline forward (powers the "ต่อเวลา" button on the
// countdown warning). The sid itself is the capability token, same as every
// other public wizard step. requireWizardSession already rejects a missing /
// expired / terminal session, so an expired one can't be revived.
export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  try {
    await requireWizardSession(params.sid);
    const updated = await extendWizardSession(params.sid);
    return NextResponse.json({ ok: true, expires_at: updated.expiresAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, message.includes("expired") ? 410 : 409);
  }
}
