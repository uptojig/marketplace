import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeLinkCode, isValidLinkCodeFormat } from "@/lib/agents/link-code";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { ok: false, error: "missing_code", detail: "กรุณาระบุ Link Code" },
      { status: 400 }
    );
  }

  const normalized = normalizeLinkCode(code);

  if (!isValidLinkCodeFormat(normalized)) {
    return NextResponse.json(
      { ok: false, error: "invalid_format", detail: "รูปแบบ Link Code ไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const agent = await prisma.agent.findUnique({
    where: { linkCode: normalized },
    select: {
      id: true,
      displayName: true,
      status: true,
    },
  });

  if (!agent || agent.status !== "ACTIVE") {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_code",
        detail: "Link Code นี้ไม่ถูกต้อง หรือ ตัวแทนยังไม่ได้รับการอนุมัติ",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    agentId: agent.id,
    agentName: agent.displayName,
  });
}
