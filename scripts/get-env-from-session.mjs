#!/usr/bin/env node
/**
 * Pull `environment_id` from a managed-agent session.
 *
 * The Anthropic Console URL gives you session_id (sesn_...) but not the
 * env_id directly. The session object stores both — fetching it tells
 * us which environment the marketplace deployment needs to point at.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... \
 *     node scripts/get-env-from-session.mjs <session_id>
 */
import Anthropic from "@anthropic-ai/sdk";

const sessionId = process.argv[2];
if (!sessionId) {
  console.error("Usage: node scripts/get-env-from-session.mjs <session_id>");
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ANTHROPIC_API_KEY is not set");
  process.exit(1);
}

const client = new Anthropic({ apiKey });

const session = await client.beta.sessions.retrieve(sessionId, {
  betas: ["managed-agents-2026-04-01"],
});

// SDK returns `agent` as an object ({id, name, description, model, ...})
// not a plain string — pull `.id` off it. Older API versions used a flat
// `agent_id` field; fall back to that to stay forward-compatible.
const agentId =
  (session.agent && typeof session.agent === "object" ? session.agent.id : session.agent) ??
  session.agent_id ??
  "(missing)";

console.log(`Session ${sessionId}:`);
console.log(`  agent_id        = ${agentId}`);
console.log(`  environment_id  = ${session.environment_id ?? "(missing)"}`);
console.log(`  title           = ${session.title ?? "(none)"}`);
console.log("");
console.log("→ Vercel env vars to set:");
console.log(`    ANTHROPIC_AGENT_ID=${agentId}`);
console.log(`    ANTHROPIC_ENVIRONMENT_ID=${session.environment_id}`);
