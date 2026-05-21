import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper to check admin access
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

// PATCH /api/admin/agents/[id] - Admin updates agent details or status
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { status, displayName } = body;

    const agent = await prisma.agent.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!agent) {
      return NextResponse.json({ ok: false, error: "agent_not_found" }, { status: 404 });
    }

    const dataToUpdate: Record<string, any> = {};

    if (status && ["PENDING_APPROVAL", "ACTIVE", "REJECTED", "SUSPENDED"].includes(status)) {
      dataToUpdate.status = status;
    }

    if (typeof displayName === "string") {
      const name = displayName.trim();
      if (name) {
        dataToUpdate.displayName = name;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // If we are activating a pending agent, ensure their user role is updated to AGENT
      if (status === "ACTIVE") {
        await tx.user.update({
          where: { id: agent.userId },
          data: { role: "AGENT" },
        });
      }

      // Update Agent record
      return tx.agent.update({
        where: { id },
        data: dataToUpdate,
      });
    });

    return NextResponse.json({ ok: true, agent: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/agents/[id] - Admin removes agent profile
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const { id } = params;

    const agent = await prisma.agent.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!agent) {
      return NextResponse.json({ ok: false, error: "agent_not_found" }, { status: 404 });
    }

    await prisma.$transaction([
      // Delete agent record
      prisma.agent.delete({
        where: { id },
      }),
      // Revert user role to CUSTOMER (or they will lose AGENT role)
      prisma.user.update({
        where: { id: agent.userId },
        data: { role: "CUSTOMER" },
      }),
    ]);

    return NextResponse.json({ ok: true, message: "Agent deleted successfully" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
