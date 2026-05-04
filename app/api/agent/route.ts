import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AgentNotConfiguredError, runAgent } from "@/lib/agent-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  prompt?: string;
  title?: string;
}

/**
 * POST /api/agent — call Claude (Opus 4.7) directly.
 *
 * Browser sends { prompt, title }. We auth-check the marketplace session,
 * then stream the model's structured-output JSON back as NDJSON: one event
 * per line so the client can render thinking + text deltas live and pick
 * up the validated `_schema` event when generation finishes.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "missing_prompt" }, { status: 400 });
  }
  if (prompt.length > 8000) {
    return NextResponse.json({ error: "prompt_too_long" }, { status: 400 });
  }
  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 200)
      : undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const write = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        for await (const event of runAgent({
          prompt,
          title,
          signal: req.signal,
        })) {
          write(event);
        }
      } catch (err) {
        if (err instanceof AgentNotConfiguredError) {
          write({ type: "_error", message: "agent_not_configured" });
        } else {
          write({
            type: "_error",
            message: err instanceof Error ? err.message : "stream_failed",
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
