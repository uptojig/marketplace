import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeLinkCode, isValidLinkCodeFormat } from "@/lib/agents/link-code";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Validates an access code carried by an invite URL (?c=). Returns a
 * boolean verdict only — it never reveals who issued the code. Lives on a
 * neutral path (not /api/agents/*) so the referral mechanism is not
 * observable in the client network tab.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });
  }

  const normalized = normalizeLinkCode(code);

  if (!isValidLinkCodeFormat(normalized)) {
    return NextResponse.json({ ok: false, error: "invalid_format" }, { status: 400 });
  }

  const issuer = await prisma.agent.findUnique({
    where: { linkCode: normalized },
    select: { status: true },
  });

  if (!issuer || issuer.status !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
