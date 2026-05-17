import { NextResponse } from "next/server";
import { getWizardSnapshot } from "@/lib/kyc/wizard-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { sid: string } }) {
  const snapshot = await getWizardSnapshot(params.sid);
  if (!snapshot) {
    return NextResponse.json({ ok: false, error: "Wizard session not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, ...snapshot });
}
