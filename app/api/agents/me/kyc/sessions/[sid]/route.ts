import { NextResponse } from "next/server";
import { GET as getWizardSession } from "@/app/api/wizard/[sid]/route";
import {
  agentAccessErrorResponse,
  agentActor,
  requireActiveAgent,
  requireAgentKycSession,
} from "@/lib/agents/kyc-access";
import { runWithKycActor } from "@/lib/kyc/actor-context";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TERMINAL_STATES = new Set(["AUTO_APPROVED", "REJECTED", "MANUAL_REVIEW"]);

export async function GET(req: Request, { params }: { params: { sid: string } }) {
  try {
    const { agent } = await requireActiveAgent();
    const session = await requireAgentKycSession(agent.id, params.sid);
    const response = await runWithKycActor(
      { actor: agentActor(agent.id), evidenceSource: "agent_upload" },
      () => getWizardSession(req, { params }),
    );
    const payload = await response.json();

    return NextResponse.json(
      {
        ...payload,
        agentKyc: {
          agentId: agent.id,
          targetVendor: session.user,
          latestActor: session.auditLogs[0] ?? null,
          canResume: !session.terminalAt && session.expiresAt > new Date(),
          canFinalize: session.state === "S5_SUMMARY",
          terminal: TERMINAL_STATES.has(session.state),
        },
      },
      { status: response.status },
    );
  } catch (error) {
    return agentAccessErrorResponse(error);
  }
}
