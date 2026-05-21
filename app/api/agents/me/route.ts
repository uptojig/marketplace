import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeLinkCode, isValidLinkCodeFormat } from "@/lib/agents/link-code";

export const dynamic = "force-dynamic";

// GET agent profile details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ ok: false, error: "agent_not_found" }, { status: 404 });
    }

    // Map database user relation to owner for dashboard compatibility
    const mappedAgent = {
      ...agent,
      owner: {
        name: agent.user.name,
        email: agent.user.email,
      },
    };

    return NextResponse.json({ ok: true, agent: mappedAgent });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// PATCH agent profile details
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ ok: false, error: "agent_not_found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const dataToUpdate: Record<string, any> = {};

    if (typeof body.displayName === "string") {
      const name = body.displayName.trim();
      if (!name) {
        return NextResponse.json({ ok: false, error: "invalid_name", detail: "ชื่อผู้แนะนำต้องไม่ว่างเปล่า" }, { status: 400 });
      }
      dataToUpdate.displayName = name;
    }

    if (typeof body.linkCode === "string") {
      const code = body.linkCode.trim();
      const normalized = normalizeLinkCode(code);
      if (!isValidLinkCodeFormat(normalized)) {
        return NextResponse.json(
          { ok: false, error: "invalid_link_code", detail: "Link Code ต้องยาว 3-15 ตัวอักษร และประกอบด้วยตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น" },
          { status: 400 }
        );
      }

      // Check duplicate
      const duplicate = await prisma.agent.findFirst({
        where: {
          linkCode: normalized,
          NOT: { userId: session.user.id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { ok: false, error: "duplicate_link_code", detail: "Link Code นี้ถูกใช้งานแล้ว กรุณาลองใช้คำอื่น" },
          { status: 400 }
        );
      }

      dataToUpdate.linkCode = normalized;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      const agentWithUser = await prisma.agent.findUnique({
        where: { userId: session.user.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      if (!agentWithUser) {
        return NextResponse.json({ ok: false, error: "agent_not_found" }, { status: 404 });
      }
      const mappedAgent = {
        ...agentWithUser,
        owner: {
          name: agentWithUser.user.name,
          email: agentWithUser.user.email,
        },
      };
      return NextResponse.json({ ok: true, agent: mappedAgent });
    }

    const updatedAgent = await prisma.agent.update({
      where: { userId: session.user.id },
      data: dataToUpdate,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const mappedUpdatedAgent = {
      ...updatedAgent,
      owner: {
        name: updatedAgent.user.name,
        email: updatedAgent.user.email,
      },
    };

    return NextResponse.json({ ok: true, agent: mappedUpdatedAgent });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
