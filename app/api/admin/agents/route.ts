import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeLinkCode, isValidLinkCodeFormat, generateLinkCode } from "@/lib/agents/link-code";

export const runtime = "nodejs";
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/admin/agents - Admin appoints an agent.
//
// Two modes (chosen by the shape of the body):
//   • Existing user — { ownerId, displayName?, linkCode? }
//       Promotes an existing User row to AGENT.
//   • New account   — { email, password, displayName?, linkCode? }
//       Creates a brand-new User (role AGENT, with a bcrypt password so
//       they can sign in immediately via /signin) and the Agent profile.
export async function POST(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const isNewAccount = !body.ownerId;

    // ── Validate mode-specific inputs ────────────────────────────────
    let ownerUser: { id: string; name: string | null; email: string | null } | null = null;
    let newEmail = "";
    let passwordHash: string | null = null;

    if (isNewAccount) {
      newEmail = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      if (!EMAIL_RE.test(newEmail)) {
        return NextResponse.json({ ok: false, error: "invalid_email", detail: "กรุณากรอกอีเมลให้ถูกต้อง" }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ ok: false, error: "weak_password", detail: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
      }
      // Friendly pre-check; the unique constraint (P2002) below is the
      // real guard against a race.
      const existing = await prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } });
      if (existing) {
        return NextResponse.json(
          { ok: false, error: "email_already_in_use", detail: "อีเมลนี้มีบัญชีอยู่แล้ว — ให้เลือกจากรายการสมาชิกที่มีอยู่แทน" },
          { status: 409 },
        );
      }
      passwordHash = await bcrypt.hash(password, 12);
    } else {
      const user = await prisma.user.findUnique({
        where: { id: body.ownerId },
        include: { agentProfile: true },
      });
      if (!user) {
        return NextResponse.json({ ok: false, error: "user_not_found", detail: "ไม่พบข้อมูลผู้ใช้ในระบบ" }, { status: 404 });
      }
      if (user.agentProfile) {
        return NextResponse.json({ ok: false, error: "already_agent", detail: "ผู้ใช้นี้ได้รับการแต่งตั้งเป็นตัวแทนอยู่แล้ว" }, { status: 400 });
      }
      ownerUser = { id: user.id, name: user.name, email: user.email };
    }

    // ── Resolve link code (shared by both modes) ─────────────────────
    let linkCode = body.linkCode ? String(body.linkCode).trim() : null;
    if (linkCode) {
      const normalized = normalizeLinkCode(linkCode);
      if (!isValidLinkCodeFormat(normalized)) {
        return NextResponse.json({ ok: false, error: "invalid_link_code", detail: "Link Code ไม่ถูกต้อง" }, { status: 400 });
      }
      const duplicate = await prisma.agent.findFirst({ where: { linkCode: normalized } });
      if (duplicate) {
        return NextResponse.json({ ok: false, error: "duplicate_link_code", detail: "Link Code นี้ถูกใช้งานแล้ว" }, { status: 400 });
      }
      linkCode = normalized;
    } else {
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

    const explicitName = body.displayName ? String(body.displayName).trim() : "";
    const displayName =
      explicitName ||
      (isNewAccount ? newEmail : ownerUser!.name || ownerUser!.email) ||
      "ตัวแทนแนะนำร้านค้า";

    // ── Create within a transaction ──────────────────────────────────
    try {
      const result = await prisma.$transaction(async (tx) => {
        let userId: string;
        if (isNewAccount) {
          const created = await tx.user.create({
            data: {
              email: newEmail,
              name: explicitName || null,
              role: "AGENT",
              passwordHash,
            },
            select: { id: true },
          });
          userId = created.id;
        } else {
          await tx.user.update({ where: { id: ownerUser!.id }, data: { role: "AGENT" } });
          userId = ownerUser!.id;
        }

        return tx.agent.create({
          data: {
            userId,
            displayName,
            linkCode: linkCode!,
            status: "ACTIVE", // Admin-created agents are ACTIVE by default
          },
        });
      });

      return NextResponse.json({ ok: true, agent: result });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json(
          { ok: false, error: "email_already_in_use", detail: "อีเมลนี้มีบัญชีอยู่แล้ว — ให้เลือกจากรายการสมาชิกที่มีอยู่แทน" },
          { status: 409 },
        );
      }
      throw e;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
