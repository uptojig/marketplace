import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createWizardSession } from "@/lib/kyc/wizard-state";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const auth = await getServerSession(authOptions);
    const userId = auth?.user?.id ?? null;

    const body = req.headers.get("content-type")?.includes("application/json")
      ? ((await req.json()) as Record<string, unknown>)
      : {};

    const metadata: Record<string, unknown> = {
      userAgent: req.headers.get("user-agent") ?? null,
      ...(body.metadata && typeof body.metadata === "object"
        ? (body.metadata as Record<string, unknown>)
        : {}),
    };

    let agentId: string | null = null;

    if (userId) {
      // Logged-in user: check role / agent association
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { agentId: true, role: true },
      });

      const isBypassedRole = dbUser?.role === "ADMIN" || dbUser?.role === "AGENT";
      const hasAgentBound = !!dbUser?.agentId;
      agentId = dbUser?.agentId ?? null;

      if (!isBypassedRole && !hasAgentBound) {
        const agentLinkCode = body.agentLinkCode;
        if (!agentLinkCode) {
          return NextResponse.json(
            { ok: false, error: "agent_code_required", detail: "กรุณาระบุ Link Code ของตัวแทนผู้แนะนำ" },
            { status: 400 }
          );
        }

        const agent = await prisma.agent.findUnique({
          where: { linkCode: String(agentLinkCode).trim().toUpperCase() },
          select: { id: true, status: true, linkCode: true },
        });

        if (!agent || agent.status !== "ACTIVE") {
          return NextResponse.json(
            { ok: false, error: "invalid_agent_code", detail: "Link Code ไม่ถูกต้อง หรือตัวแทนยังไม่ได้รับการอนุมัติ" },
            { status: 400 }
          );
        }

        agentId = agent.id;
        metadata.agentLinkCode = agent.linkCode;
      }
    } else {
      // Anonymous user: must provide valid agentLinkCode
      const agentLinkCode = body.agentLinkCode;
      if (!agentLinkCode) {
        return NextResponse.json(
          { ok: false, error: "agent_code_required", detail: "กรุณาระบุ Link Code ของตัวแทนผู้แนะนำ" },
          { status: 400 }
        );
      }

      const agent = await prisma.agent.findUnique({
        where: { linkCode: String(agentLinkCode).trim().toUpperCase() },
        select: { id: true, status: true, linkCode: true },
      });

      if (!agent || agent.status !== "ACTIVE") {
        return NextResponse.json(
          { ok: false, error: "invalid_agent_code", detail: "Link Code ไม่ถูกต้อง หรือตัวแทนยังไม่ได้รับการอนุมัติ" },
          { status: 400 }
        );
      }

      agentId = agent.id;
      metadata.agentLinkCode = agent.linkCode;
    }

    const session = await createWizardSession({
      userId,
      agentId,
      metadata,
    });

    return NextResponse.json({
      ok: true,
      session_id: session.id,
      state: session.state,
      resume_token: session.id,
      expires_at: session.expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
