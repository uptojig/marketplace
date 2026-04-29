import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WebhookSource } from "@prisma/client";

/**
 * GET /api/admin/webhook-logs
 *
 * List recent webhook logs for debugging and verification.
 *
 * Query params:
 *   - limit: number (default 50)
 *   - source: "ANYPAY" | "CJ" | "ALIEXPRESS"
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const source = url.searchParams.get("source") as WebhookSource | null;

  try {
    const logs = await prisma.webhookLog.findMany({
      where: source ? { source } : undefined,
      orderBy: { receivedAt: "desc" },
      take: Math.min(limit, 200),
    });

    const formatted = logs.map((l) => {
      const headers = l.headersJson as Record<string, unknown>;
      return {
        id: l.id,
        source: l.source,
        endpoint: l.endpoint,
        clientIp: headers?.clientIp ?? "unknown",
        domain: headers?.domain ?? "unknown",
        signatureValid: l.signatureValid,
        processed: l.processed,
        processingError: l.processingError,
        receivedAt: l.receivedAt,
        bodyPreview: JSON.stringify(l.bodyJson).slice(0, 200),
      };
    });

    return NextResponse.json({
      ok: true,
      count: formatted.length,
      logs: formatted,
    });
  } catch (err) {
    console.error("[admin/webhook-logs]", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 },
    );
  }
}
