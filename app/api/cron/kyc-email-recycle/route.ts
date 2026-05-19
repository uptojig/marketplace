import { NextResponse } from "next/server";
import { recycleExpiredKycEmailLeases } from "@/lib/kyc/email-pool";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get("authorization") ?? "";
    const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
    if (token !== cronSecret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const recycled = await recycleExpiredKycEmailLeases();
  return NextResponse.json({
    ok: true,
    recycled,
    ttl_minutes: 25,
  });
}

