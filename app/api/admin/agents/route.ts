import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeLinkCode, isValidLinkCodeFormat, generateLinkCode } from "@/lib/agents/link-code";

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

// GET /api/admin/agents - List all agents
export async function GET() {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const agents = await prisma.agent.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            vendors: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map database result to return compatible owner object for frontend
    const mappedAgents = agents.map((a) => ({
      id: a.id,
      displayName: a.displayName,
      linkCode: a.linkCode,
      status: a.status,
      createdAt: a.createdAt,
      owner: {
        name: a.user.name,
        email: a.user.email,
      },
      _count: a._count,
    }));

    return NextResponse.json({ ok: true, agents: mappedAgents });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// POST /api/admin/agents - Admin directly creates an agent
export async function POST(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { ownerId } = body;

    if (!ownerId) {
      return NextResponse.json({ ok: false, error: "owner_id_required", detail: "กรุณาระบุ User ID เจ้าของตัวแทน" }, { status: 400 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      include: { agentProfile: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "user_not_found", detail: "ไม่พบข้อมูลผู้ใช้ในระบบ" }, { status: 404 });
    }

    if (user.agentProfile) {
      return NextResponse.json({ ok: false, error: "already_agent", detail: "ผู้ใช้นี้ได้รับการแต่งตั้งเป็นตัวแทนอยู่แล้ว" }, { status: 400 });
    }

    let linkCode = body.linkCode ? String(body.linkCode).trim() : null;
    if (linkCode) {
      const normalized = normalizeLinkCode(linkCode);
      if (!isValidLinkCodeFormat(normalized)) {
        return NextResponse.json({ ok: false, error: "invalid_link_code", detail: "Link Code ไม่ถูกต้อง" }, { status: 400 });
      }

      // Check duplicate
      const duplicate = await prisma.agent.findFirst({
        where: { linkCode: normalized },
      });
      if (duplicate) {
        return NextResponse.json({ ok: false, error: "duplicate_link_code", detail: "Link Code นี้ถูกใช้งานแล้ว" }, { status: 400 });
      }
      linkCode = normalized;
    } else {
      // Auto generate unique code
      let unique = false;
      let attempts = 0;
      while (!unique && attempts < 5) {
        const potential = generateLinkCode();
        const exists = await prisma.agent.findFirst({ where: { linkCode: potential } });
        if (!exists) {
          linkCode = potential;
          unique = true;
        }
        attempts++;
      }
      if (!linkCode) {
        return NextResponse.json({ ok: false, error: "generation_failed", detail: "ไม่สามารถสุ่ม Link Code ได้ กรุณาระบุรหัสด้วยตัวเอง" }, { status: 500 });
      }
    }

    const displayName = body.displayName ? String(body.displayName).trim() : (user.name || user.email || "ตัวแทนแนะนำร้านค้า");

    // Start transaction to update user role and create Agent profile
    const result = await prisma.$transaction(async (tx) => {
      // Update user role to AGENT
      await tx.user.update({
        where: { id: ownerId },
        data: { role: "AGENT" },
      });

      // Create agent profile
      const newAgent = await tx.agent.create({
        data: {
          userId: ownerId,
          displayName,
          linkCode: linkCode!,
          status: "ACTIVE", // Admin created is ACTIVE by default
        },
      });

      return newAgent;
    });

    return NextResponse.json({ ok: true, agent: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
