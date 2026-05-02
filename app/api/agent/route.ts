import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  AgentNotConfiguredError,
  AgentUpstreamError,
  runAgent,
} from "@/lib/agent-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  prompt?: string;
  title?: string;
}

/**
 * POST /api/agent — proxy to PromptPage's managed-agent endpoint.
 *
 * Browser sends { prompt, title } here. We auth-check the marketplace
 * session, then forward to PromptPage with the Bearer token (kept
 * server-side, never exposed to the client). The NDJSON stream is
 * piped straight back so client-side fetch() can read it line by line.
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
        } else if (err instanceof AgentUpstreamError) {
          write({
            type: "_error",
            message: `upstream_${err.status}`,
            detail: err.bodyText.slice(0, 500),
          });
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
