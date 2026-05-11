// GET /api/cron/provisioner-tick
//
// Triggered every minute by an external scheduler (Vercel cron, GitHub
// Actions, or DO scheduled function). Drains queued provisioning jobs.
//
// Auth: shared secret via bearer token. Set CRON_SECRET in env, then
// configure the scheduler with `Authorization: Bearer $CRON_SECRET`.

import { NextResponse } from "next/server";
import { drainQueue } from "@/lib/provisioner/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel: extend timeout to 60s

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get("authorization") ?? "";
    const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
    if (token !== cronSecret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const processed = await drainQueue({ maxJobs: 20 });
  return NextResponse.json({ ok: true, processed });
}
