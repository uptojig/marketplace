import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!agent) {
      return NextResponse.json({ ok: false, error: "agent_not_found" }, { status: 404 });
    }

    const vendors = await prisma.user.findMany({
      where: { agentId: agent.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        kycSessions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            state: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map into a simpler format for client consumption
    const list = vendors.map((v) => {
      const latestKyc = v.kycSessions[0] ?? null;
      return {
        id: v.id,
        name: v.name,
        email: v.email,
        createdAt: v.createdAt,
        role: v.role,
        stores: v.store ? [v.store] : [],
        kycStatus: latestKyc ? latestKyc.state : "NOT_STARTED",
        kycUpdatedAt: latestKyc ? latestKyc.updatedAt : null,
      };
    });

    return NextResponse.json({ ok: true, vendors: list });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
