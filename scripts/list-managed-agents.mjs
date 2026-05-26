#!/usr/bin/env node
/**
 * List all Managed Agents + Environments in your Anthropic workspace.
 *
 * Use this when you've lost track of `ANTHROPIC_AGENT_ID` /
 * `ANTHROPIC_ENVIRONMENT_ID` (e.g., to reconnect a deployment after
 * losing the .env, or to confirm an agent the maketplace landing
 * pipeline expects is still alive).
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/list-managed-agents.mjs
 *
 * Picks up the API key from .env / .env.local automatically if you
 * have dotenv installed; otherwise just `export` it inline.
 */
import Anthropic from "@anthropic-ai/sdk";

const MANAGED_BETAS = ["managed-agents-2026-04-01"];

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) fail("ANTHROPIC_API_KEY is not set");

const client = new Anthropic({ apiKey });

async function main() {
  console.log("→ Fetching Managed Agents...\n");

  // List environments first since each agent points at one. Page
  // through if there are more than the default 20.
  const envsRes = await client.beta.environments.list({ betas: MANAGED_BETAS });
  const envs = envsRes.data ?? [];
  console.log(`Environments (${envs.length}):`);
  for (const e of envs) {
    console.log(`  ${e.id}  ${e.name ?? "(no name)"}`);
  }
  console.log("");

  const agentsRes = await client.beta.agents.list({ betas: MANAGED_BETAS });
  const agents = agentsRes.data ?? [];
  console.log(`Agents (${agents.length}):`);
  for (const a of agents) {
    const envName =
      envs.find((e) => e.id === a.environment_id)?.name ?? "(unknown)";
    console.log(
      `  ${a.id}  ${a.display_name ?? "(no name)"}  → env=${a.environment_id} (${envName})`,
    );
  }
  console.log("");

  // Highlight the one the marketplace expects so it's easy to spot.
  const expected = "agent_011Cad9Q8wyJdeXwucADnh8t";
  const match = agents.find((a) => a.id === expected);
  if (match) {
    console.log("✓ Marketplace landing-builder found. Set in droplet env / CI secrets:");
    console.log(`    ANTHROPIC_AGENT_ID=${match.id}`);
    console.log(`    ANTHROPIC_ENVIRONMENT_ID=${match.environment_id}`);
  } else {
    console.log(
      `ℹ Marketplace expects agent_id=${expected} but it isn't in this workspace.`,
    );
    console.log(
      "  Either you're authed against a different Anthropic workspace,",
    );
    console.log(
      "  or the agent was deleted — pick another from the list above,",
    );
    console.log(
      "  or recreate it via promptpage's setup script.",
    );
  }
}

main().catch((err) => fail(err?.message ?? String(err)));
