import { NextResponse } from "next/server";
import { createWizardSession } from "@/lib/kyc/wizard-state";
import { runWithKycActor } from "@/lib/kyc/actor-context";
import { prisma } from "@/lib/prisma";
import {
  AgentKycAccessError,
  agentAccessErrorResponse,
  agentActor,
  requireActiveAgent,
} from "@/lib/agents/kyc-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Cap on concurrent in-flight prospect sessions per agent. Each session is a
// DB row + audit log, so without a cap an agent can spam the table / DB.
const MAX_ACTIVE_PROSPECT_SESSIONS = 20;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() || null : null;
}

interface TargetProfile {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  note?: string | null;
}

// Lists the agent's self-created (prospect) KYC sessions — userId is null
// because no account exists yet. These never appear in the recruited-vendor
// table (which is keyed on User.agentId), so this is the only way an agent
// can find an in-flight session they started earlier.
export async function GET() {
  try {
    const { agent } = await requireActiveAgent();

    const sessions = await prisma.wizardSession.findMany({
      where: { agentId: agent.id, userId: null },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        state: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        terminalAt: true,
        metadata: true,
        _count: { select: { evidence: true } },
      },
    });

    const list = sessions.map((s) => {
      const profile = (s.metadata as { targetProfile?: TargetProfile } | null)?.targetProfile ?? null;
      return {
        id: s.id,
        state: s.state,
        name: profile?.name ?? null,
        phone: profile?.phone ?? null,
        email: profile?.email ?? null,
        note: profile?.note ?? null,
        evidenceCount: s._count.evidence,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        expiresAt: s.expiresAt,
        terminalAt: s.terminalAt,
      };
    });

    return NextResponse.json({ ok: true, sessions: list });
  } catch (error) {
    return agentAccessErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const { agent } = await requireActiveAgent();
    const body = req.headers.get("content-type")?.includes("application/json")
      ? ((await req.json().catch(() => ({}))) as Record<string, unknown>)
      : {};

    const name = readString(body.name);
    const phone = readString(body.phone);
    const email = readString(body.email)?.toLowerCase() ?? null;
    const note = readString(body.note);

    // --- Validation ---
    if (!name) {
      throw new AgentKycAccessError("name_required", 400, "กรุณาระบุชื่อ Vendor");
    }
    if (email && !EMAIL_RE.test(email)) {
      throw new AgentKycAccessError("invalid_email", 400, "รูปแบบอีเมลไม่ถูกต้อง");
    }
    // Require at least one contact channel so the prospect is reachable/identifiable.
    if (!phone && !email) {
      throw new AgentKycAccessError(
        "contact_required",
        400,
        "กรุณาระบุเบอร์โทรหรืออีเมลอย่างน้อยหนึ่งช่อง",
      );
    }

    // --- Dedupe against existing accounts ---
    // A matching User means this person already has an account; the agent should
    // use the per-vendor flow instead, and finalize would otherwise collide with
    // the unique email/phone constraints.
    const existing = await prisma.user.findFirst({
      where: {
        OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
      },
      select: { id: true },
    });
    if (existing) {
      throw new AgentKycAccessError(
        "user_already_exists",
        409,
        "มีบัญชีผู้ใช้ที่ใช้อีเมลหรือเบอร์โทรนี้อยู่แล้ว หากเป็น Vendor ของคุณ ให้สร้าง session จากรายการด้านล่างแทน",
      );
    }

    // --- Cap concurrent in-flight prospect sessions ---
    const activeCount = await prisma.wizardSession.count({
      where: {
        agentId: agent.id,
        userId: null,
        terminalAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (activeCount >= MAX_ACTIVE_PROSPECT_SESSIONS) {
      throw new AgentKycAccessError(
        "too_many_active_sessions",
        429,
        `มี session ที่ยังไม่เสร็จมากเกินไป (สูงสุด ${MAX_ACTIVE_PROSPECT_SESSIONS}) กรุณาดำเนินการของเดิมให้เสร็จก่อน`,
      );
    }

    const targetProfile = { name, phone, email, note };

    const session = await runWithKycActor(
      { actor: agentActor(agent.id), evidenceSource: "agent_upload" },
      () =>
        createWizardSession({
          userId: null,
          agentId: agent.id,
          metadata: {
            entry: "agent_assisted_kyc",
            mode: "prospective_vendor",
            createdByAgentId: agent.id,
            createdByAgentUserId: agent.userId,
            targetProfile,
          },
        }),
    );

    return NextResponse.json({
      ok: true,
      session_id: session.id,
      state: session.state,
      targetProfile,
      resume_url: `/agent/kyc/${session.id}`,
      expires_at: session.expiresAt,
    });
  } catch (error) {
    return agentAccessErrorResponse(error);
  }
}
