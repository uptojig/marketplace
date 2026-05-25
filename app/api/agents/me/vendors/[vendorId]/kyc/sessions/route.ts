import { NextResponse } from "next/server";
import { createWizardSession } from "@/lib/kyc/wizard-state";
import { runWithKycActor } from "@/lib/kyc/actor-context";
import {
  agentAccessErrorResponse,
  agentActor,
  requireActiveAgent,
  requireAgentVendor,
} from "@/lib/agents/kyc-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { vendorId: string } },
) {
  try {
    const { agent } = await requireActiveAgent();
    const vendor = await requireAgentVendor(agent.id, params.vendorId);
    const body = req.headers.get("content-type")?.includes("application/json")
      ? ((await req.json().catch(() => ({}))) as Record<string, unknown>)
      : {};

    const session = await runWithKycActor(
      { actor: agentActor(agent.id), evidenceSource: "agent_upload" },
      () =>
        createWizardSession({
          userId: vendor.id,
          agentId: agent.id,
          metadata: {
            entry: "agent_assisted_kyc",
            mode: "existing_vendor",
            targetVendorId: vendor.id,
            createdByAgentId: agent.id,
            createdByAgentUserId: agent.userId,
            note: typeof body.note === "string" ? body.note.trim() : undefined,
          },
        }),
    );

    return NextResponse.json({
      ok: true,
      session_id: session.id,
      state: session.state,
      vendor,
      resume_url: `/agent/kyc/${session.id}`,
      expires_at: session.expiresAt,
    });
  } catch (error) {
    return agentAccessErrorResponse(error);
  }
}
