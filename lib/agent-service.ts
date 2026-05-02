/**
 * Server-side client for PromptPage's managed-agent API.
 *
 * Streams NDJSON events back from /api/managed-agents/run. Caller iterates
 * the async generator and forwards events to its own UI / Response stream.
 *
 * The Bearer token is read from PROMPTPAGE_AGENT_API_KEY at call time so
 * this module is safe to import from server components/route handlers but
 * MUST NOT be bundled into client code.
 */

export interface AgentBlock {
  blockType: string;
  content: Record<string, unknown>;
}

export interface GeneratedPageSchema {
  title: string;
  slug?: string;
  description?: string;
  themeVariant: "minimal" | "cute";
  blocks: AgentBlock[];
  reasoning: string;
}

export type AgentEvent =
  | { type: "_session"; id: string }
  | { type: "_schema"; schema: GeneratedPageSchema }
  | { type: "_done"; terminal_via_tool?: boolean }
  | { type: "_error"; message: string }
  // Anthropic-side events forwarded verbatim — only `type` is guaranteed.
  | { type: string; [key: string]: unknown };

export interface RunAgentInput {
  prompt: string;
  title?: string;
  signal?: AbortSignal;
}

export class AgentNotConfiguredError extends Error {
  constructor() {
    super("PROMPTPAGE_AGENT_API_KEY or PROMPTPAGE_AGENT_URL is not set");
    this.name = "AgentNotConfiguredError";
  }
}

export class AgentUpstreamError extends Error {
  constructor(
    public status: number,
    public bodyText: string,
  ) {
    super(`PromptPage agent returned ${status}`);
    this.name = "AgentUpstreamError";
  }
}

/**
 * POST to PromptPage and yield each NDJSON line as a parsed event.
 * Lines that fail to parse are dropped silently (the upstream event log
 * occasionally contains partial chunks at flush time).
 */
export async function* runAgent(input: RunAgentInput): AsyncGenerator<AgentEvent> {
  const url = process.env.PROMPTPAGE_AGENT_URL;
  const key = process.env.PROMPTPAGE_AGENT_API_KEY;
  if (!url || !key) throw new AgentNotConfiguredError();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: input.prompt,
      ...(input.title ? { title: input.title } : {}),
    }),
    signal: input.signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new AgentUpstreamError(res.status, text);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      // NDJSON: split on newline, last fragment may be incomplete.
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          yield JSON.parse(trimmed) as AgentEvent;
        } catch {
          // Drop malformed line; upstream is the source of truth.
        }
      }
    }
    // Flush trailing fragment if it's a complete object.
    const tail = buf.trim();
    if (tail) {
      try {
        yield JSON.parse(tail) as AgentEvent;
      } catch {
        // ignore
      }
    }
  } finally {
    reader.releaseLock();
  }
}
