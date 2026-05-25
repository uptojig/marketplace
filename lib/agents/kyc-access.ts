import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ActiveAgentContext {
  userId: string;
  agent: {
    id: string;
    userId: string;
    status: string;
    linkCode: string;
    displayName: string;
  };
}

export class AgentKycAccessError extends Error {
  constructor(
    public code: string,
    public status: number,
    message = code,
  ) {
    super(message);
    this.name = "AgentKycAccessError";
  }
}

export function agentActor(agentId: string) {
  return `agent:${agentId}` as const;
}

export function agentAccessErrorResponse(error: unknown) {
  if (error instanceof AgentKycAccessError) {
    return NextResponse.json(
      { ok: false, error: error.code, detail: error.message },
      { status: error.status },
    );
  }
  const message = error instanceof Error ? error.message : String(error);
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

export async function requireActiveAgent(): Promise<ActiveAgentContext> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AgentKycAccessError("unauthorized", 401);
  }

  const agent = await prisma.agent.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      userId: true,
      status: true,
      linkCode: true,
      displayName: true,
    },
  });

  if (!agent || agent.status !== "ACTIVE") {
    throw new AgentKycAccessError("agent_not_found_or_inactive", 403);
  }

  return { userId: session.user.id, agent };
}

export async function requireAgentVendor(agentId: string, vendorId: string) {
  const vendor = await prisma.user.findFirst({
    where: { id: vendorId, agentId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      agentId: true,
    },
  });

  if (!vendor) {
    throw new AgentKycAccessError("vendor_not_found_or_not_yours", 404);
  }

  return vendor;
}

export async function requireAgentKycSession(agentId: string, sessionId: string) {
  const session = await prisma.wizardSession.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          agentId: true,
        },
      },
      auditLogs: {
        orderBy: { ts: "desc" },
        take: 1,
        select: { actor: true, event: true, ts: true },
      },
    },
  });

  if (!session) {
    throw new AgentKycAccessError("kyc_session_not_found", 404);
  }

  const belongsToAgent = session.agentId === agentId || session.user?.agentId === agentId;
  const boundToAnotherAgent = Boolean(session.agentId && session.agentId !== agentId);
  const userBoundToAnotherAgent = Boolean(session.user?.agentId && session.user.agentId !== agentId);

  if (!belongsToAgent || boundToAnotherAgent || userBoundToAnotherAgent) {
    throw new AgentKycAccessError("kyc_session_not_yours", 404);
  }

  return session;
}
