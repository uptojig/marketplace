import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { generateLinkCode } from "@/lib/agents/link-code";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(200),
  phone: z.string().trim().max(30).optional(),
  lineId: z.string().trim().max(50).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, name, password, phone, lineId } = parsed.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    return NextResponse.json(
      {
        error: "email_already_in_use",
        detail: "อีเมลนี้ถูกใช้งานแล้วในระบบ",
      },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const initialLinkCode = generateLinkCode();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User with role AGENT
      const user = await tx.user.create({
        data: {
          email,
          name,
          role: "AGENT",
          passwordHash,
          phone: phone || null,
        },
      });

      // 2. Create Agent entry (status: PENDING_APPROVAL)
      const agent = await tx.agent.create({
        data: {
          userId: user.id,
          linkCode: initialLinkCode,
          displayName: name,
          status: "PENDING_APPROVAL",
          phone: phone || null,
          lineId: lineId || null,
        },
      });

      return { user, agent };
    });

    await audit("agent.register", {
      targetType: "Agent",
      targetId: result.agent.id,
      metadata: {
        email: result.user.email,
        displayName: result.agent.displayName,
        linkCode: result.agent.linkCode,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message: "สมัครสมาชิกเป็นตัวแทนสำเร็จ กรุณารอผู้ดูแลระบบอนุมัติบัญชีของคุณ",
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        {
          error: "link_code_collision",
          detail: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        },
        { status: 409 }
      );
    }
    throw e;
  }
}
