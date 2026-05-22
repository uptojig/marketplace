import { NextResponse } from "next/server";
import { extendWizardSession } from "@/lib/kyc/wizard-state";
import {
  AgentKycAccessError,
  agentAccessErrorResponse,
  requireActiveAgent,
  requireAgentKycSession,
} from "@/lib/agents/kyc-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Manually extend an in-flight agent-assisted KYC session (powers the
// "ต่อเวลา" button on the countdown warning). Cannot revive a session that has
// already expired or reached a terminal state — that path is intentionally a
// dead-end and the agent must start a new session.
export async function POST(_req: Request, { params }: { params: { sid: string } }) {
  try {
    const { agent } = await requireActiveAgent();
    const session = await requireAgentKycSession(agent.id, params.sid);

    if (session.terminalAt) {
      throw new AgentKycAccessError("session_terminal", 409, "เซสชันนี้สิ้นสุดแล้ว ต่อเวลาไม่ได้");
    }
    if (session.expiresAt < new Date()) {
      throw new AgentKycAccessError("session_expired", 410, "เซสชันหมดอายุแล้ว กรุณาสร้างใหม่");
    }

    const updated = await extendWizardSession(params.sid);
    return NextResponse.json({ ok: true, expires_at: updated.expiresAt });
  } catch (error) {
    return agentAccessErrorResponse(error);
  }
}
