#!/usr/bin/env node
/**
 * One-time setup for the Managed Agent that powers /api/agent.
 *
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/setup-managed-agent.mjs
 *
 * Output: prints MANAGED_AGENT_ID + MANAGED_ENV_ID for your env vars.
 *
 * Re-running this script creates a NEW agent/env every time. To update an
 * existing agent's system prompt, use `client.beta.agents.update(id, ...)`
 * instead — every update bumps a version, sessions can pin to a specific one.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  AGENT_MODEL,
  SYSTEM_PROMPT,
  GENERATE_PAGE_SCHEMA_TOOL,
} from "../lib/agent/config.ts";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ANTHROPIC_API_KEY is not set");
  process.exit(1);
}

const client = new Anthropic({ apiKey });

console.log("Creating environment...");
const environment = await client.beta.environments.create({
  name: `marketplace-shop-builder-${Date.now()}`,
  config: {
    type: "cloud",
    networking: { type: "unrestricted" },
  },
});
console.log("✓ Environment:", environment.id);

console.log("\nCreating agent...");
const agent = await client.beta.agents.create({
  name: "Marketplace Shop Builder v12",
  model: AGENT_MODEL,
  system: SYSTEM_PROMPT,
  tools: [
    {
      type: "custom",
      name: GENERATE_PAGE_SCHEMA_TOOL.name,
      description: GENERATE_PAGE_SCHEMA_TOOL.description,
      input_schema: GENERATE_PAGE_SCHEMA_TOOL.input_schema,
    },
  ],
});
console.log("✓ Agent:", agent.id, "(version", agent.version + ")");

console.log("\n────────────────────────────────────────────────");
console.log("Add to your .env.local AND droplet env / CI secrets:");
console.log("────────────────────────────────────────────────");
console.log(`MANAGED_ENV_ID=${environment.id}`);
console.log(`MANAGED_AGENT_ID=${agent.id}`);
console.log("────────────────────────────────────────────────");
